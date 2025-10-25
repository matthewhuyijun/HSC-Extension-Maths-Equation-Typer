# 🚀 LaTeXLive Integration - Quick Start

## What You Have

Your **HSC Extension Maths Equation Typer** now includes the **LaTeXLive editor** embedded directly in the page!

## How to Use

### Step 1: Open Your File
```bash
open "/Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/index.html"
```

### Step 2: Scroll Down
After the "Rendered Input (Editable)" section, you'll see a new card labeled **"LaTeXLive Editor"**.

### Step 3: Start Editing!
The LaTeXLive editor is ready to use - no button clicks needed!

---

## Where Is It?

```
┌──────────────────────────┐
│  Rendered Input Field    │
└──────────────────────────┘
            ↓
┌──────────────────────────┐
│  LaTeXLive Editor        │  ← NEW!
│  (800px iframe)          │
└──────────────────────────┘
```

---

## Files Updated

✅ `index.html` - Main file (has LaTeXLive embedded)  
✅ `untitled folder/working final.html` - Also has it embedded  
✅ `test-embedded-latexlive.html` - Test file to verify it works

---

## Troubleshooting

### ❌ Iframe is blank?
Check that both folders are in the same directory:
```
/Users/matthew/Desktop/
├── HSC-Extension-Maths-Equation-Typer-main/
└── LaTeXLive-main/
```

### ❌ Need to change the height?
Edit the CSS in your HTML file (around line 1220):
```css
.latexlive-embed-container {
  height: 1000px;  /* Change from 800px */
}
```

---

## Full Documentation

📖 See **`EMBED_GUIDE.md`** for complete details, troubleshooting, and customization options.

---

## Test It

Run the test file to make sure everything works:
```bash
open "/Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/test-embedded-latexlive.html"
```

You should see a green "Success!" message if the path is correct.

---

**Enjoy having both tools in one place! 🎉**

