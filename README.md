# HSC Maths Extension 1 & 2 — Word & Notion LaTeX Equation Tool

A simple web app to type, preview, and copy maths equations for **HSC Extension 1 and Extension 2**.
Designed to help **students and teachers** seamlessly work with equations in **Microsoft Word** and **Notion (LaTeX)**.

👉 **[Open the Live Site](https://matthewhuyijun.github.io/HSC-Maths-Extension-1-2-Word-and-Notion-Latex-Equation-Tool/)**

---

## ✨ Features

* **Dual Input**

  * Visual editor powered by MathLive
  * Raw LaTeX editor for advanced users

* **Export Anywhere**

  * Copy as **LaTeX** → paste directly into Notion or Overleaf
  * Copy as **Word Equation** → paste directly into Microsoft Word

* **Unicode Support (New!)**

  * Use the **Unicode-Linear** mode for compatibility with Word’s equation system.
  * After pasting into Word, simply select the equation and choose **Convert → Professional** to render it properly.
  * 💡 For best results, install and use the **[Latin Modern Math](https://www.cdnfonts.com/latin-modern-math.font)** font — the modern Unicode version of LaTeX’s Computer Modern font — to ensure consistent and accurate symbol rendering in Word.

* **Built-in Maths Keyboard** with tabs for:

  * Calculus, Functions, Vectors
  * Greek symbols, Complex numbers, Sets, and more

* **Instant Preview** — equations rendered live with MathJax

---

## 🚀 How to Use

1. Visit the [live site](https://matthewhuyijun.github.io/HSC-Maths-Extension-1-2-Word-and-Notion-Latex-Equation-Tool/).
2. Enter equations in either the **visual editor** or the **raw LaTeX box**.
3. Choose your export format:

   * **Copy LaTeX** — for Notion, Overleaf, or any TeX editor.
   * **Copy Word Equation** — for direct pasting into Microsoft Word.
   * **Unicode-Linear Mode (New)** — for pasting into Word when normal MathML doesn’t render correctly. After pasting, select the equation and use **Convert → Professional**.
4. Paste into assignments, notes, or teaching materials.

---

## 🛠️ Technology

* [MathLive](https://cortexjs.io/mathlive/) — interactive math editor
* [MathJax](https://www.mathjax.org/) — LaTeX rendering engine
* Modular JavaScript with ES6 imports for LaTeX to UnicodeMath conversion
* Hosted on **GitHub Pages**

---

## 🔧 Running Locally

**⚠️ Important:** This app uses ES6 modules which **do not work** with the `file://` protocol. You **must** serve it through an HTTP server.

### Quick Start:

1. Clone or download this repository
2. Open a terminal in the project folder
3. Start a local web server:

   ```bash
   # Using Python 3 (recommended)
   python3 -m http.server 8000

   # Or using Node.js
   npx serve

   # Or using PHP
   php -S localhost:8000
   ```

4. Open your browser to: `http://localhost:8000/index.html`

### Troubleshooting:

If you see "LaTeX code not converting" or equations appear as raw LaTeX:
- Check browser console (F12) for module loading errors
- Ensure you're accessing via `http://` not `file://`
- The app will show an alert if modules fail to load