import React, { createContext, ReactNode } from 'react';
import stores from './index';

// Context containing all stores
export const StoresContext = createContext(stores);

interface StoresProviderProps {
  children: ReactNode;
}

/**
 * Provider component that provides all stores to the application
 * Place this component at the highest level in the application, typically in App.tsx
 */
const StoresProvider: React.FC<StoresProviderProps> = ({ children }) => {
  return (
    <StoresContext.Provider value={stores}>
      {children}
    </StoresContext.Provider>
  );
};

export default StoresProvider; 