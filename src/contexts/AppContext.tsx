import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OCRLine {
  text: string;
  bounding: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface OCRBlock {
  text: string;
  lines: OCRLine[];
}

export interface Citation {
  id: string;
  quote: string;
  pageIndex: number;
  highlightRanges: {
    top: number;
    left: number;
    width: number;
    height: number;
  }[];
}

export interface ScannedPage {
  uri: string;
  text: string;
  ocrData?: OCRBlock[];
  pageNumber?: number;
  originalWidth?: number;
  originalHeight?: number;
}

interface AppContextType {
  // Shared state that needs to persist across navigation
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  scannedPages: ScannedPage[];
  setScannedPages: React.Dispatch<React.SetStateAction<ScannedPage[]>>;
  riskReport: string;
  setRiskReport: (report: string) => void;
  citations: Citation[];
  setCitations: (citations: Citation[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedModelId, setSelectedModelId] = useState('llama-3.2-1b-spinquant');
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [riskReport, setRiskReport] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);

  const value: AppContextType = {
    selectedModelId,
    setSelectedModelId,
    scannedPages,
    setScannedPages,
    riskReport,
    setRiskReport,
    citations,
    setCitations,
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
