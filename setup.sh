#!/bin/bash
echo "Setting up Empiredigital AI Studio..."

cat > .env.local << 'EOF'
# Anthropic API Key
ANTHROPIC_API_KEY=your_api_key_here

# Higgsfield AI
HIGGSFIELD_CREDENTIALS=1b1b35d6-7505-48b8-84f9-26c3084768de:c5cc5e60b5dba6b900ddda090eb0e0447390ac5facbcf34a7ab154ac43d43672

NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo ".env.local created!"
npm install
echo "Opening browser..."
open http://localhost:3000/higgsfield 2>/dev/null || xdg-open http://localhost:3000/higgsfield 2>/dev/null
npm run dev
