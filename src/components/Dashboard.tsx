import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Book } from '../types';
import { api } from '../lib/api';
import { CreateBookForm } from './CreateBookForm';
import { BooksList } from './BooksList';
import { EditBookModal } from './EditBookModal';
import { ManageChapters } from './ManageChapters';
import { LogOut, BookPlus, BookOpen, FileText } from 'lucide-react';

export function Dashboard() {
  const { logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'edit' | 'chapters'>('create');
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.getBooks();
      setBooks(response.books);
    } catch (err: any) {
      setError(err.message || 'Error al cargar libros');
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadBooks();
    setActiveTab('edit');
  };

  const handleEditSuccess = () => {
    loadBooks();
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Marestria Admin</h1>
                <p className="text-sm text-gray-500">Panel de Gestión de Libros</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'create'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookPlus className="w-5 h-5" />
                Crear Libro
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'edit'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Editar Libros
              </button>
              <button
                onClick={() => setActiveTab('chapters')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'chapters'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5" />
                Gestionar Capítulos
              </button>
            </nav>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            {isLoading && !books.length ? (
              <div className="text-center py-12">
                <div className="text-gray-600">Cargando...</div>
              </div>
            ) : (
              <>
                {activeTab === 'create' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Libro</h2>
                    <CreateBookForm onSuccess={handleCreateSuccess} />
                  </div>
                )}

                {activeTab === 'edit' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Libros Existentes ({books.length})
                    </h2>
                    <BooksList books={books} onEdit={handleEditBook} />
                  </div>
                )}

                {activeTab === 'chapters' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestionar Capítulos</h2>
                    <ManageChapters books={books} onRefresh={loadBooks} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Libros</p>
                <p className="text-2xl font-bold text-gray-900">{books.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Última Actualización</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookPlus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="text-lg font-semibold text-green-600">Activo</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingBook && (
        <EditBookModal
          book={editingBook}
          isOpen={!!editingBook}
          onClose={() => setEditingBook(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
