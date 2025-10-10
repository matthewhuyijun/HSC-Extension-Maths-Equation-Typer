# E2 Typer AST - LaTeX to UnicodeMath Converter

A web-based tool for converting LaTeX mathematical expressions to Microsoft Word's UnicodeMath format.

## How to Use

### Running the Application

**Important:** This application uses ES6 modules which require a web server to function properly. You cannot simply open `index.html` directly in your browser.

#### Option 1: Using the provided script (recommended)
```bash
./serve.sh
```

Then open your browser to: http://localhost:8000

#### Option 2: Using Python directly
```bash
python3 -m http.server 8000
```

Then open your browser to: http://localhost:8000

### Using the Converter

1. Type or paste LaTeX expressions in the editor
2. The converter will automatically:
   - Parse the LaTeX
   - Convert to UnicodeMath format
   - Display the Word equation output
3. Copy the Word equation output and paste into Microsoft Word
4. In Word, it will automatically render as a proper equation

## Features

- Real-time LaTeX to UnicodeMath conversion
- Support for:
  - Fractions
  - Integrals, sums, products
  - Subscripts and superscripts
  - Greek letters
  - Trigonometric functions
  - Matrices
  - And much more!

## Troubleshooting

### "Loading converter..." message won't go away

This happens when you open `index.html` directly with the `file://` protocol. ES6 modules are blocked by browsers for security reasons when using `file://`.

**Solution:** Always serve the application through a local web server using one of the methods above.

### Module import errors in console

Make sure all JavaScript files in the `js/` directory are present:
- `app-bridge.js`
- `latex-parser.js`
- `ast-printer.js`
- `latex-converter.js`
- `latex-utils.js`
- `postprocessor.js`
- `symbol-maps.js`

## Architecture

The converter uses a modular architecture:

1. **Parser** (`latex-parser.js`) - Converts LaTeX string to Abstract Syntax Tree (AST)
2. **Printer** (`ast-printer.js`) - Converts AST to UnicodeMath string
3. **Post-processor** (`postprocessor.js`) - Applies final formatting refinements
4. **Bridge** (`app-bridge.js`) - Connects modular code to HTML inline scripts

## Development

The codebase uses ES6 modules for clean separation of concerns. When making changes, ensure:
- Exports are properly declared
- Imports use correct relative paths
- Test through a web server, not direct file opening
