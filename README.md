# js-slicer

The project aspires to create a library for construction of common program analysis structures (e.g. CFG, PDG),
as well as extensions for slicing of JS functions. Current version is under maintenance, involving refactoring of the CFG construction subsystem and providing simple utilities for visualization of generated graphs with the help of the GraphViz library.

# How to use

First you need to install the extension on VSCode, found here(add link when published). 
Then, open any javascript file and you will find a GenerateCFG button at the right of the top menu, alternatively you can hover over any supported javascript functions and click Generate CFG for (function name) on the context menu that appears.
Both methods of execution will open a new tab with the CFG result of the selected function.
