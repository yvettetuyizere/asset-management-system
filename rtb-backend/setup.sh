#!/bin/bash
# setup.sh - Quick setup script for RTB Backend

echo "🚀 RTB Backend Setup Script"
echo "============================"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual database credentials!"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️  Building TypeScript..."
npm run build

echo ""
echo "============================"
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Create database: createdb rtb_database"
echo "3. Run development server: npm run dev"
echo ""
echo "For more information, see:"
echo "- README.md for complete documentation"
echo "- QUICKSTART.md for quick start guide"
echo "- IMPLEMENTATION_SUMMARY.md for what was built"
echo ""
