# 📐 E2 MathsTyper - MathML Edition

A specialized web app designed for **E2 students** to type LaTeX equations and convert them to MathML format, optimized for **Notion** and web-based platforms.

---

## 🎯 E2-Specific Features

- ✅ **E2-Optimized Buttons** - Custom button layout designed for E2 math curriculum
- ✅ **Visual LaTeX Editor** - Type math using MathLive's interactive editor
- ✅ **Live Preview** - See your equations rendered in real-time
- ✅ **MathML Export** - Copy clean MathML code for Notion and web platforms
- ✅ **LaTeX Export** - Copy raw LaTeX code for various platforms
- ✅ **Dark Mode** - System-aware theme with manual override
- ✅ **Keyboard Shortcuts** - 100+ inline shortcuts for fast typing
- ✅ **Mobile Friendly** - Responsive design works on all devices

---

## 🚀 Quick Start

1. **Open** `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
2. **Type** your LaTeX equation in the "Rendered Input" field
3. **Copy** the generated MathML using the "Copy MathML" button
4. **Paste** the MathML into **Notion** or other web platforms

## 📝 Platform Compatibility

### ✅ **Notion** - Perfect Match
- MathML works excellently in Notion
- Clean, professional rendering
- No compatibility issues

### ⚠️ **Microsoft Word** - Use Native Equation Editor Instead
**Important:** While LaTeX can be used in Word, it's **not recommended** for:
- **Vectors** (complex arrow notation)
- **Complex numbers** (imaginary unit notation)
- **Advanced mathematical expressions**

**Why MathML/LaTeX struggles in Word:**
- I've tested multiple approaches: Unicode with regex, AST parsing, and MathML conversion
- All methods failed to render complex mathematical notation properly in Word
- Word's native equation editor handles these cases much better

**Recommendation:** Use Word's **native equation editor** (Insert → Equation) for complex math in Word documents.

---

## 💡 E2 Usage Examples

### Example 1: Simple Fraction (Perfect for Notion)
**Type:** `\frac{a}{b}`  
**Get MathML:** 
```xml
<math><mfrac><mi>a</mi><mi>b</mi></mfrac></math>
```
**Use in:** Notion, web platforms

### Example 2: Quadratic Formula (E2 Curriculum)
**Type:** `x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}`  
**Get MathML:** Clean, standards-compliant MathML output
**Use in:** Notion, web platforms

### Example 3: Integral (E2 Advanced)
**Type:** `\int_{0}^{\infty} e^{-x} dx`  
**Get MathML:** Ready to use in Notion and web platforms

### Example 4: Vectors (Use Word's Native Editor Instead)
**Type:** `\overrightarrow{AB}`  
**Problem:** MathML/LaTeX struggles with vector notation in Word
**Solution:** Use Word's Insert → Equation for vectors

---

## 🎨 E2-Optimized Interface

The app has four main areas designed for E2 students:

1. **Rendered Input (Editable)** - Interactive math field powered by MathLive
2. **Raw LaTeX Input** - Plain text LaTeX code (editable)
3. **MathML Output** - Generated MathML for Notion/web platforms (read-only)
4. **LaTeX Preview** - Visual preview rendered by MathJax

### E2-Specific Button Layout
- **Quick Access** to common E2 mathematical symbols
- **Curriculum-Focused** shortcuts for E2 topics
- **Mobile-Friendly** design for on-the-go studying

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

## 📝 Platform-Specific Recommendations

### ✅ **Notion** - Primary Use Case
- **Perfect for:** All mathematical expressions
- **MathML works excellently** in Notion
- **Clean rendering** for E2 assignments and notes
- **No compatibility issues**

### ⚠️ **Microsoft Word** - Use Native Equation Editor
**Why MathML/LaTeX struggles in Word:**
- **Vectors:** Complex arrow notation doesn't render properly
- **Complex Numbers:** Imaginary unit notation fails
- **Advanced Expressions:** Many mathematical constructs break

**My Testing Results:**
- ❌ **Unicode with regex** - Failed for complex notation
- ❌ **AST parsing** - Failed for vectors and complex numbers  
- ❌ **MathML conversion** - Failed for advanced mathematical expressions

**✅ Recommendation:** Use Word's **native equation editor** (Insert → Equation) for Word documents.

### 🌐 **Web Platforms** - MathML Works Great
- **GitHub** - MathML renders in markdown
- **Websites** - MathML works with proper CSS
- **Online editors** - Most support MathML

---

## 🏗️ Technical Architecture

### MathML Conversion
- Uses MathLive's built-in `convertLatexToMathMl()` function
- Standard MathML output optimized for Notion
- E2 curriculum-focused symbol support

### E2-Specific Features
- **Custom button layout** for E2 mathematical concepts
- **Mobile-optimized** interface for studying on-the-go
- **Notion-focused** MathML output formatting

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

## 🙏 Credits & Acknowledgments

Thank you to all the amazing open-source projects that made this possible:

- **MathLive** by Arno Gourdol - Interactive math editor that powers the equation input
- **MathJax** - Math rendering engine for LaTeX preview
- **Lucide** - Beautiful icon set for the interface
- **Open Source Community** - For making tools like this accessible to E2 students

---

**Version:** 2.2 (E2 MathML Edition)  
**Last Updated:** October 15, 2025  
**Designed for:** E2 Students & Notion Users
