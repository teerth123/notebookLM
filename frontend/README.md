# Frontend - NotebookLM Clone

React TypeScript frontend with Vite and Tailwind CSS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Configure your environment (default works with backend on port 5000):
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── pages/            # Page components
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── Upload.tsx
│   └── ChatView.tsx
├── services/         # API service layer
│   └── api.ts
├── types/           # TypeScript types
│   └── index.ts
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Features

- **Authentication**: Login and signup pages with JWT
- **Dashboard**: View documents and chats
- **Upload**: Upload PDFs with drag-and-drop
- **Chat**: ChatGPT-like interface with sidebar
- **Responsive**: Mobile-friendly design

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
