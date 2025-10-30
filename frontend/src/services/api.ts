import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, Document, Chat, ChatWithMessages, Message } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration - only redirect on actual auth errors, not all errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: any) => {
        // Only redirect to login if it's an authentication error AND we're not already on login page
        if ((error.response?.status === 401 || error.response?.status === 403) && 
            window.location.pathname !== '/login' && 
            window.location.pathname !== '/signup') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>('/auth/register', { email, password });
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  }

  async deleteAccount(): Promise<{ message: string }> {
    const { data } = await this.api.delete('/auth/account');
    return data;
  }

  // Documents
  async uploadDocument(file: File): Promise<{ message: string; document: Document }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await this.api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  async getDocuments(): Promise<{ documents: Document[] }> {
    const { data } = await this.api.get('/documents');
    return data;
  }

  async deleteDocument(id: string): Promise<{ message: string }> {
    const { data } = await this.api.delete(`/documents/${id}`);
    return data;
  }

  // Chats
  async createChat(documentId: string): Promise<{ message: string; chat: Chat }> {
    const { data } = await this.api.post('/chats', { documentId });
    return data;
  }

  async getChats(): Promise<{ chats: Chat[] }> {
    const { data } = await this.api.get('/chats');
    return data;
  }

  async getChatMessages(chatId: string): Promise<{ chat: ChatWithMessages }> {
    const { data } = await this.api.get(`/chats/${chatId}/messages`);
    return data;
  }

  async sendMessage(
    chatId: string,
    question: string
  ): Promise<{ message: string; userMessage: Message; assistantMessage: Message }> {
    const { data } = await this.api.post(`/chats/${chatId}/message`, { question });
    return data;
  }

  async deleteChat(chatId: string): Promise<{ message: string }> {
    const { data } = await this.api.delete(`/chats/${chatId}`);
    return data;
  }
}

export default new ApiService();
