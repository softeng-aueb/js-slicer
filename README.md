# js-slicer

The project aspires to create a library for construction of common program analysis structures (e.g. CFG, PDG),
as well as extensions for slicing of JS functions. Current version is under maintenance, involving refactoring of the CFG construction subsystem and providing simple utilities for visualization of generated graphs with the help of the GraphViz library.

## Installation

Download the latest release of the extension:

[JS Slicer v0.1.1 (.vsix)](https://github.com/softeng-aueb/js-slicer/releases/latest)

Then install it in VS Code:

1. Open VS Code
2. Go to Extensions → … menu → _Install from VSIX…_
3. Select the downloaded file

## How to use

-   Open any JavaScript file.
-   You will find a **JS-Slicer CFG** button on the right of the top menu.
-   Alternatively, hover over any supported JavaScript function and select  
    **Generate CFG for (function name)** from the context menu.

Both methods will open a new tab with the CFG result of the selected function.

## Known Issues

-   Optional Chaining Operator and Nullish Coalescing Operator is not supported by recast in which the project depends on.
