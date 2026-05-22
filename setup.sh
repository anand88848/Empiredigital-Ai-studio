#!/bin/bash
set -e

echo ""
echo "=== Empiredigital AI Studio — Higgsfield Setup ==="
echo ""

# Clone if not already in the repo
if [ ! -f "package.json" ]; then
  git clone https://github.com/anand88848/Empiredigital-Ai-studio -b claude/bold-turing-vfKsl empiredigital-ai-studio
  cd empiredigital-ai-studio
fi

# Install dependencies
echo "→ Installing dependencies..."
npm install --silent

# Write .env.local
echo "→ Writing .env.local..."
cat > .env.local << 'EOF'
HIGGSFIELD_API_KEY=f2dd0cdff609a70556cfd1394be5c50dfb1555ee9f26e7b120f61a29c6310f6b
EOF

echo ""
echo "✓ Done! Starting studio..."
echo "  Open http://localhost:3000/higgsfield in your browser"
echo ""

npm run dev
