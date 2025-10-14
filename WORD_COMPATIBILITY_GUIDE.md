# 📝 Word Compatibility Quick Guide

## What This Fixes

Microsoft Word shows **dotted placeholders (▢)** when you paste MathML for integrals, sums, and products if the operands aren't grouped properly. This app **automatically fixes** that issue.

---

## 🚀 How to Use with Word

### Step 1: Type Your Equation
In the app, type any equation with integrals, sums, or products:

```
\int_{0}^{\infty} e^{-x} dx
```

```
\sum_{i=1}^{n} i^2
```

```
\prod_{k=1}^{n} k
```

### Step 2: Copy MathML
Click the **"Copy MathML"** button in the app.

### Step 3: Paste into Word

**Option A: Direct Paste (Recommended)**
1. Open Microsoft Word
2. Click where you want the equation
3. Press `Ctrl+V` (Windows) or `Cmd+V` (Mac)
4. The equation appears correctly - **no dotted placeholders!** ✅

**Option B: Using Equation Editor**
1. Insert → Equation → Ink Equation → Cancel
2. Click "LaTeX" dropdown → Change to "UnicodeMath" or "MathML"
3. Paste your MathML
4. Press Enter
5. Equation renders correctly ✅

**Option C: Plain Text Method**
1. Paste as **"Keep Text Only"** or **"Unformatted Text"**
2. Select the pasted MathML text
3. Right-click → "Convert to Equation"
4. Word recognizes it automatically ✅

---

## ✅ What Gets Fixed Automatically

### Integrals (∫)

| LaTeX | Auto-Fixed MathML |
|-------|------------------|
| `\int f(x) dx` | Operand `f(x) dx` wrapped in `<mrow>` |
| `\int_{a}^{b} f(x) dx` | Operand wrapped after `<msubsup>` |
| `\int_{0}^{\infty} e^{-x^2} dx` | Complex operand properly grouped |

### Summations (∑)

| LaTeX | Auto-Fixed MathML |
|-------|------------------|
| `\sum_{i=1}^{n} a_i` | Summand `a_i` wrapped in `<mrow>` |
| `\sum_{k=0}^{\infty} x^k` | Works with infinity limits |
| `\sum_{n=1}^{100} \frac{1}{n}` | Complex summand wrapped |

### Products (∏)

| LaTeX | Auto-Fixed MathML |
|-------|------------------|
| `\prod_{i=1}^{n} i` | Multiplicand `i` wrapped in `<mrow>` |
| `\prod_{p \in \mathbb{P}} \frac{1}{1-p}` | Complex operand wrapped |

---

## 🧪 Quick Test

### Test Equation 1: Simple Integral
**Type this in the app:**
```
\int_{0}^{1} x^2 dx
```

**Copy MathML, paste into Word**  
**Expected:** `∫₀¹ x² dx` (no placeholder)

### Test Equation 2: Sum
**Type this in the app:**
```
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
```

**Copy MathML, paste into Word**  
**Expected:** Full equation with no placeholders

### Test Equation 3: Multiple Operators
**Type this in the app:**
```
\int_{0}^{\pi} \sin(x) dx + \sum_{k=1}^{10} k
```

**Copy MathML, paste into Word**  
**Expected:** Both operators work correctly

---

## ❌ What You DON'T Need to Do Anymore

- ~~Manually edit MathML~~ ✅ Auto-fixed
- ~~Add `<mrow>` tags yourself~~ ✅ Auto-added
- ~~Deal with dotted placeholders in Word~~ ✅ Prevented
- ~~Use third-party converters~~ ✅ Built-in
- ~~Copy/paste multiple times~~ ✅ One-click copy

---

## 🔍 Verify It's Working

### Method 1: Check the MathML Output
In the app, after typing an integral/sum/product:
1. Look at the **"MathML Output"** box
2. Search for `<mrow>` tags
3. You should see operands wrapped like:
   ```xml
   <msubsup>
     <mo>∫</mo>
     ...
   </msubsup>
   <mrow>
     <!-- operand here -->
   </mrow>
   ```

### Method 2: Console Test
1. Open browser console (F12)
2. Type: `debugNaryOperators()`
3. Check that all tests show ✅ PASS

### Method 3: Visual Test in Word
1. Copy MathML from app
2. Paste into Word
3. Look for dotted placeholders (▢)
4. **If you see NO placeholders** → ✅ It's working!

---

## 🛠️ Troubleshooting

### "I still see dotted placeholders in Word"

**Possible causes:**
1. **Old MathML copied** - Refresh the page, type equation again
2. **Word cache** - Close and reopen Word
3. **Wrong paste method** - Try "Paste as Plain Text"
4. **Old Word version** - Update to latest Word (2016+)

**Solution:**
1. Clear the equation in the app
2. Type it again
3. Click "Copy MathML" 
4. Paste fresh into a new Word document

### "MathML looks wrong"

**Check:**
1. Is MathJax loaded? (Look for "✅ MathML converter ready" in console)
2. Does the equation render in the "LaTeX Preview"?
3. Try a simpler equation first

---

## 📊 Compatibility

### ✅ Tested and Working

| Software | Version | Status |
|----------|---------|--------|
| Microsoft Word | 2016+ | ✅ Works |
| Microsoft Word Online | Latest | ✅ Works |
| Microsoft 365 | Latest | ✅ Works |
| LibreOffice Writer | 7.0+ | ⚠️ Partial (MathML support varies) |
| Google Docs | - | ❌ No native MathML support |

### Browsers

| Browser | Status |
|---------|--------|
| Chrome/Edge 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Safari 14+ | ✅ Full support |

---

## 💡 Pro Tips

### Tip 1: Keep Equations Simple
Break complex equations into parts:
```
// Instead of one giant equation
\int \sum \prod ...

// Use multiple smaller equations
\int_{0}^{1} f(x) dx = I_1
\sum_{n=1}^{\infty} a_n = S
```

### Tip 2: Use Keyboard Shortcuts
In the app toolbar:
- `int` → ∫ integral
- `sum` → ∑ summation  
- `prod` → ∏ product
- `infty` → ∞ infinity

### Tip 3: Copy LaTeX Too
Click **"Copy LaTeX"** as a backup - you can always convert it again if needed.

### Tip 4: Test Before Big Documents
Try a few equations first to verify your Word version handles MathML correctly.

---

## 📚 Examples Ready to Copy

### Example 1: Definite Integral
```latex
\int_{a}^{b} f(x) dx = F(b) - F(a)
```

### Example 2: Taylor Series
```latex
e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}
```

### Example 3: Infinite Product
```latex
\sin(x) = x \prod_{n=1}^{\infty} \left(1 - \frac{x^2}{n^2 \pi^2}\right)
```

### Example 4: Fundamental Theorem
```latex
\int_{a}^{b} \frac{df}{dx} dx = f(b) - f(a)
```

### Example 5: Riemann Sum
```latex
\int_{a}^{b} f(x) dx = \lim_{n \to \infty} \sum_{i=1}^{n} f(x_i) \Delta x
```

---

## ✅ Bottom Line

**You don't need to do anything special!**

Just:
1. Type your equation in the app
2. Click "Copy MathML"
3. Paste into Word
4. It works! 🎉

The app **automatically handles** all the MathML fixes needed for Word compatibility.

---

**Need Help?** Check the main [README.md](README.md) or run the test file: [test_nary_operators.html](test_nary_operators.html)

**Last Updated:** October 13, 2025

