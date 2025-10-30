# Backend - NotebookLM Clone

TypeScript/Node.js backend with Express, Prisma, and PostgreSQL.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/notebooklm
JWT_SECRET=your_super_secret_jwt_key_change_this
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
MAX_FILE_SIZE_MB=5
PORT=5000
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations:
```bash
npx prisma migrate dev --name init
```

6. Build TypeScript:
```bash
npm run build
```

7. Start the server:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## Available Scripts

- `npm run dev` - Start development server with tsx watch
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## API Documentation

See main README.md for API endpoint documentation.

## Project Structure

```
src/
├── controllers/       # Request handlers
├── middlewares/       # Auth, upload, etc.
├── routes/           # API routes
├── types/            # TypeScript type definitions
└── server.ts         # Main server file
```
