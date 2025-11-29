import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ScannedPage {
  uri: string;
  text: string;
}

interface AppContextType {
  // Shared state that needs to persist across navigation
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  scannedPages: ScannedPage[];
  setScannedPages: (pages: ScannedPage[]) => void;
  riskReport: string;
  setRiskReport: (report: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedModelId, setSelectedModelId] = useState('llama-3.2-1b');
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [riskReport, setRiskReport] = useState('');

  const value: AppContextType = {
    selectedModelId,
    setSelectedModelId,
    scannedPages,
    setScannedPages,
    riskReport,
    setRiskReport,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
