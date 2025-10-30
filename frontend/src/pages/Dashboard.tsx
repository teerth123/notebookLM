import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Document, Chat } from '../types';

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docsRes, chatsRes] = await Promise.all([
        api.getDocuments(),
        api.getChats(),
      ]);
      setDocuments(docsRes.documents);
      setChats(chatsRes.chats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure? This will delete the PDF and all associated chats.')) {
      return;
    }

    try {
      await api.deleteDocument(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">NotebookLM</h1>
          <div className="flex gap-4">
            <Link
              to="/upload"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Upload PDF
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Documents Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Your Documents
              </h2>
              {documents.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500">No documents uploaded yet</p>
                  <Link
                    to="/upload"
                    className="inline-block mt-4 text-indigo-600 hover:text-indigo-700"
                  >
                    Upload your first PDF
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {doc.originalName}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                          {doc.chats && doc.chats.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                              {doc.chats.length} chat{doc.chats.length > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-700 ml-4"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chats Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Recent Chats
              </h2>
              {chats.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500">No chats yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Upload a PDF to start chatting
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => navigate(`/chat/${chat.id}`)}
                      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <h3 className="font-medium text-gray-900 truncate">
                        {chat.title}
                      </h3>
                      {chat.document && (
                        <p className="text-sm text-gray-500 mt-1">
                          {chat.document.originalName}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(chat.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
