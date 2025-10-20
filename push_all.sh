#!/bin/bash

# Helper script to push all changes to GitHub
# Run this when you have network access: bash push_all.sh

set -e  # Exit on any error

echo "════════════════════════════════════════════════════════════════"
echo "  Pushing HSC Extension Maths Equation Typer to GitHub"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📍 Current directory: $SCRIPT_DIR"
echo ""

# Step 1: Push LaTeXLive submodule
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 STEP 1: Pushing LaTeXLive submodule..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd LaTeXLive
if git push origin main; then
    echo "✅ LaTeXLive submodule pushed successfully!"
else
    echo "❌ Failed to push LaTeXLive submodule"
    exit 1
fi
cd ..
echo ""

# Step 2: Push main repository
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 STEP 2: Pushing main repository..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if git push origin main; then
    echo "✅ Main repository pushed successfully!"
else
    echo "❌ Failed to push main repository"
    exit 1
fi
echo ""

# Success message
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ ALL CHANGES PUSHED SUCCESSFULLY!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📝 NEXT STEP: Enable GitHub Pages"
echo ""
echo "1. Visit: https://github.com/matthewhuyijun/HSC-Extension-Maths-Equation-Typer/settings/pages"
echo ""
echo "2. Under 'Source', select: GitHub Actions"
echo ""
echo "3. Your site will be deployed to:"
echo "   https://matthewhuyijun.github.io/HSC-Extension-Maths-Equation-Typer/"
echo ""
echo "4. Check deployment status at:"
echo "   https://github.com/matthewhuyijun/HSC-Extension-Maths-Equation-Typer/actions"
echo ""
echo "════════════════════════════════════════════════════════════════"


