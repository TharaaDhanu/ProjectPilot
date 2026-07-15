/**
 * context/SidebarContext.js
 * -------------------------
 * Context for managing left and right sidebar collapse states.
 * Persists state to localStorage.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [leftCollapsed, setLeftCollapsed] = useState(() => {
    const saved = localStorage.getItem('leftSidebarCollapsed');
    return saved === 'true';
  });

  const [rightCollapsed, setRightCollapsed] = useState(() => {
    const saved = localStorage.getItem('rightSidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('leftSidebarCollapsed', leftCollapsed);
  }, [leftCollapsed]);

  useEffect(() => {
    localStorage.setItem('rightSidebarCollapsed', rightCollapsed);
  }, [rightCollapsed]);

  const toggleLeft = () => setLeftCollapsed(prev => !prev);
  const toggleRight = () => setRightCollapsed(prev => !prev);

  return (
    <SidebarContext.Provider value={{
      leftCollapsed,
      rightCollapsed,
      toggleLeft,
      toggleRight,
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;