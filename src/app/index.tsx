import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { HomePage } from '../components/HomePage';
import { useAppContext } from '../contexts/AppContext';

export default function Index() {
  const router = useRouter();
  const { setScannedPages, setRiskReport } = useAppContext();

  const handleGetStarted = () => {
    console.log('[GET STARTED] Button clicked, navigating to scanner');
    // Reset shared state
    setScannedPages([]);
    setRiskReport('');
    router.push('/scanner' as Href);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <HomePage onGetStarted={handleGetStarted} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2332', // Professional navy blue
  },
});
