# 📐 E2 MathsTyper - MathML Edition

A clean, modern web app for typing LaTeX equations and converting them to MathML format.

---

## 🎯 Features

- ✅ **Visual LaTeX Editor** - Type math using MathLive's interactive editor
- ✅ **Live Preview** - See your equations rendered in real-time
- ✅ **MathML Export** - Copy clean MathML code to clipboard
- ✅ **Unicode Equation Export** ⭐ - Copy Word-compatible UnicodeMath format
- ✅ **Word-Compatible MathML** - Auto-fixes n-ary operators for Microsoft Word
- ✅ **Piecewise Normalizer** - Auto-converts piecewise functions to stretchy braces
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

**📘 See also:** 
- [MathML Templates Guide](MATHML_TEMPLATES.md) - Copy-paste ready MathML templates
- [Overbar Conversion Guide](OVERBAR_CONVERSION_GUIDE.md) - Combining overline format for Word compatibility
- [Piecewise Normalizer Guide](PIECEWISE_NORMALIZER.md) - Full documentation on piecewise function normalization
- [Piecewise Quick Start](PIECEWISE_QUICK_START.md) - Test piecewise functions immediately

### What Gets Fixed:

**N-ary Operators** (integrals ∫, sums ∑, products ∏) require their operands to be wrapped in `<mrow>` tags for Word to recognize them properly. **The app automatically applies this fix** when generating MathML.

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

**Overbar Notation** (bars and overlines) are automatically converted to Unicode combining overline format (`U+0305`) for better Word compatibility:

**Before (causes issues in Word):**
```xml
<mover accent="true">
  <mi>z</mi>
  <mo>¯</mo>
</mover>
```

**After (Word-compatible):**
```xml
<mi>z&#x0305;</mi>
```

**Supported commands:** `\bar{z}`, `\overline{x}`, works with Latin and Greek letters.

**Arrow Accents** (vector notation) are automatically enhanced with the `accent="true"` attribute and **long arrow symbols** for proper stretching and Word rendering:

**Before (renders incorrectly in Word):**
```xml
<mover>
  <mi>A</mi><mi>B</mi>
  <mo>→</mo>
</mover>
```

**After (Word-compatible):**
```xml
<mover accent="true">
  <mrow>
    <mi>A</mi><mi>B</mi>
  </mrow>
  <mo>⟶</mo>
</mover>
```

**Key improvements:**
- Uses **long rightwards arrow** (U+27F6 ⟶) instead of short arrow (U+2192 →)
- Wraps multi-character bases in `<mrow>` for proper arrow stretching
- Adds `accent="true"` for correct Word interpretation

**Piecewise Functions** (cases environment) are automatically normalized to use stretchy braces:

**Before (non-stretchy brace):**
```xml
<mrow>
  <mo>{</mo>
  <mtable>
    <mtr><mtd><mi>x</mi></mtd><mtd><mi>x</mi><mo>&gt;</mo><mn>0</mn></mtd></mtr>
    <mtr><mtd><mn>0</mn></mtd><mtd><mi>x</mi><mo>≤</mo><mn>0</mn></mtd></mtr>
  </mtable>
  <mo></mo>
</mrow>
```

**After (stretchy brace):**
```xml
<mrow>
  <mfenced open="{" close="">
    <mtable>
      <mtr><mtd><mi>x</mi></mtd><mtd><mi>x</mi><mo>&gt;</mo><mn>0</mn></mtd></mtr>
      <mtr><mtd><mn>0</mn></mtd><mtd><mi>x</mi><mo>≤</mo><mn>0</mn></mtd></mtr>
    </mtable>
  </mfenced>
</mrow>
```

**Benefits:**
- Brace automatically stretches to span all table rows
- Renders correctly in MathJax, KaTeX, and native MathML
- Works perfectly in Microsoft Word
- Use `\begin{cases}...\end{cases}` in LaTeX for automatic conversion

**Supported commands:** `\overrightarrow{AB}`, `\overleftarrow{XY}`, works with any content.

**📘 See also:** 
- [Arrow Accent Quick Reference](ARROW_ACCENT_QUICK_REFERENCE.md) - Usage examples
- [Arrow Accent Implementation](OVERRIGHTARROW_IMPLEMENTATION.md) - Technical details

### Testing:

Run these debug functions in the browser console:

```javascript
debugNaryOperators()       // Test n-ary operator wrapping (∫, ∑, ∏)
debugOverbar()             // Test overbar combining conversion (\bar, \overline)
await testOverrightarrow() // Test arrow accent conversion (\overrightarrow, \overleftarrow) - NEW
```

Or open the dedicated test pages:
- `test_nary_operators.html` - N-ary operator tests
- `test_overbar.html` - Overbar conversion tests
- `test_overrightarrow.html` - Arrow accent tests (NEW)

---

## 🏗️ Architecture

### MathML Conversion
- Uses MathLive's built-in `convertLatexToMathMl()` function
- Standard MathML output
- Word-compatible normalizations


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

**Version:** 2.2 (MathML Edition)  
**Last Updated:** October 15, 2025
