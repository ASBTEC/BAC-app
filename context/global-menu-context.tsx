import React, { createContext, useContext, useState } from 'react';

interface GlobalMenuContextValue {
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

const GlobalMenuContext = createContext<GlobalMenuContextValue>({
  menuOpen: false,
  openMenu: () => {},
  closeMenu: () => {},
});

export function GlobalMenuProvider({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <GlobalMenuContext.Provider value={{ menuOpen, openMenu: () => setMenuOpen(true), closeMenu: () => setMenuOpen(false) }}>
      {children}
    </GlobalMenuContext.Provider>
  );
}

export function useGlobalMenu() {
  return useContext(GlobalMenuContext);
}
