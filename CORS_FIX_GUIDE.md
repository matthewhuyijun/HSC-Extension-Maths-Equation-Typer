# 🔧 CORS Error Fix Guide

## ❌ The Error You Saw

```
Access to script at 'file:///Users/matthew/Desktop/LaTeXLive-main/publish/latex.bundle.min.js' 
from origin 'null' has been blocked by CORS policy
```

## 🤔 What Does This Mean?

**CORS (Cross-Origin Resource Sharing)** is a browser security feature that prevents websites from loading resources from different origins. When you open HTML files directly with `file://`, the browser treats each file as a different "origin" and blocks scripts for security.

### Visual Explanation

```
❌ Opening files directly (file:// protocol):
┌─────────────────────────────────────────┐
│ file:///Desktop/.../index.html          │
│   └─> loads iframe                      │
│       file:///Desktop/.../LaTeXLive     │
│          └─> tries to load JS files     │
│              ❌ BLOCKED by CORS          │
└─────────────────────────────────────────┘

✅ Using HTTP server (http:// protocol):
┌─────────────────────────────────────────┐
│ http://localhost:8080/.../index.html    │
│   └─> loads iframe                      │
│       http://localhost:8080/LaTeXLive   │
│          └─> loads JS files             │
│              ✅ ALLOWED (same origin)    │
└─────────────────────────────────────────┘
```

## ✅ Solution: Use a Local HTTP Server

You need to run a simple web server on your computer. Don't worry - it's:
- **Local only** (nothing goes on the internet)
- **Simple** (one command)
- **Safe** (you control everything)

---

## 🚀 Quick Fix (Easiest Method)

### Step 1: Open the Helper File
```bash
open "/Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/OPEN_ME.html"
```

This will:
1. Check if a server is running
2. Show you instructions if not
3. Provide a button to open your app when ready

### Step 2: Follow the Instructions
The helper page will guide you through starting the server!

---

## 🛠️ Manual Method

If you prefer to do it manually:

### 1. Open Terminal
- Press `Command + Space`
- Type "Terminal"
- Press Enter

### 2. Run This Command
```bash
cd /Users/matthew/Desktop && python3 -m http.server 8080
```

You should see:
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

### 3. Open Your App
In your browser, go to:
```
http://localhost:8080/HSC-Extension-Maths-Equation-Typer-main/index.html
```

### 4. When Done
- Go back to Terminal
- Press `Ctrl + C` to stop the server

---

## 📋 Detailed Explanation

### What is localhost?

**localhost** is your computer's way of talking to itself:
- `localhost` = "this computer"
- `8080` = port number (like a door number)
- The server runs on your machine only
- Nothing is exposed to the internet

### Why Python?

Python comes pre-installed on macOS and has a simple HTTP server built-in. No installation needed!

### Alternative Servers

If you prefer, you can use other servers:

#### Node.js (if you have it installed)
```bash
cd /Users/matthew/Desktop
npx http-server -p 8080
```

#### PHP (comes with macOS)
```bash
cd /Users/matthew/Desktop
php -S localhost:8080
```

#### Python 2 (older macOS versions)
```bash
cd /Users/matthew/Desktop
python -m SimpleHTTPServer 8080
```

---

## 🔍 Troubleshooting

### Issue: "Port already in use"

**Error:**
```
OSError: [Errno 48] Address already in use
```

**Solution:** Try a different port:
```bash
cd /Users/matthew/Desktop && python3 -m http.server 8081
```

Then open: `http://localhost:8081/HSC-Extension-Maths-Equation-Typer-main/index.html`

### Issue: "python3 command not found"

**Solution:** Try `python` instead:
```bash
cd /Users/matthew/Desktop && python -m http.server 8080
```

### Issue: Server starts but page won't load

**Check:**
1. Is the Terminal still open? ✓
2. Did you see "Serving HTTP..." message? ✓
3. Is the URL exactly: `http://localhost:8080/HSC-Extension-Maths-Equation-Typer-main/index.html`? ✓

**Try:**
- Clear your browser cache
- Try a different browser
- Check Terminal for error messages

### Issue: LaTeXLive iframe still blank

**Check folder structure:**
```bash
ls -la /Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/
ls -la /Users/matthew/Desktop/LaTeXLive-main/
```

Both folders must exist in `/Users/matthew/Desktop/`

---

## 💡 Understanding the URLs

### File Protocol (❌ Doesn't work)
```
file:///Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/index.html
      ↑
      No server - CORS blocks scripts
```

### HTTP Protocol (✅ Works!)
```
http://localhost:8080/HSC-Extension-Maths-Equation-Typer-main/index.html
      ↑           ↑
   Server     Port
```

The server serves files from `/Users/matthew/Desktop/`, so:
- `localhost:8080/` → `/Users/matthew/Desktop/`
- `localhost:8080/HSC-Extension-Maths-Equation-Typer-main/` → `/Users/matthew/Desktop/HSC-Extension-Maths-Equation-Typer-main/`
- `localhost:8080/LaTeXLive-main/` → `/Users/matthew/Desktop/LaTeXLive-main/`

---

## 🎯 Best Practices

### 1. Keep Terminal Open
While using the app, keep the Terminal window with the server running open.

### 2. Stop Server When Done
When finished:
1. Go to Terminal
2. Press `Ctrl + C`
3. You'll see "KeyboardInterrupt" - this is normal!

### 3. Bookmark the URL
Save this in your browser bookmarks:
```
http://localhost:8080/HSC-Extension-Maths-Equation-Typer-main/index.html
```

### 4. Create a Startup Script
For convenience, create a script:

**start-server.sh:**
```bash
#!/bin/bash
cd /Users/matthew/Desktop
echo "Starting server on http://localhost:8080"
echo "Open: http://localhost:8080/HSC-Extension-Maths-Equation-Typer-main/index.html"
echo ""
echo "Press Ctrl+C to stop"
python3 -m http.server 8080
```

Make it executable:
```bash
chmod +x start-server.sh
```

Run it:
```bash
./start-server.sh
```

---

## 🔐 Security Notes

### Is this safe?

**Yes!** The server:
- ✅ Only runs on your computer
- ✅ Only accessible from your computer
- ✅ Stops when you close Terminal or press Ctrl+C
- ✅ Doesn't expose anything to the internet

### Can others access it?

**No!** `localhost` (127.0.0.1) only works on your machine. Even if you're on a network, others can't access `localhost:8080`.

### What about firewalls?

**No issue!** Since it's localhost-only, your firewall won't block it.

---

## 📊 Comparison Table

| Method | CORS Issues | Setup Difficulty | Speed | Recommended |
|--------|-------------|------------------|-------|-------------|
| **Double-click HTML** | ❌ Blocked | ✅ Easy | ⚡ Fast | ❌ No |
| **HTTP Server** | ✅ Works | ⚠️ Medium | ⚡ Fast | ✅ Yes |
| **VS Code Live Server** | ✅ Works | ✅ Easy | ⚡ Fast | ✅ Yes (if you have VS Code) |

---

## 🎓 Advanced: Why Does CORS Exist?

CORS prevents malicious websites from:
1. Reading your local files without permission
2. Making requests to other sites using your cookies
3. Stealing sensitive data

When using `file://`:
- Origin is `null`
- Each file is treated as a different origin
- Scripts can't load resources from "different" origins

When using `http://localhost`:
- Origin is `http://localhost:8080`
- All files from the server have the same origin
- Scripts can load resources normally

---

## 🆘 Still Having Issues?

### Check Console for Errors
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Look for error messages
4. Share them if you need help!

### Common Console Errors

**"Failed to fetch"**
→ Server isn't running. Start it!

**"net::ERR_CONNECTION_REFUSED"**
→ Wrong port or server stopped. Check Terminal!

**"404 Not Found"**
→ Wrong URL. Check the path!

---

## ✅ Quick Reference

### Start Server
```bash
cd /Users/matthew/Desktop && python3 -m http.server 8080
```

### Open App
```
http://localhost:8080/HSC-Extension-Maths-Equation-Typer-main/index.html
```

### Stop Server
```
Ctrl + C (in Terminal)
```

---

## 🎉 Summary

**Problem:** Browser blocks scripts when using `file://` protocol  
**Solution:** Use HTTP server with `http://localhost:8080`  
**How:** Run `python3 -m http.server 8080` in Terminal  
**Result:** Everything works! ✨

---

**Last Updated:** October 21, 2025  
**Status:** Ready to use!

