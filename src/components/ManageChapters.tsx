import React, { useState, useEffect } from 'react';
import { Book, Chapter } from '../types';
import { api } from '../lib/api';
import { Trash2, Upload, FileText } from 'lucide-react';

interface ManageChaptersProps {
  books: Book[];
  onRefresh: () => void;
}

export function ManageChapters({ books, onRefresh }: ManageChaptersProps) {
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newChapter, setNewChapter] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    if (selectedBook) {
      loadChapters();
    }
  }, [selectedBook]);

  const loadChapters = async () => {
    if (!selectedBook) return;

    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.getChapters(selectedBook);
      setChapters(response.chapters);
      setSelectedChapters(new Set());
    } catch (err: any) {
      setError(err.message || 'Error al cargar capítulos');
      setChapters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChapter = (path: string) => {
    const newSelected = new Set(selectedChapters);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedChapters(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedChapters.size === 0) return;

    if (!confirm(`¿Estás seguro de eliminar ${selectedChapters.size} capítulo(s)?`)) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const chaptersToDelete = chapters.filter(ch => selectedChapters.has(ch.path));
      await api.deleteChapters(chaptersToDelete);
      await loadChapters();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar capítulos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    setIsLoading(true);
    setError('');

    try {
      await api.uploadChapter(selectedBook, newChapter.title, newChapter.content);
      setNewChapter({ title: '', content: '' });
      setShowUploadForm(false);
      await loadChapters();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al subir capítulo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Libro
        </label>
        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">-- Selecciona un libro --</option>
          {books.map((book) => (
            <option key={book.slug} value={book.slug}>
              {book.title} - {book.author}
            </option>
          ))}
        </select>
      </div>

      {selectedBook && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Capítulos ({chapters.length})
            </h3>
            <div className="flex gap-3">
              {selectedChapters.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar Seleccionados ({selectedChapters.size})
                </button>
              )}
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Upload className="w-4 h-4" />
                Subir Capítulo
              </button>
            </div>
          </div>

          {showUploadForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Nuevo Capítulo</h4>
              <form onSubmit={handleUploadChapter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Capítulo
                  </label>
                  <input
                    type="text"
                    value={newChapter.title}
                    onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Ej: Capítulo 1 - El Comienzo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido (Markdown)
                  </label>
                  <textarea
                    value={newChapter.content}
                    onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                    rows={12}
                    placeholder="# Capítulo 1

Contenido del capítulo en formato Markdown..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadForm(false);
                      setNewChapter({ title: '', content: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isLoading ? 'Subiendo...' : 'Subir Capítulo'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isLoading && !showUploadForm ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Cargando capítulos...</div>
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No hay capítulos en este libro</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedChapters.size === chapters.length && chapters.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedChapters(new Set(chapters.map(ch => ch.path)));
                          } else {
                            setSelectedChapters(new Set());
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamaño
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chapters.map((chapter) => (
                    <tr key={chapter.path} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedChapters.has(chapter.path)}
                          onChange={() => handleToggleChapter(chapter.path)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">{chapter.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(chapter.size / 1024).toFixed(2)} KB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
