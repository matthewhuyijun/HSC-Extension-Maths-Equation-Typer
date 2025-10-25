#!/bin/bash

# HSC Equation Typer + LaTeXLive - Server Launcher
# This script starts a local HTTP server to avoid CORS issues

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║    HSC Extension Maths Equation Typer + LaTeXLive           ║"
echo "║                  Local Server Launcher                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Change to Desktop directory
cd /Users/matthew/Desktop

echo "📂 Working directory: $(pwd)"
echo ""

# Check if port 1234 is already in use
if lsof -Pi :1234 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 1234 is already in use!"
    echo ""
    echo "Options:"
    echo "1. The server might already be running - try opening the app:"
    echo "   http://localhost:1234/HSC-Extension-Maths-Equation-Typer-main/index.html"
    echo ""
    echo "2. Stop the existing server and run this script again"
    echo ""
    read -p "Press Enter to try opening the app anyway..."
    open "http://localhost:1234/HSC-Extension-Maths-Equation-Typer-main/index.html"
    exit 0
fi

echo "🚀 Starting HTTP server on port 1234..."
echo ""
echo "✅ Server URL: http://localhost:1234"
echo "✅ App URL: http://localhost:1234/HSC-Extension-Maths-Equation-Typer-main/index.html"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 IMPORTANT:"
echo "   • Keep this window open while using the app"
echo "   • Press Ctrl+C to stop the server when done"
echo "   • Your app will open in your browser automatically"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait 2 seconds then open the browser
sleep 2
echo "🌐 Opening your browser..."
open "http://localhost:1234/HSC-Extension-Maths-Equation-Typer-main/index.html"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Server is running... (Ctrl+C to stop)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the Python HTTP server
python3 -m http.server 1234

