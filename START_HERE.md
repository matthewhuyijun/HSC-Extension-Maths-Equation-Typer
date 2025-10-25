# 🎉 LaTeXLive Embedded - Start Here!

## ✨ What You Got

Your **HSC Extension Maths Equation Typer** now has the **LaTeXLive editor embedded** directly in the page!

---

## 🚀 Quick Start

### ⚠️ IMPORTANT: You Need a Local Server!

Due to browser security (CORS), you can't just double-click the HTML file. You need to run a simple local server.

### Method 1: Use the Helper (Easiest!)
```bash
open "/Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/OPEN_ME.html"
```
This will check if a server is running and guide you through the setup!

### Method 2: Manual Setup
1. Open Terminal
2. Run this command:
```bash
cd /Users/matthew/Desktop && python3 -m http.server 8080
```
3. Open your browser and go to:
```
http://localhost:8080/HSC-Extension-Maths-Equation-Typer-main/index.html
```

### Why?
The LaTeXLive iframe needs to load JavaScript files, and browsers block this when using `file://` protocol for security reasons. Running a server with `http://` solves this!

📖 **Full details:** See `CORS_FIX_GUIDE.md` for complete troubleshooting

### What You'll See
1. **Top section**: Your HSC equation typer (as before)
2. **Bottom section**: LaTeXLive editor in an 800px iframe (NEW!)

### That's It!
Just scroll down to access the LaTeXLive editor - no buttons to click!

---

## 📍 Where Is It?

The LaTeXLive editor appears **right below** the "Rendered Input (Editable)" math field.

### Visual Layout
```
┌─────────────────────────────┐
│  Your Header (unchanged)    │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Rendered Input (Editable)  │ ← Your math field
│  [Math editor here]         │
└─────────────────────────────┘
              ↓ Scroll down
┌─────────────────────────────┐
│  LaTeXLive Editor           │ ← NEW SECTION!
│  ┌───────────────────────┐  │
│  │                       │  │
│  │  Full LaTeX Editor    │  │
│  │  (800px tall)         │  │
│  │                       │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

---

## ✅ What Works

### Both Files Updated
- ✅ `index.html` - Has LaTeXLive embedded
- ✅ `untitled folder/working final.html` - Also has it embedded

### Features
- ✅ **Always visible** - No modal, no popup
- ✅ **800px height** - Plenty of space to work
- ✅ **Theme support** - Works with light/dark mode
- ✅ **Responsive** - Adjusts on mobile (600px)
- ✅ **No JavaScript needed** - Pure HTML + CSS

---

## 🧪 Test It

### Option 1: Open Main File
```bash
open "/Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/index.html"
```
Scroll down - you should see LaTeXLive loaded!

### Option 2: Run Test File
```bash
open "/Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/test-embedded-latexlive.html"
```
Should show green "Success!" message.

---

## 📚 Documentation

### Quick Reference
📄 **README_LATEXLIVE.md** - Quick start guide (this info)

### Detailed Guides
📖 **EMBED_GUIDE.md** - Complete documentation with troubleshooting  
📝 **CHANGES_SUMMARY.md** - What changed in the code

---

## 🐛 Troubleshooting

### Issue: Iframe is blank
**Check folders exist:**
```bash
ls -la /Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/
ls -la /Users/matthew/Desktop/LaTeXLive-main/
```

Both folders should be in `/Users/matthew/Desktop/`

### Issue: Want different height
Edit the CSS in your HTML file (around line 1220):
```css
.latexlive-embed-container {
  height: 1000px;  /* Change from 800px */
}
```

### Issue: CORS errors
Start an HTTP server:
```bash
cd /Users/matthew/Desktop/LaTeXLive-main
python3 -m http.server 8080
```
Then update iframe src to: `http://localhost:8080/html/index.html`

---

## 💡 Usage Tips

### Workflow
1. Use the **top math field** for quick HSC-style equations
2. Use the **LaTeXLive editor** for complex documents or full LaTeX
3. **Copy/paste** LaTeX between the two tools

### Best Practice
- Keep HSC typer for exam-style questions
- Use LaTeXLive for assignments, reports, or complex math
- Both tools work independently - use whichever fits your needs!

---

## 🎨 Customization (Optional)

### Change Border Color
```css
.latexlive-embed-container {
  border: 2px solid #3b82f6;  /* Blue border */
}
```

### Add Shadow
```css
.latexlive-embed-container {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

### Adjust Spacing
```html
<div class="section-card card" style="margin-top: 40px;">  <!-- More space -->
```

---

## 📊 File Structure

```
HSC-Extension-Maths-Equation-Typer-main/
├── index.html                    ← Updated (LaTeXLive embedded)
├── untitled folder/
│   └── working final.html        ← Updated (LaTeXLive embedded)
├── test-embedded-latexlive.html  ← New test file
├── START_HERE.md                 ← You are here!
├── README_LATEXLIVE.md           ← Quick guide
├── EMBED_GUIDE.md                ← Full documentation
└── CHANGES_SUMMARY.md            ← Technical changes
```

---

## ❓ FAQ

**Q: Do I need to click anything to see LaTeXLive?**  
A: Nope! Just scroll down - it's already there.

**Q: Can I hide/show the LaTeXLive editor?**  
A: Currently it's always visible. You can add a toggle button if you want (see EMBED_GUIDE.md).

**Q: Does this work offline?**  
A: Yes! As long as both folders are on your computer.

**Q: Will this slow down my page?**  
A: The iframe loads when the page opens, so there's a slight initial load. After that, both tools work independently.

**Q: Can I use both tools at the same time?**  
A: Absolutely! They're separate - edit in one, copy to the other, whatever you need.

---

## 🎯 Summary

**What changed:**  
✅ LaTeXLive now embedded below "Rendered Input (Editable)"  
✅ No button needed - always visible  
✅ Both HTML files updated  

**What to do:**  
1. Open `index.html`  
2. Scroll down  
3. Use LaTeXLive editor!  

**Need help:**  
📖 Read `EMBED_GUIDE.md` for full details

---

## 🎉 You're All Set!

Everything is ready to go. Just open your HTML file and start using both tools together!

**Enjoy!** 🚀

---

**Last Updated**: October 21, 2025  
**Status**: ✅ Ready to use!

