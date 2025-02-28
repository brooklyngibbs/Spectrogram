import './App.css';
import { useState, useEffect } from 'react';
import { SpectrogramProvider, useSpectrogram } from './context/SpectrogramContext';
import SpectrogramVisualizer from './components/SpectrogramVisualizer';
import { Sun, Moon, AlertTriangle } from 'lucide-react';

const AppContent = () => {
  const { theme, toggleTheme, serverAvailable } = useSpectrogram();
  const [showServerAlert, setShowServerAlert] = useState(false);
  
  // Show server warning if server is not available
  useEffect(() => {
    if (serverAvailable === false) {
      setShowServerAlert(true);
    }
  }, [serverAvailable]);
  
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-screen flex flex-col`}> 
      {/* Header */}
      <header className={`w-full py-3 px-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">
              SonoViz <span className="text-xs font-normal opacity-75">Spectrogram Visualizer</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Server Alert */}
      {showServerAlert && (
        <div className={`${theme === 'dark' ? 'bg-amber-900/30 border-amber-800 text-amber-200' : 'bg-amber-100 border-amber-300 text-amber-800'} border p-3 mx-auto my-2 max-w-7xl rounded-md flex items-center`}>
          <AlertTriangle className="mr-2 flex-shrink-0" size={18} />
          <div className="flex-grow text-sm">
            Unable to connect to the backend server. Please ensure the FastAPI server is running at http://localhost:8000.
          </div>
          <button 
            onClick={() => setShowServerAlert(false)}
            className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'hover:bg-amber-800/50' : 'hover:bg-amber-200/50'}`}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 flex-grow">
        <SpectrogramVisualizer theme={theme} />
      </main>
      
      {/* Footer */}
      <footer className={`py-4 ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'} text-center text-sm`}>
        <p>SonoViz © 2024 - A professional audio spectrogram visualization tool for MIR research</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <SpectrogramProvider>
      <AppContent />
    </SpectrogramProvider>
  );
}

export default App;