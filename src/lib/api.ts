const API_BASE_URL = '/.netlify/functions';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error del servidor' }));
    throw new Error(error.error || 'Error en la solicitud');
  }

  return response.json();
}

export const api = {
  // Autenticación
  login: (password: string) =>
    apiCall('/auth', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  // Libros
  getBooks: () => apiCall('/get-books'),
  
  createBook: (bookData: {
    title: string;
    author: string;
    tags: string[];
    rating: number;
    synopsis: string;
    coverImage?: string;
  }) =>
    apiCall('/create-book', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),

  editBook: (slug: string, bookData: Partial<{
    title: string;
    author: string;
    tags: string[];
    rating: number;
    synopsis: string;
  }>) =>
    apiCall('/edit-book', {
      method: 'PUT',
      body: JSON.stringify({ slug, ...bookData }),
    }),

  // Capítulos
  getChapters: (slug: string) => apiCall(`/get-chapters?slug=${slug}`),

  uploadChapter: (slug: string, chapterTitle: string, content: string) =>
    apiCall('/upload-chapter', {
      method: 'POST',
      body: JSON.stringify({ slug, chapterTitle, content }),
    }),

  deleteChapters: (chapters: any[]) =>
    apiCall('/delete-chapters', {
      method: 'DELETE',
      body: JSON.stringify({ chapters }),
    }),
};
