#!/bin/bash

# Simple HTTP server starter for E2 MathsTyper
# This script starts a local web server so ES6 modules work properly

echo "🚀 Starting E2 MathsTyper local server..."
echo ""

PORT=8000

# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $PORT is already in use"
    echo "   Trying to kill existing process..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Try different server options
if command -v python3 &> /dev/null; then
    echo "✅ Using Python 3 HTTP server"
    echo "📝 Open your browser to: http://localhost:$PORT/index.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "✅ Using Python 2 HTTP server"
    echo "📝 Open your browser to: http://localhost:$PORT/index.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer $PORT
elif command -v npx &> /dev/null; then
    echo "✅ Using npx serve"
    echo "📝 Open your browser to: http://localhost:$PORT/index.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    npx serve -l $PORT
elif command -v php &> /dev/null; then
    echo "✅ Using PHP built-in server"
    echo "📝 Open your browser to: http://localhost:$PORT/index.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    php -S localhost:$PORT
else
    echo "❌ No suitable HTTP server found!"
    echo ""
    echo "Please install one of the following:"
    echo "  - Python 3: brew install python3"
    echo "  - Node.js: brew install node"
    echo "  - PHP: brew install php"
    exit 1
fi

