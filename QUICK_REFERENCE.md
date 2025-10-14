# 📋 Quick Reference Card

## E2 MathsTyper - Word-Compatible MathML

---

## ⚡ Quick Start (3 Steps)

1. **Type** LaTeX in the app
2. **Click** "Copy MathML"
3. **Paste** into Word → Done! ✅

---

## 🎯 Supported Math

### Integrals
```latex
\int f(x) dx                    ← Simple
\int_{a}^{b} f(x) dx           ← With limits
\int_{0}^{\infty} e^{-x} dx    ← Complex
```

### Summations
```latex
\sum_{i=1}^{n} a_i             ← Standard
\sum_{k=0}^{\infty} x^k        ← Infinite
```

### Products
```latex
\prod_{i=1}^{n} i              ← Standard
\prod_{p} (1-p)                ← Custom index
```

---

## ✅ What's Auto-Fixed

| Operator | What Happens |
|----------|--------------|
| ∫ Integral | Operand wrapped in `<mrow>` |
| ∑ Sum | Summand wrapped in `<mrow>` |
| ∏ Product | Multiplicand wrapped in `<mrow>` |

**Result:** No dotted placeholders in Word! 🎉

---

## 🔧 Testing

### Console Test
```javascript
debugNaryOperators()
```

### Test File
```
test_nary_operators.html
```

### Manual Test
1. Type: `\int_{0}^{1} x dx`
2. Copy MathML
3. Paste to Word
4. Check: No ▢ placeholder? ✅ Works!

---

## 📝 Word Paste Methods

### Method 1: Direct Paste (Best)
- `Ctrl+V` (Win) or `Cmd+V` (Mac)
- Just paste! It works.

### Method 2: Paste Special
- Right-click → "Keep Text Only"
- Right-click text → "Convert to Equation"

### Method 3: Equation Editor
- Insert → Equation
- Change "UnicodeMath" to "MathML"
- Paste

---

## ⌨️ Keyboard Shortcuts

### Common LaTeX
```
int    → ∫
sum    → ∑
prod   → ∏
infty  → ∞
sqrt   → √
frac   → fraction
```

### Greek Letters
```
alpha  → α
beta   → β
gamma  → γ
delta  → δ
pi     → π
theta  → θ
```

### Sets
```
RR     → ℝ
CC     → ℂ
NN     → ℕ
ZZ     → ℤ
QQ     → ℚ
```

---

## 🎨 Interface Overview

```
┌─────────────────────────────────────┐
│  [Copy LaTeX] [Copy MathML] [?]     │ ← Header Buttons
├─────────────────────────────────────┤
│  Rendered Input (Editable)          │ ← MathLive Editor
│  ∫ x² dx                             │
├─────────────────────────────────────┤
│  Raw LaTeX Input                     │ ← Text Editor
│  \int x^2 dx                         │
├─────────────────────────────────────┤
│  MathML Output                       │ ← Copy This!
│  <math>...</math>                    │
├─────────────────────────────────────┤
│  LaTeX Preview                       │ ← Visual Check
│  ∫ x² dx                             │
└─────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### "Still see ▢ in Word"
✅ Refresh page, type again  
✅ Try paste as plain text  
✅ Update Word (need 2016+)

### "Copy button doesn't work"
✅ Use HTTPS or localhost  
✅ Manually select & copy text

### "MathML looks wrong"
✅ Check console for errors  
✅ Wait for MathJax to load  
✅ Try simpler equation first

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main documentation |
| `WORD_COMPATIBILITY_GUIDE.md` | User guide |
| `NARY_OPERATOR_FIX.md` | Technical docs |
| `IMPLEMENTATION_SUMMARY.md` | Implementation details |
| `test_nary_operators.html` | Test page |

---

## ✨ Pro Tips

### Tip 1: Build Complex Equations Step-by-Step
```
1. Type: \int
2. Add limits: _{0}^{1}
3. Add integrand: x^2 dx
4. Copy when done
```

### Tip 2: Use Toolbar Buttons
- Click `∫` button for integral template
- Click `∑` button for sum template
- Click `∏` button for product template

### Tip 3: Copy Both Formats
- Copy MathML → for Word
- Copy LaTeX → for backup/sharing

### Tip 4: Test Small First
Try a simple `\int x dx` before complex equations.

---

## 🎯 Common Equations

### Fundamental Theorem of Calculus
```latex
\int_{a}^{b} f'(x) dx = f(b) - f(a)
```

### Taylor Series
```latex
e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}
```

### Euler Product
```latex
\sum_{n=1}^{\infty} \frac{1}{n^s} = \prod_{p} \frac{1}{1-p^{-s}}
```

### Gaussian Integral
```latex
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
```

---

## 🌐 Browser Support

| Browser | Status |
|---------|--------|
| Chrome 90+ | ✅ |
| Edge 90+ | ✅ |
| Firefox 88+ | ✅ |
| Safari 14+ | ✅ |

---

## 📱 Mobile

- ✅ Touch-friendly
- ✅ Responsive design
- ✅ Mobile keyboard support
- ⚠️ Copy may need manual selection

---

## 🆘 Quick Help

### "How do I...?"

**Add superscript:** Use `^` → `x^2`  
**Add subscript:** Use `_` → `a_i`  
**Add fraction:** Use `\frac{a}{b}`  
**Add limits:** Use `_{lower}^{upper}`  
**Add parentheses:** Use `\left( ... \right)`

---

## 🎓 Learning Resources

### LaTeX Basics
- Fractions: `\frac{numerator}{denominator}`
- Powers: `base^{exponent}`
- Roots: `\sqrt{content}` or `\sqrt[n]{content}`

### Common Operators
- `\sin, \cos, \tan` → trig functions
- `\lim` → limit
- `\log, \ln` → logarithms
- `\to, \rightarrow` → arrows

---

## ⚙️ System Requirements

- **Modern browser** (2020+)
- **Internet connection** (for CDN libraries)
- **Microsoft Word 2016+** (for Word features)
- **No installation** required!

---

## ✅ Feature Summary

✅ Visual LaTeX editor  
✅ Real-time preview  
✅ MathML export  
✅ **Word-compatible output**  
✅ Dark mode  
✅ 100+ shortcuts  
✅ Mobile friendly  
✅ **Auto-fixes n-ary operators**  

---

## 📞 Need More Help?

1. Check `WORD_COMPATIBILITY_GUIDE.md`
2. Run test: `debugNaryOperators()`
3. Open `test_nary_operators.html`
4. Read `README.md`

---

**Version:** 2.1 (Word Compatible)  
**Last Updated:** October 13, 2025

---

**Print this page for quick reference!** 📄

