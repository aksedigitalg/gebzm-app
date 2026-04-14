"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { SearchSheet } from "./SearchSheet";

interface SearchContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SearchContext.Provider value={{ open, close, isOpen }}>
      {children}
      <SearchSheet isOpen={isOpen} onClose={close} />
    </SearchContext.Provider>
  );
}
