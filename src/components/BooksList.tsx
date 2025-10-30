import React from 'react';
import { Book } from '../types';
import { Edit2, BookOpen, Star } from 'lucide-react';

interface BooksListProps {
  books: Book[];
  onEdit: (book: Book) => void;
}

export function BooksList({ books, onEdit }: BooksListProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No hay libros creados aún</p>
        <p className="text-gray-500 text-sm mt-2">Crea tu primer libro usando el formulario de arriba</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <div
          key={book.slug}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{book.title}</h3>
                <p className="text-sm text-gray-600">por {book.author}</p>
              </div>
              <button
                onClick={() => onEdit(book)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Editar libro"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < book.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">({book.rating})</span>
            </div>

            {book.tags && book.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {book.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {book.synopsis && (
              <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                {book.synopsis}
              </p>
            )}

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Slug: <span className="font-mono text-gray-700">{book.slug}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
