import { useState, useEffect, useCallback } from 'react';
import { ResourceFetcher } from 'react-native-executorch';

/**
 * Hook to track which models are downloaded locally
 * Returns a Set of downloaded .pte model filenames
 */
export function useDownloadedModels() {
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const checkDownloadedModels = useCallback(async () => {
    try {
      setIsLoading(true);
      const allFiles = await ResourceFetcher.listDownloadedFiles();

      // Use listDownloadedFiles as it should include everything
      const files = allFiles;

      // Extract just the filenames from full paths
      const filenames = files.map(path => {
        const parts = path.split('/');
        return parts[parts.length - 1];
      });

      setDownloadedFiles(new Set(filenames));
    } catch (error) {
      setDownloadedFiles(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkDownloadedModels();
  }, [checkDownloadedModels]);

  const isModelDownloaded = (modelUrl: string): boolean => {
    // Extract filename from URL (e.g., "llama3_2_bf16.pte")
    const urlFilename = modelUrl.split('/').pop() || '';

    // The downloaded files have the full URL path encoded in the filename
    // e.g., "huggingface.co_software-mansion_..._llama3_2_bf16.pte"
    // So we need to check if any downloaded file ends with the URL filename
    const result = Array.from(downloadedFiles).some(file => file.endsWith(urlFilename));

    return result;
  };

  return {
    downloadedFiles,
    isLoading,
    isModelDownloaded,
    refresh: checkDownloadedModels,
  };
}
