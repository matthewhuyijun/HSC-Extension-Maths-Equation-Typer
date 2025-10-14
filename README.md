# 📐 E2 MathsTyper - MathML Edition

A clean, modern web app for typing LaTeX equations and converting them to MathML format.

---

## 🎯 Features

- ✅ **Visual LaTeX Editor** - Type math using MathLive's interactive editor
- ✅ **Live Preview** - See your equations rendered in real-time
- ✅ **MathML Export** - Copy clean MathML code to clipboard
- ✅ **Word-Compatible MathML** - Auto-fixes n-ary operators for Microsoft Word
- ✅ **LaTeX Export** - Copy raw LaTeX code
- ✅ **Dark Mode** - System-aware theme with manual override
- ✅ **Keyboard Shortcuts** - 100+ inline shortcuts for fast typing
- ✅ **Mobile Friendly** - Responsive design works on all devices

---

## 🚀 Quick Start

1. **Open** `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
2. **Type** your LaTeX equation in the "Rendered Input" field
3. **Copy** the generated MathML using the "Copy MathML" button
4. **Paste** the MathML wherever you need it

---

## 💡 Usage Examples

### Example 1: Simple Fraction
**Type:** `\frac{a}{b}`  
**Get MathML:** 
```xml
<math><mfrac><mi>a</mi><mi>b</mi></mfrac></math>
```

### Example 2: Quadratic Formula
**Type:** `x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}`  
**Get MathML:** Clean, standards-compliant MathML output

### Example 3: Integral
**Type:** `\int_{0}^{\infty} e^{-x} dx`  
**Get MathML:** Ready to use in documents and web pages

---

## 🎨 Interface

The app has four main areas:

1. **Rendered Input (Editable)** - Interactive math field powered by MathLive
2. **Raw LaTeX Input** - Plain text LaTeX code (editable)
3. **MathML Output** - Generated MathML (read-only)
4. **LaTeX Preview** - Visual preview rendered by MathJax

---

## ⌨️ Keyboard Shortcuts

Click the **"Shortcuts"** button in the header to see all available inline shortcuts.

### Popular Shortcuts:
- `alpha` → α
- `beta` → β
- `sqrt` → √
- `int` → ∫
- `sum` → Σ
- `infty` → ∞
- `RR` → ℝ
- `NN` → ℕ

---

## 🎨 Theme Options

Toggle between:
- ☀️ **Light Mode** - Clean white background
- 🌙 **Dark Mode** - Easy on the eyes
- 💻 **System** - Auto-match your OS theme

---

## 🔧 Technical Details

### Built With:
- **MathLive** (v0.98+) - Interactive math editor
- **MathJax** (v3) - LaTeX preview rendering
- **Lucide Icons** - Modern icon set
- **Pure HTML/CSS/JS** - No build tools required

### Browser Compatibility:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### No Installation Required:
- Just open `index.html` in your browser
- Works offline once loaded
- No server needed

---

## 📱 Mobile Support

Fully responsive design with:
- Touch-friendly buttons
- Hamburger menu for small screens
- Optimized math field sizing
- Mobile keyboard support

---

## 📝 Microsoft Word Compatibility

The app automatically post-processes MathML output to ensure it displays correctly in Microsoft Word without dotted placeholders.

### What Gets Fixed:

**N-ary Operators** (integrals ∫, sums ∑, products ∏) require their operands to be wrapped in `<mrow>` tags for Word to recognize them properly.

**Before (causes dotted placeholder in Word):**
```xml
<msubsup>
  <mo>∫</mo>
  <mi>b</mi>
  <mi>a</mi>
</msubsup>
<mi>f</mi>
<mo>(</mo>
<mi>x</mi>
<mo>)</mo>
```

**After (Word-compatible):**
```xml
<msubsup>
  <mo>∫</mo>
  <mi>b</mi>
  <mi>a</mi>
</msubsup>
<mrow>
  <mi>f</mi>
  <mo>(</mo>
  <mi>x</mi>
  <mo>)</mo>
</mrow>
```

### Supported Operators:

- **Integrals:** `∫` (U+222B) - with or without limits
- **Summations:** `∑` (U+2211) - with `<munderover>`, `<munder>`, etc.
- **Products:** `∏` (U+220F) - with `<munderover>`, `<munder>`, etc.

### Testing:

Run `debugNaryOperators()` in the browser console to test the n-ary operator wrapping:

```javascript
debugNaryOperators()
```

This will test various integrals, sums, and products to verify the MathML is Word-compatible.

---

## 🧹 Simplified Architecture

This version removes all Microsoft Word/OMML conversion logic and uses only:
- MathLive's built-in `convertLatexToMathMl()` function
- Standard MathML output
- No external dependencies beyond CDN libraries

### Files You Can Delete:
The `js/` directory contains old Word converter modules that are **no longer needed**:
- `ast-printer.js`
- `latex-converter.js`
- `latex-parser.js`
- `latex-utils.js`
- `postprocessor.js`
- `symbol-maps.js`

These can be safely deleted as the app now uses MathLive's native converter.

---

## 🐛 Troubleshooting

### MathML output shows "MathLive not ready"
- **Solution:** Wait a moment for MathLive to load, then type again

### Copy button doesn't work
- **Solution:** Use HTTPS or localhost (clipboard API requires secure context)
- **Alternative:** Manually select and copy the MathML text

### LaTeX preview not rendering
- **Solution:** Check console for MathJax errors, ensure internet connection

---

## 📄 License

Free to use and modify. Built with open-source libraries.

---

## 🙏 Credits

- **MathLive** by Arno Gourdol - Interactive math editor
- **MathJax** - Math rendering engine
- **Lucide** - Beautiful icon set

---

**Version:** 2.0 (MathML Edition)  
**Last Updated:** October 13, 2025
