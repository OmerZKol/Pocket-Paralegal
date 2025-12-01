import React from 'react';
import { useRouter, Href } from 'expo-router';
import { ResultsScreen } from '../screens/ResultsScreen';
import { useAppContext } from '../contexts/AppContext';

export default function Results() {
  const router = useRouter();
  const { riskReport, citations, scannedPages, setScannedPages, setRiskReport } = useAppContext();

  const handleBack = () => {
    setRiskReport('');
    setScannedPages([]);
    router.push('/scanner' as Href);
  };

  const handleStartOver = () => {
    setScannedPages([]);
    setRiskReport('');
    router.push('/' as Href);
  };

  return (
    <ResultsScreen
      riskReport={riskReport}
      citations={citations}
      scannedPages={scannedPages}
      onBack={handleBack}
      onStartOver={handleStartOver}
    />
  );
}
