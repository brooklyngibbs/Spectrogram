import { useState, useEffect, useRef } from "react";
import AudioPlayer from "./AudioPlayer";
import SpectrogramSettings from "./SpectrogramSettings";
import SpectrogramDisplay from "./SpectrogramDisplay";
import VisualizerToolbar from "./VisualizerToolbar";
import InfoPanel from "./InfoPanel";
import { generateSpectrogram } from "../utils/spectrogramAPI";

const SpectrogramVisualizer = ({ theme = 'dark' }) => {
  const [audioFile, setAudioFile] = useState(null);
  const [spectrogramData, setSpectrogramData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Handle file upload from AudioPlayer
  const handleFileUpload = (file) => {
    setAudioFile(file);
    setSpectrogramData(null); // Clear previous spectrogram
    setSelectedPoint(null);
  };

  // Handle settings change from SpectrogramSettings
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Toggle info panel
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  // Handle zoom in/out
  const handleZoom = (direction) => {
    if (direction === 'in' && zoomLevel < 3) {
      setZoomLevel(prev => prev + 0.25);
    } else if (direction === 'out' && zoomLevel > 0.5) {
      setZoomLevel(prev => prev - 0.25);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Update fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Generate spectrogram when file and settings are available
  useEffect(() => {
    if (!audioFile || !settings) return;

    // Add a small debounce to avoid too many API calls during rapid setting changes
    const debounceTimeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setSelectedPoint(null);
      
      try {
        const data = await generateSpectrogram(audioFile, settings);
        setSpectrogramData(data);
      } catch (err) {
        console.error("Error generating spectrogram:", err);
        setError("Failed to generate spectrogram: " + err.message);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimeout);
  }, [audioFile, settings]);

  return (
    // Added max-w-full to ensure the component doesn't overflow its parent
    <div ref={containerRef} className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} max-w-full`}>
      <div className="flex flex-col">
        {/* Control toolbar */}
        <VisualizerToolbar 
          theme={theme}
          showSettings={showSettings}
          showInfo={showInfo}
          toggleSettings={toggleSettings}
          toggleInfo={toggleInfo}
          zoomLevel={zoomLevel}
          handleZoom={handleZoom}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          spectrogramData={spectrogramData}
          settings={settings}
          audioFile={audioFile}
        />

        {/* Added overflow-hidden to prevent content from spilling out */}
        <div className="flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Left side: Settings & Info */}
          {(showSettings || showInfo) && (
            <div className={`flex-none w-full lg:w-80 space-y-4 ${isFullscreen ? 'lg:h-screen overflow-y-auto' : ''}`}>
              {/* Audio Player always visible when settings panel is open */}
              {showSettings && (
                <div className={`rounded-lg shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'}`}>
                  <AudioPlayer
                    onFileUpload={handleFileUpload}
                    theme={theme}
                  />
                </div>
              )}

              {/* Settings Panel */}
              {showSettings && (
                <div className={`rounded-lg shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'}`}>
                  <div className="p-3">
                    <SpectrogramSettings
                      onChange={handleSettingsChange}
                      theme={theme}
                    />
                  </div>
                </div>
              )}

              {/* Info Panel */}
              {showInfo && (
                <div className={`rounded-lg shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'}`}>
                  <InfoPanel 
                    theme={theme}
                    selectedPoint={selectedPoint}
                  />
                </div>
              )}
            </div>
          )}

          {/* Right side: Main visualization area - Added min-w-0 to allow proper flex sizing */}
          <div className="flex-grow min-w-0 overflow-hidden">
            <SpectrogramDisplay
              theme={theme}
              loading={loading}
              error={error}
              audioFile={audioFile}
              spectrogramData={spectrogramData}
              settings={settings}
              zoomLevel={zoomLevel}
              showSettings={showSettings}
              toggleSettings={toggleSettings}
              selectedPoint={selectedPoint}
              setSelectedPoint={setSelectedPoint}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectrogramVisualizer;