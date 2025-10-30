export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Document {
  id: string;
  originalName: string;
  cloudinaryUrl: string;
  createdAt: string;
  chats?: Chat[];
}

export interface Chat {
  id: string;
  title: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  document?: {
    id: string;
    originalName: string;
  };
  messages?: Message[];
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
  document: {
    id: string;
    originalName: string;
  };
}
