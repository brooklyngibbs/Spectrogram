import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { checkServerStatus } from '../utils/spectrogramAPI';

// Create context
const SpectrogramContext = createContext(null);

/**
 * Provider component for spectrogram visualization functionality
 */
export const SpectrogramProvider = ({ children, initialTheme = 'dark' }) => {
  const [theme, setTheme] = useState(initialTheme);
  const [serverAvailable, setServerAvailable] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [favoriteSettings, setFavoriteSettings] = useState([]);

  // Check server status on mount
  useEffect(() => {
    const checkServer = async () => {
      const isAvailable = await checkServerStatus();
      setServerAvailable(isAvailable);
    };
    
    checkServer();
    
    // Set up periodic server check every 30 seconds
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Toggle theme between dark and light
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  }, []);
  
  // Add a file to recent files
  const addRecentFile = useCallback((file) => {
    setRecentFiles(prev => {
      // Only keep the 5 most recent files
      const updatedFiles = [file, ...prev.filter(f => f.name !== file.name)].slice(0, 5);
      
      // Save to localStorage
      try {
        localStorage.setItem('recentFiles', JSON.stringify(
          updatedFiles.map(f => ({ name: f.name, lastUsed: new Date().toISOString() }))
        ));
      } catch (e) {
        console.warn('Failed to save recent files to localStorage:', e);
      }
      
      return updatedFiles;
    });
  }, []);
  
  // Save settings as favorite
  const saveFavoriteSettings = useCallback((name, settings) => {
    setFavoriteSettings(prev => {
      const updatedSettings = [
        { name, settings, createdAt: new Date().toISOString() },
        ...prev.filter(s => s.name !== name)
      ];
      
      // Save to localStorage
      try {
        localStorage.setItem('favoriteSettings', JSON.stringify(updatedSettings));
      } catch (e) {
        console.warn('Failed to save favorite settings to localStorage:', e);
      }
      
      return updatedSettings;
    });
  }, []);

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      // Load favorite settings
      const savedSettings = localStorage.getItem('favoriteSettings');
      if (savedSettings) {
        setFavoriteSettings(JSON.parse(savedSettings));
      }
      
      // We can't restore actual File objects, but we can remember names
      const savedFiles = localStorage.getItem('recentFiles');
      if (savedFiles) {
        const fileInfos = JSON.parse(savedFiles);
        // Just store the metadata since we can't restore the actual files
        setRecentFiles(fileInfos.map(info => ({ name: info.name, isStoredMetadataOnly: true })));
      }
    } catch (e) {
      console.warn('Failed to load saved data from localStorage:', e);
    }
  }, []);

  // Create context value
  const contextValue = {
    theme,
    toggleTheme,
    serverAvailable,
    recentFiles,
    addRecentFile,
    favoriteSettings,
    saveFavoriteSettings
  };

  return (
    <SpectrogramContext.Provider value={contextValue}>
      {children}
    </SpectrogramContext.Provider>
  );
};

/**
 * Hook to use the spectrogram context
 */
export const useSpectrogram = () => {
  const context = useContext(SpectrogramContext);
  if (!context) {
    throw new Error('useSpectrogram must be used within a SpectrogramProvider');
  }
  return context;
};