/**
 * Search context for sharing search state across layouts and pages
 * Created by CaptainCode
 */

import { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within SearchProvider');
  }
  return context;
}
