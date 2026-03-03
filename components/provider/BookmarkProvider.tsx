import React, { createContext, useContext, useEffect, useState } from 'react';
import { getBookmarks, saveBookmarks } from '@/lib/storage/bookmark-storage';

type BookmarkState = {
  bookmarks: string[];
  toggle: (id: string) => void;
};

const BookmarkContext = createContext<BookmarkState | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    getBookmarks().then(setBookmarks);
  }, []);

  const toggle = async (id: string) => {
    const exists = bookmarks.includes(id);
    const updated = exists ? bookmarks.filter((b) => b !== id) : [...bookmarks, id];

    setBookmarks(updated);
    await saveBookmarks(updated);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, toggle }}>{children}</BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error('useBookmarks must be inside BookmarkProvider');
  return ctx;
}
