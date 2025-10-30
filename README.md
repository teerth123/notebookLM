# NotebookLM Clone - Full Stack TypeScript Application

A full-stack web application similar to NotebookLM that allows users to upload PDFs, extract text, and chat with the document content using Google's Gemini AI.

## 🚀 Features

- **Authentication**: Secure user registration and login with JWT
- **PDF Upload**: Upload PDFs up to 5MB with automatic text extraction
- **AI Chat**: Ask questions about your PDFs using Gemini AI
- **Chat History**: Save and resume conversations
- **Document Management**: Manage your uploaded PDFs and associated chats
- **Modern UI**: Responsive design with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express** (TypeScript)
- **PostgreSQL** database with **Prisma** ORM
- **JWT** for authentication
- **Cloudinary** for PDF storage
- **pdf-parse** for text extraction
- **Google Gemini AI** for chat responses

### Frontend
- **React** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Cloudinary account
- Google Gemini API key

## 🔧 Installation

### 1. Clone the repository

```bash
cd NoteboolLM
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/notebooklm
# JWT_SECRET=your_super_secret_jwt_key
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
# GEMINI_API_KEY=your_gemini_api_key
# MAX_FILE_SIZE_MB=5
# PORT=5000

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Build TypeScript
npm run build

# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed (default: http://localhost:5000/api)
# VITE_API_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

## 🚀 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Create an account or login
3. Upload a PDF document (max 5MB)
4. Start chatting with your document
5. Your chat history is automatically saved

## 📁 Project Structure

```
NoteboolLM/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── chatController.ts
│   │   │   └── documentController.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   └── upload.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── chats.ts
│   │   │   └── documents.ts
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Signup.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Upload.tsx
    │   │   └── ChatView.tsx
    │   ├── services/
    │   │   └── api.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    └── vite.config.ts
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `DELETE /api/auth/account` - Delete account (authenticated)

### Documents
- `POST /api/documents` - Upload PDF (authenticated)
- `GET /api/documents` - Get all user documents (authenticated)
- `DELETE /api/documents/:id` - Delete document (authenticated)

### Chats
- `POST /api/chats` - Create new chat (authenticated)
- `GET /api/chats` - Get all user chats (authenticated)
- `GET /api/chats/:chatId/messages` - Get chat messages (authenticated)
- `POST /api/chats/:chatId/message` - Send message (authenticated)
- `DELETE /api/chats/:chatId` - Delete chat (authenticated)

## 🗄️ Database Schema

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  createdAt DateTime   @default(now())
  chats     Chat[]
  documents Document[]
}

model Document {
  id            String   @id @default(cuid())
  userId        String
  originalName  String
  cloudinaryUrl String
  cloudinaryId  String
  extractedText String   @db.Text
  createdAt     DateTime @default(now())
  chats         Chat[]
}

model Chat {
  id         String    @id @default(cuid())
  userId     String
  documentId String
  title      String
  messages   Message[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Message {
  id        String   @id @default(cuid())
  chatId    String
  role      String   // "user" or "assistant"
  content   String   @db.Text
  createdAt DateTime @default(now())
}
```

## 🎯 Key Features Explained

### PDF Upload & Processing
- Files are validated (PDF only, max 5MB)
- Text is extracted using pdf-parse
- Original PDF stored in Cloudinary
- Extracted text saved in PostgreSQL

### Chat System
- No chunking or embeddings
- Full extracted text sent to Gemini API with each question
- Simple and straightforward implementation
- Chat history persisted in database

### Security
- Passwords hashed with bcrypt
- JWT tokens for authentication
- User-specific data isolation
- Secure file upload handling

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs.

## 📝 License

ISC

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Make sure PostgreSQL is running
# Check your DATABASE_URL in .env
npx prisma studio  # Test database connection
```

### Cloudinary Upload Fails
```bash
# Verify your Cloudinary credentials
# Check file size limit (max 5MB)
```

### Gemini API Errors
```bash
# Verify your GEMINI_API_KEY
# Check API quota and limits
```

## 🎓 Development Commands

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript
npm start           # Run production build
npx prisma studio   # Open Prisma Studio
npx prisma migrate dev  # Run migrations
```

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

---

Built with ❤️ using TypeScript, React, Node.js, and PostgreSQL
