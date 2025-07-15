const vscode = require("vscode");
const CFGGenerator = require("../control-flow-graph/CFGGenerator");
const Parser = require("../code-parser-module/Parser");
const CFGVisualizer = require("../control-flow-graph/CFGVisualizer");
const acorn = require("acorn");
const acornWalk = require("acorn-walk");

// This function will be run once after the extension is loaded
function activate(context) {
    let dotGraph, selectedFunctionName;
    const extensionUri = context.extensionUri;
    // main functionality of the extension
    const disposable = vscode.commands.registerCommand("js-slicer.generateCFG", async function () {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage("Open a JavaScript file first.");
            return;
        }

        const code = editor.document.getText();

        const allFunctions = findAllFunctionsWithMetadata(code);

        if (allFunctions.length === 0) {
            vscode.window.showInformationMessage("No functions found in the file.");
            return;
        }

        // Generate QuickPickItems with better labeling for duplicates
        const itemListShown = allFunctions.map((f) => ({
            label: `${f.name}  (Line ${f.line})`,
            description: `${f.type}`,
            detail: f.preview.slice(0, 80) + (f.code.length > 80 ? "..." : ""),
            func: f,
        }));

        const pickedFunctionItem = await vscode.window.showQuickPick(itemListShown, {
            placeHolder: "Select a function to generate CFG",
            matchOnDetail: true,
        });

        if (!pickedFunctionItem) return;

        const selectedFunction = pickedFunctionItem.func;

        try {
            let funcObj = parse(selectedFunction.code);
            let cfg = CFGGenerator.generateCfg2(funcObj, true);
            selectedFunctionName = pickedFunctionItem.label;
            dotGraph = CFGVisualizer.writeCFGToDot(cfg);

            showGraph(dotGraph);
        } catch (e) {
            vscode.window.showErrorMessage(`Error parsing function: ${e.message || e}`);
        }

        // show graph to user using webview panels
        function showGraph(dot) {
            const panel = vscode.window.createWebviewPanel("jsSlicerGraph", `JS-Slicer CFG -> ${selectedFunctionName}`, vscode.ViewColumn.Two, {
                enableScripts: true,
            });

            panel.webview.html = getWebviewContent(dot);
        }

        function getWebviewContent(dot) {
            const escapedDot = dot.replace(/`/g, "\\`");
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
    });

    // Find all functions in the current open js file and return them with some extra details
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
                let snippet = code.slice(funcNode.start, funcNode.end);

                // Inject name into anonymous function expressions for our parser to properly work
                if (type === "FunctionExpression" && !funcNode.id) {
                    snippet = snippet.replace(/^function\s*\(/, `function ${name}(`);
                }
                const preview = snippet.split("\n")[0].trim();
                functions.push({
                    name,
                    code: snippet,
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

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
