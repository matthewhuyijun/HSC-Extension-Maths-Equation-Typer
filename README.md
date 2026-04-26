# 📐 E2 MathsTyper - Pure LaTeX Edition

A specialized web app designed for **E2 students** to type LaTeX equations and convert them to various formats, optimized for **Notion** and web-based platforms. [**Try it now →**](https://matthewhuyijun.github.io/HSC-Extension-Maths-Equation-Typer/)

---

## 🎯 E2-Specific Features

• **E2-Optimized Buttons** - Custom button layout designed for E2 math curriculum

• **Visual LaTeX Editor** - Type math using MathLive's interactive editor

• **Live Preview** - See your equations rendered in real-time

• **Multiple Export Formats** - Copy LaTeX, MathML, and other formats for different platforms

• **LaTeX Export** - Copy raw LaTeX code for various platforms

• **Dark Mode** - System-aware theme with manual override

• **Keyboard Shortcuts** - 100+ inline shortcuts for fast typing

• **Mobile Friendly** - Responsive design works on all devices

---

## 🚀 Quick Start

1. **Open** `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
2. **Type** your LaTeX equation in the "Rendered Input" field
3. **Copy** the generated LaTeX or other format using the copy buttons
4. **Paste** the code into **Notion** or other web platforms

## 📝 Platform Compatibility

### ✅ **Notion** - Perfect Match

• LaTeX work excellently in Notion

• Clean, professional rendering

• No compatibility issues

### ⚠️ **Microsoft Word** - Use Native Equation Editor Instead
**Important:** While LaTeX can be used in Word, it's **not recommended** for:

• **Vectors** (complex arrow notation)

• **Complex numbers** (imaginary unit notation)

**Why LaTeX struggles in Word:**
• I've tested multiple approaches: Unicode with regex, AST parsing, and MathML conversion

• All methods failed to render complex mathematical notation properly in Word

• Word's native equation editor handles these cases much better

**Recommendation:** Use Word's **native equation editor** (Insert → Equation) for complex math in Word documents.

**If you must paste into Word:**
• Word ingests **MathML** more reliably than raw LaTeX, so copy MathML (or click the new `Unicode` button which copies MathML automatically) before switching apps.
• On the PluriMath page that opens, choose the **MathML → UnicodeMath** conversion—the MathML is already on your clipboard as soon as you press the button, so you can paste it straight in and grab the Unicode output for Word if needed.

---

## 🙏 Credits & Acknowledgments

Thank you to all the amazing open-source projects that made this possible:

• **MathLive** by Arno Gourdol - Interactive math editor that powers the equation input

• **MathJax** - Math rendering engine for LaTeX preview

• **Lucide** - Beautiful icon set for the interface

• **Open Source Community** - For making tools like this accessible to E2 students

---

## 📄 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.
