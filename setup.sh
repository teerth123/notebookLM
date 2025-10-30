#!/bin/bash

echo "🚀 Setting up NotebookLM Clone..."

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd backend

# Copy env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file - Please update with your credentials!"
else
    echo "ℹ️  .env file already exists"
fi

# Install dependencies
echo "📥 Installing backend dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "⚠️  IMPORTANT: Update backend/.env with your credentials:"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - JWT_SECRET (random secret key)"
echo "   - CLOUDINARY credentials"
echo "   - GEMINI_API_KEY"
echo ""
echo "Then run: cd backend && npx prisma migrate dev --name init"
echo ""

# Frontend setup
cd ../frontend
echo "📦 Setting up Frontend..."

# Copy env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created frontend .env file"
else
    echo "ℹ️  .env file already exists"
fi

# Install dependencies
echo "📥 Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your credentials"
echo "2. Run database migration: cd backend && npx prisma migrate dev --name init"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "🎉 Enjoy your NotebookLM clone!"
