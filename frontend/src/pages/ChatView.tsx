import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ChatWithMessages, Message, Chat } from '../types';

export default function ChatView() {
  const { chatId } = useParams<{ chatId: string }>();
  const [chat, setChat] = useState<ChatWithMessages | null>(null);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (chatId) {
      loadChat();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    try {
      const response = await api.getChats();
      setAllChats(response.chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadChat = async () => {
    if (!chatId) return;

    try {
      const response = await api.getChatMessages(chatId);
      setChat(response.chat);
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim() || !chatId || sending) return;

    const userQuestion = question;
    setQuestion('');
    setSending(true);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: 'temp-user',
      chatId,
      role: 'user',
      content: userQuestion,
      createdAt: new Date().toISOString(),
    };

    setChat((prev) => prev ? {
      ...prev,
      messages: [...prev.messages, tempUserMessage],
    } : null);

    try {
      const response = await api.sendMessage(chatId, userQuestion);
      
      // Replace temp message with real messages
      setChat((prev) => {
        if (!prev) return null;
        const withoutTemp = prev.messages.filter((m: Message) => m.id !== 'temp-user');
        return {
          ...prev,
          messages: [...withoutTemp, response.userMessage, response.assistantMessage],
        };
      });
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.error || 'Failed to send message');
      
      // Remove temp message on error
      setChat((prev) => prev ? {
        ...prev,
        messages: prev.messages.filter((m: Message) => m.id !== 'temp-user'),
      } : null);
      
      setQuestion(userQuestion);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async (chatIdToDelete: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      await api.deleteChat(chatIdToDelete);
      
      if (chatIdToDelete === chatId) {
        navigate('/');
      } else {
        loadChats();
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert('Failed to delete chat');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700">
          <Link to="/" className="text-xl font-bold">
            NotebookLM
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link
            to="/upload"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-center transition-colors"
          >
            + New Chat
          </Link>

          <div className="mt-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Recent Chats
            </h3>
            {allChats.map((c: Chat) => (
              <div
                key={c.id}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  c.id === chatId
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => navigate(`/chat/${c.id}`)}
              >
                <div className="flex-1 truncate">
                  <p className="text-sm truncate">{c.title}</p>
                  {c.document && (
                    <p className="text-xs text-gray-400 truncate">
                      {c.document.originalName}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-2 text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <Link
            to="/"
            className="block text-center text-sm text-gray-400 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {chat && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{chat.title}</h1>
                {chat.document && (
                  <p className="text-sm text-gray-500">{chat.document.originalName}</p>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : chat ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {chat.messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <p className="text-lg">Start a conversation about this document</p>
                  <p className="text-sm mt-2">Ask any question about the PDF content</p>
                </div>
              ) : (
                chat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12">
              <p>Chat not found</p>
            </div>
          )}
        </div>

        {/* Input */}
        {chat && (
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
                  placeholder="Ask a question about the document..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || sending}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
