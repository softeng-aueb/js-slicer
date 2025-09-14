const vscode = require("vscode");
const CFGGenerator = require("./lib/control-flow-graph/CFGGenerator");
const Parser = require("./lib/code-parser-module/Parser");
const CFGVisualizer = require("./lib/control-flow-graph/CFGVisualizer");
const acorn = require("acorn");
const acornWalk = require("acorn-walk");

function activate(context) {
    const extensionUri = context.extensionUri;

    context.subscriptions.push(
        vscode.commands.registerCommand("js-slicer.generateCFG", generateCFG),
        vscode.languages.registerHoverProvider("javascript", { provideHover })
    );
}

async function generateCFG(qualifiedNameFromHover) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return vscode.window.showErrorMessage("Open a JavaScript file first.");

    const code = editor.document.getText();
    const allFunctions = findAllFunctionsWithMetadata(code);
    if (!allFunctions.length) return vscode.window.showInformationMessage("No JavaScript functions found in the file.");

    const selectedFunction = await pickFunction(allFunctions, qualifiedNameFromHover);
    if (!selectedFunction) return;

    try {
        const funcObj = parse(selectedFunction.code);
        const cfg = CFGGenerator.generateCfg2(funcObj, true);
        const dotGraph = CFGVisualizer.writeCFGToDot(cfg);
        showGraph(dotGraph, selectedFunction.qualifiedName);
    } catch (e) {
        vscode.window.showErrorMessage(`Error parsing function: ${e.message || e}`);
    }
}

async function pickFunction(allFunctions, qualifiedNameFromHover) {
    if (typeof qualifiedNameFromHover === "string") {
        return allFunctions.find((f) => f.qualifiedName === qualifiedNameFromHover);
    }

    const items = allFunctions.map((f) => ({
        label: `${f.name} (Line ${f.line})`,
        description: f.qualifiedName,
        detail: f.preview.slice(0, 80) + (f.code.length > 80 ? "..." : ""),
        func: f,
    }));

    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: "Select a function to generate CFG",
        matchOnDetail: true,
    });

    return picked?.func;
}

function showGraph(dot, title) {
    const panel = vscode.window.createWebviewPanel("jsSlicerGraph", `JS-Slicer CFG → ${title}`, vscode.ViewColumn.Two, { enableScripts: true });
    panel.webview.html = getWebviewContent(dot);
}

function provideHover(document, position) {
    const code = document.getText();
    const allFunctions = findAllFunctionsWithMetadata(code);

    const offset = document.offsetAt(position);
    const hoveredFunction = allFunctions.find((f) => {
        const start = document.offsetAt(new vscode.Position(f.line - 1, 0));
        const end = start + f.code.length;
        return offset >= start && offset <= end;
    });

    if (!hoveredFunction) return;

    const commandUri = `command:js-slicer.generateCFG?${encodeURIComponent(JSON.stringify(hoveredFunction.qualifiedName))}`;
    const markdown = new vscode.MarkdownString(`[Generate CFG for **${hoveredFunction.qualifiedName}**](${commandUri})`);
    markdown.isTrusted = true;

    return new vscode.Hover(markdown);
}

function deactivate() {}

/**
 *
 *  Helper Functions
 *
 */

function getWebviewContent(dot) {
    const escapedDot = dot.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
    return `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <title>CFG Graph</title>
                <style> body { padding: 0; margin: 0; } svg { width: 100%; height: 100vh; } </style>
                <script src="https://cdn.jsdelivr.net/npm/viz.js@2.1.2/viz.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/viz.js@2.1.2/full.render.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js"></script>

                </head>
                <body>
                <div id="graph"></div>
                <script>
                    const dot = \`${escapedDot}\`;
                    const viz = new Viz();
                    viz.renderSVGElement(dot)
                        .then(svg => {
                        document.getElementById("graph").appendChild(svg);
                        svgPanZoom(svg, {
                        zoomEnabled: true,
                        controlIconsEnabled: true,
                        fit: true,
                        center: true
                        });
                    })
                </script>
                </body>
                </html>
                `;
}

function findAllFunctionsWithMetadata(code) {
    const ast = acorn.parse(code, {
        ecmaVersion: 2020,
        locations: true,
        sourceType: "module",
    });

    const functions = [];

    acornWalk.fullAncestor(ast, (node, ancestors) => {
        let name = null;
        let type = null;
        let funcNode = null;

        if (node.type === "FunctionDeclaration" && node.id?.name) {
            name = node.id.name;
            type = "FunctionDeclaration";
            funcNode = node;
        } else if (
            node.type === "VariableDeclarator" &&
            node.id?.name &&
            ["FunctionExpression", "ArrowFunctionExpression"].includes(node.init?.type)
        ) {
            name = node.id.name;
            type = node.init.type;
            funcNode = node.init;
        } else if (
            (node.type === "MethodDefinition" || node.type === "Property") &&
            node.key?.name &&
            ["FunctionExpression", "ArrowFunctionExpression"].includes(node.value?.type)
        ) {
            name = node.key.name;
            type = "Class/Object Method";
            funcNode = node.value;
        }

        if (name && funcNode?.start != null && funcNode?.end != null) {
            const snippet = code.slice(funcNode.start, funcNode.end);
            const preview = snippet.split("\n")[0].trim();

            const qualified = getQualifiedName(ancestors, name);

            let finalCode = snippet;
            if (type === "FunctionExpression" && !funcNode.id) {
                finalCode = snippet.replace(/function(\s*\*?)\s*\(/, `function$1 ${name}(`);
            }

            functions.push({
                name,
                qualifiedName: qualified,
                code: finalCode,
                type,
                preview,
                line: funcNode.loc?.start?.line || 0,
            });
        }
    });

    return functions;
}

function parse(str) {
    return Parser.parse(str.split("\n"));
}

function getQualifiedName(ancestors, name) {
    const names = [];

    for (const node of ancestors) {
        if (node.type === "FunctionDeclaration" && node.id?.name) {
            names.push(node.id.name);
        } else if (node.type === "VariableDeclarator" && node.id?.name) {
            names.push(node.id.name);
        } else if (node.type === "MethodDefinition" && node.key?.name) {
            names.push(node.key.name);
        } else if (node.type === "Property" && node.key?.name) {
            names.push(node.key.name);
        } else if (node.type === "ClassDeclaration" && node.id?.name) {
            names.push(node.id.name);
        }
    }

    if (names.length === 0 || names[names.length - 1] !== name) {
        names.push(name);
    }

    return names.join(".");
}

module.exports = {
    activate,
    deactivate,
};
