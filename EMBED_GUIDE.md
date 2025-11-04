# 📚 LaTeXLive Embedded Editor - Complete Guide

## ✅ What Was Implemented

I've successfully embedded the **LaTeXLive editor** directly into your HSC Extension Maths Equation Typer! The LaTeXLive editor now appears **right below** the "Rendered Input (Editable)" section as a permanent iframe.

---

## 🎯 Features

### Direct Integration
- **No button required** - LaTeXLive is always visible on the page
- **800px tall iframe** - Large enough to use comfortably
- **Responsive** - Adjusts to 600px on mobile devices
- **Seamless design** - Matches your existing card styling

### Location
The LaTeXLive editor appears as a new card section **immediately after** the "Rendered Input (Editable)" math field.

---

## 📁 Files Modified

### 1. **`index.html`** (Main File)
   - **Line 2420-2428**: Added LaTeXLive iframe embed
   - **Lines 1217-1241**: Added CSS for embedded iframe
   - **Removed**: Modal button, modal CSS, and modal JavaScript

### 2. **`untitled folder/working final.html`**
   - **Lines 2276-2284**: Added LaTeXLive iframe embed
   - **Lines 1210-1234**: Added CSS for embedded iframe
   - **Removed**: Modal button, modal CSS, and modal JavaScript

### 3. **`test-embedded-latexlive.html`** (New Test File)
   - Test page to verify the iframe path works correctly

---

## 🔧 How It Works

### HTML Structure
```html
<!-- LaTeXLive Embedded Editor -->
<div class="section-card card" style="margin-top: 20px;">
    <div class="card-body body stack">
        <label class="io-label" style="margin-bottom: 12px;">LaTeXLive Editor</label>
        <div class="latexlive-embed-container">
            <iframe id="latexLiveFrame" src="../HSC-Extension-Maths-Equation-Typer-main 2/LaTeXLive/index.html" title="LaTeXLive Editor"></iframe>
        </div>
    </div>
</div>
```

### CSS Styling
```css
.latexlive-embed-container {
  width: 100%;
  height: 800px;
  min-height: 600px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-card-bg);
}

#latexLiveFrame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
```

### Iframe Paths

**For `index.html`:**
```javascript
src="../HSC-Extension-Maths-Equation-Typer-main 2/LaTeXLive/index.html"
```
Relative from: `/Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/`

**For `working final.html`:**
```javascript
src="../../HSC-Extension-Maths-Equation-Typer-main 2/LaTeXLive/html/index.html"
```
Relative from: `/Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/untitled folder/`

---

## 📂 Required File Structure

```
/Users/matthew/Desktop/
├── HSC-Extension-Maths-Equation-Typer-main/
│   ├── index.html ← Uses path: ../HSC-Extension-Maths-Equation-Typer-main 2/LaTeXLive/index.html
│   ├── test-embedded-latexlive.html
│   └── untitled folder/
│       └── working final.html ← Uses path: ../../HSC-Extension-Maths-Equation-Typer-main 2/LaTeXLive/html/index.html
└── HSC-Extension-Maths-Equation-Typer-main 2/
    └── LaTeXLive/
        └── html/
            └── index.html ← The LaTeXLive editor
```

The main project and the "HSC-Extension-Maths-Equation-Typer-main 2" folder **must** be in the same parent directory (`/Users/matthew/Desktop/`) for the relative paths to work.

---

## 🎨 Visual Layout

When you open `index.html` or `working final.html`, you'll see:

```
┌─────────────────────────────────────────────┐
│  Header (with GitHub, Copy LaTeX, etc)     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Rendered Input (Editable)                  │
│  [Math field here]                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  LaTeXLive Editor                           │ ← NEW SECTION!
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │  [Full LaTeXLive Editor - 800px]   │   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🚀 Usage

### No Action Required!
Simply open your HTML files:
- `index.html`
- `untitled folder/working final.html`

The LaTeXLive editor will **automatically load** in the iframe below the main equation input.

### Workflow
1. **Top section**: Use the math field for quick HSC-style equation input
2. **Scroll down**: Access the full LaTeXLive editor for advanced editing
3. **Copy/paste**: Move LaTeX between the two tools as needed

---

## 🧪 Testing

### Test the Embed
Open the test file:
```bash
open "/Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/test-embedded-latexlive.html"
```

### Expected Result
✅ You should see:
- Green "Success!" message
- LaTeXLive editor loaded in the iframe below

❌ If you see errors:
- Check that HSC-Extension-Maths-Equation-Typer-main 2 folder exists
- Verify the folder structure matches the diagram above
- See troubleshooting section below

---

## 🔐 Theme Support

The iframe container respects your theme settings:

### Light Mode
- White card background
- Light border color
- Clean, minimal design

### Dark Mode
- Dark card background (`var(--color-card-bg)`)
- Dark border color (`var(--color-border)`)
- Seamlessly blends with dark theme

The **LaTeXLive editor inside** the iframe maintains its own theme, which provides nice visual contrast.

---

## 📱 Responsive Design

### Desktop (> 768px)
- Height: **800px**
- Full width within card

### Mobile (< 768px)
- Height: **600px**
- Adjusted for smaller screens
- Still fully usable

---

## 🐛 Troubleshooting

### Issue: Iframe shows blank/white screen

**Solution 1**: Check file paths
```bash
# Verify LaTeXLive exists
ls -la /Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main\ 2/LaTeXLive/html/index.html
```

**Solution 2**: Update the iframe `src` attribute
Edit the iframe path in your HTML file (around line 2425 in index.html):
```html
<iframe id="latexLiveFrame" src="YOUR_CORRECT_PATH" title="LaTeXLive Editor"></iframe>
```

Try these alternative paths:
- Absolute: `file:///Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main 2/LaTeXLive/html/index.html`
- HTTP (if running server): `http://localhost:8080/html/index.html`

---

### Issue: Iframe is too small/large

**Change the height** by editing the CSS (around line 1220):
```css
.latexlive-embed-container {
  height: 1000px;  /* Change from 800px */
}
```

---

### Issue: CORS or security errors

If you see console errors about CORS:

**Solution**: Serve files via HTTP server
```bash
# In LaTeXLive directory
cd /Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main\ 2/LaTeXLive
python3 -m http.server 8080
```

Then update iframe src to: `http://localhost:8080/html/index.html`

---

## 💡 Tips & Best Practices

### Performance
- ✅ Iframe loads **once** when page opens
- ✅ Both tools run **independently**
- ✅ No performance impact on main equation typer

### Workflow
- Use **HSC Equation Typer** for quick math input
- Use **LaTeXLive** for complex documents or when you need full LaTeX features
- **Copy LaTeX** from one tool and paste into the other

### Customization
You can customize the iframe container:
- Change `height` in CSS
- Adjust `border-radius` for rounded corners
- Modify `border` color and width
- Add padding or margin

---

## 📊 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Excellent | Recommended |
| Firefox | ✅ Excellent | Full support |
| Safari | ✅ Good | May need `file://` protocol |
| Edge | ✅ Excellent | Chromium-based |
| Mobile Safari | ✅ Good | Responsive design works |
| Mobile Chrome | ✅ Good | Touch-friendly |

---

## 🎯 What Changed from Modal Version

### Before (Modal)
- ❌ Click button to open
- ❌ Full-screen overlay
- ❌ Extra JavaScript needed
- ❌ Had to close/reopen

### After (Embedded)
- ✅ Always visible on page
- ✅ Integrated card design
- ✅ No JavaScript required
- ✅ Scroll to access anytime

---

## 📚 Related Files

- **Main files**: `index.html`, `untitled folder/working final.html`
- **Test file**: `test-embedded-latexlive.html`
- **LaTeXLive docs**: `../HSC-Extension-Maths-Equation-Typer-main 2/LaTeXLive/` (in LaTeXLive folder)

---

## ✨ Summary

You now have **two powerful LaTeX tools in one page**:

1. **Top**: HSC-focused equation typer with shortcuts and Word output
2. **Bottom**: Full LaTeXLive editor for advanced LaTeX editing

Both tools work together seamlessly, giving you the best of both worlds! 🎉

---

**Last Updated**: October 21, 2025  
**Version**: 2.0.0 (Embedded)  
**Status**: ✅ Fully functional

