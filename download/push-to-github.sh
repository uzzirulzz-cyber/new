#!/usr/bin/env bash
# ─── BlockExchange.buzz — Push to GitHub ───────────────────────
# Run this script on your own machine after downloading brockExchange-full.tar.gz
#
# Prerequisites:
#   - Git installed (https://git-scm.com)
#   - A GitHub Personal Access Token with "repo" scope
#     (GitHub → Settings → Developer settings → Personal access tokens → Generate new token)
#
# Usage:
#   1. Download brockExchange-full.tar.gz
#   2. Open a terminal in the same folder
#   3. Run: bash push-to-github.sh
#   4. When prompted, paste your GitHub username and Personal Access Token
# ────────────────────────────────────────────────────────────────

set -euo pipefail

REPO_URL="https://github.com/uzzirulzz-cyber/newbrock.git"
TARBALL="brockExchange-full.tar.gz"
DEST_DIR="newbrock"

echo "═══════════════════════════════════════════════════════"
echo "  BlockExchange.buzz — GitHub Push Script"
echo "  Target: uzzirulzz-cyber/newbrock"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if tarball exists
if [ ! -f "$TARBALL" ]; then
  echo "❌ Error: $TARBALL not found in current directory."
  echo "   Make sure you downloaded it and are running this script from the same folder."
  exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo "❌ Error: git is not installed. Install it from https://git-scm.com"
  exit 1
fi

# Extract
echo "📦 Extracting $TARBALL..."
rm -rf "$DEST_DIR"
mkdir "$DEST_DIR"
tar -xzf "$TARBALL" -C "$DEST_DIR"
cd "$DEST_DIR"

echo ""
echo "✅ Project extracted to ./$DEST_DIR"
echo ""

# Configure git if not already configured
if [ -z "$(git config user.email)" ]; then
  echo "⚙️  Configuring git user..."
  git config user.email "dev@blockexchange.buzz"
  git config user.name "BlockExchange Dev"
fi

# Add remote (the tarball already has the git history)
echo "🔗 Adding remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo ""
echo "📤 Pushing to GitHub..."
echo "   Repository: $REPO_URL"
echo ""
echo "   When prompted:"
echo "   - Username: your GitHub username (uzzirulzz-cyber)"
echo "   - Password: your GitHub Personal Access Token (not your account password)"
echo "   Get a token at: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (repo scope)"
echo ""

git push -u origin main --force

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ Successfully pushed to GitHub!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Your repository is now live at:"
echo "  https://github.com/uzzirulzz-cyber/newbrock"
echo ""
echo "  To deploy to Vercel:"
echo "  1. Go to https://vercel.com/new"
echo "  2. Import the newbrock repository"
echo "  3. Add environment variables from .env.example"
echo "  4. Run: bun run db:push && bun run db:seed"
echo "═══════════════════════════════════════════════════════"
