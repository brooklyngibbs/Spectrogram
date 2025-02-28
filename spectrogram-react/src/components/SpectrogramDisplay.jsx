import { useRef, useEffect, useState } from "react";
import { applyColormap, getColormap, getColormapGradient } from "../utils/colormaps";

const SpectrogramDisplay = ({ 
  theme = 'dark',
  loading,
  error,
  audioFile,
  spectrogramData,
  settings,
  zoomLevel,
  showSettings,
  toggleSettings,
  selectedPoint,
  setSelectedPoint
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  const [needsScrolling, setNeedsScrolling] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Update container width on resize
  useEffect(() => {
    if (!containerRef.current) return;

    // Initial measurement
    setContainerWidth(containerRef.current.clientWidth);

    // Set up resize observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Canvas click handler to select a point on the spectrogram
  const handleCanvasClick = (e) => {
    if (!canvasRef.current || !spectrogramData) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Convert to time and frequency
    const { spectrogram_data, sample_rate, hop_length } = spectrogramData;
    const time = (x / canvas.width) * (spectrogram_data[0].length * hop_length / sample_rate);

    // Invert y-coordinate because the spectrogram is drawn with y=0 at the top
    const frequency = ((spectrogram_data.length - y) / spectrogram_data.length) *
      (settings.fmax - settings.fmin) + settings.fmin;

    setSelectedPoint({
      x: Math.floor(x),
      y: Math.floor(y),
      time: time.toFixed(3),
      frequency: Math.round(frequency),
      amplitude: spectrogram_data[spectrogram_data.length - 1 - Math.floor(y)][Math.floor(x)].toFixed(2)
    });
  };

  // Check if scrolling is needed
  useEffect(() => {
    if (scrollContainerRef.current && displayDimensions.width > 0) {
      const visibleWidth = scrollContainerRef.current.clientWidth - 50; // Account for padding
      setNeedsScrolling(displayDimensions.width > visibleWidth);
    }
  }, [displayDimensions, containerWidth]);

  // Render spectrogram on canvas when data is available
  useEffect(() => {
    if (!spectrogramData || !canvasRef.current || !settings || !containerWidth) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { spectrogram_data } = spectrogramData;

    // Set canvas dimensions
    const height = spectrogram_data.length;
    const width = spectrogram_data[0].length;

    // Set the canvas dimensions for the data
    canvas.width = width;
    canvas.height = height;

    // Calculate available space accounting for padding, borders, and scrollbar
    const availableWidth = containerWidth - 70; // Account for padding, labels and scrollbar
    
    // Calculate display height based on zoom level
    const displayHeight = Math.min(550, height * zoomLevel);
    
    // For width, we first try to scale proportionally based on height
    let displayWidth = width * (displayHeight / height);
    
    // If displayWidth is smaller than the available space, we can increase it to fill the space
    if (displayWidth < availableWidth && zoomLevel < 1) {
      const newZoom = availableWidth / (width * (displayHeight / height));
      displayWidth = width * newZoom * (displayHeight / height);
    }
    
    // Set the CSS dimensions for display
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // Save display dimensions for reference
    setDisplayDimensions({ width: displayWidth, height: displayHeight });

    // Create image data
    const imageData = ctx.createImageData(width, height);
    
    // Choose colormap based on settings
    const colormap = getColormap(settings.colorScheme);

    // Preprocessing step: calculate min/max once if needed
    let min = Infinity;
    let max = -Infinity;
    if (settings.normalization === "none") {
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          min = Math.min(min, spectrogram_data[i][j]);
          max = Math.max(max, spectrogram_data[i][j]);
        }
      }
      // Avoid division by zero
      if (min === max) {
        max = min + 1;
      }
    }

    // Fill image data with spectrogram values
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Normalize value between 0 and 1
        let value = spectrogram_data[height - y - 1][x]; // Flip y-axis for correct orientation

        // Normalize between 0 and 1 if not already
        if (settings.normalization === "none") {
          value = (value - min) / (max - min);
        }

        // Apply log scaling for better visualization if using dB scale
        if (settings.dbScale) {
          // Already in dB scale from backend, just normalize 0-1 for display
          // Typical dB range is -80 to 0, so scale accordingly
          value = Math.max(0, Math.min(1, (value + 80) / 80));
        }

        // Get color from colormap
        const color = applyColormap(value, colormap);

        // Set pixel in image data
        const idx = (y * width + x) * 4;
        imageData.data[idx] = color[0]; // R
        imageData.data[idx + 1] = color[1]; // G
        imageData.data[idx + 2] = color[2]; // B
        imageData.data[idx + 3] = 255; // A (fully opaque)
      }
    }

    // Put image data on canvas
    ctx.putImageData(imageData, 0, 0);

    // Draw time markers if available
    if (spectrogramData.time_axis_labels) {
      const timeLabelsContainer = document.getElementById('time-labels');
      if (timeLabelsContainer) {
        timeLabelsContainer.innerHTML = '';
        spectrogramData.time_axis_labels.forEach((time, index) => {
          const position = (index / (spectrogramData.time_axis_labels.length - 1)) * 100;
          const label = document.createElement('span');
          label.textContent = time.toFixed(1) + 's';
          label.className = `absolute text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`;
          label.style.left = `${position}%`;
          label.style.transform = 'translateX(-50%)';
          timeLabelsContainer.appendChild(label);
        });
      }
    }

    // Draw selection point if exists
    if (selectedPoint) {
      ctx.beginPath();
      ctx.arc(selectedPoint.x, selectedPoint.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

  }, [spectrogramData, settings, zoomLevel, selectedPoint, theme, containerWidth]);

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/90'} w-full`} ref={containerRef}>
      {loading && (
        <div className={`flex justify-center items-center h-64 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200/50'} rounded-lg`}>
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark' ? 'border-blue-500' : 'border-blue-600'}`}></div>
        </div>
      )}

      {error && (
        <div className={`${theme === 'dark' ? 'bg-red-900/30 border-red-800 text-red-200' : 'bg-red-100 border-red-300 text-red-800'} border p-4 rounded-lg`}>
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {!audioFile && !loading && !error && (
        <div className={`flex flex-col justify-center items-center h-64 ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100'} rounded-lg p-6 text-center`}>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            No audio file loaded. Upload an audio file to generate a spectrogram.
          </p>
          {!showSettings && (
            <button
              onClick={toggleSettings}
              className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              Show Settings Panel
            </button>
          )}
        </div>
      )}

      {!loading && !error && spectrogramData && settings && (
        <div className="p-4 w-full">
          {/* Header with file info */}
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium flex items-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              {audioFile?.name} - {settings.spectrogramType} Spectrogram
            </h3>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              SR: {spectrogramData.sample_rate}Hz | Duration: {spectrogramData.duration?.toFixed(2)}s
            </span>
          </div>

          {/* Main Spectrogram Container - KEY FIXES HERE */}
          <div 
            className={`spectrogram-container ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} rounded-md mb-4 w-full max-w-full`}
          >
            {/* Scroll indicator shown only when needed */}
            {needsScrolling && (
              <div className={`sticky top-0 left-0 right-0 text-xs text-center ${theme === 'dark' ? 'text-gray-400 bg-gray-800/70' : 'text-gray-600 bg-white/70'} py-1 mb-1 z-20 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                <div className="flex justify-between items-center px-4">
                  <span>➡️ Scroll horizontally to view full spectrogram</span>
                  <span>{Math.round(displayDimensions.width)} × {Math.round(displayDimensions.height)} px</span>
                </div>
              </div>
            )}

            {/* Main scrollable area - Important for horizontal scrolling */}
            <div 
              className="overflow-x-auto overflow-y-hidden w-full"
              ref={scrollContainerRef}
              style={{ 
                maxHeight: '600px', 
                scrollbarWidth: 'thin',
                scrollbarColor: theme === 'dark' ? '#4b5563 #1f2937' : '#d1d5db #f3f4f6',
                msOverflowStyle: 'auto' 
              }}
            >
              {/* Inner container with padding for labels */}
              <div className="relative py-2 pl-10 pr-2 min-w-0">
                {/* Grid overlay */}
                <div
                  className="absolute inset-0 pointer-events-none z-0 ml-8"
                  style={{
                    backgroundSize: '20px 20px',
                    backgroundImage: `linear-gradient(to right, ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), 
                                    linear-gradient(to bottom, ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`
                  }}
                ></div>
                
                {/* Frequency labels (y-axis) */}
                <div className={`absolute left-0 top-2 bottom-2 w-8 flex flex-col justify-between text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} z-10`}>
                  <span className="truncate">{settings?.fmax} Hz</span>
                  {settings?.spectrogramType === "mel" && <span className="truncate">Mel scale</span>}
                  {settings?.spectrogramType === "chromagram" && <span className="truncate">Pitch class</span>}
                  <span className="truncate">{settings?.fmin} Hz</span>
                </div>

                {/* Canvas */}
                <canvas
                  ref={canvasRef}
                  className="relative z-5 ml-8"
                  onClick={handleCanvasClick}
                  style={{ 
                    cursor: 'crosshair',
                    maxWidth: '100%' // This might help prevent overflow in some browsers
                  }}
                />
              </div>
            </div>
          </div>

          {/* Time labels (x-axis) */}
          <div id="time-labels" className="relative h-6 mt-1 w-full mb-3">
            <span className="absolute left-0 text-xs text-gray-400">0s</span>
            <span className="absolute right-0 text-xs text-gray-400">
              {spectrogramData.duration?.toFixed(2) || (spectrogramData.spectrogram_data[0].length * spectrogramData.hop_length / spectrogramData.sample_rate).toFixed(2)}s
            </span>
          </div>

          {/* Settings Info in same row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Colormap legend */}
            <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200/70'} flex flex-col`}>
              <div
                className="w-full h-4 rounded"
                style={{
                  backgroundImage: `linear-gradient(to right, ${getColormapGradient(settings.colorScheme)})`,
                }}
              ></div>
              <div className={`flex justify-between w-full text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} px-2 mt-2`}>
                <span>{settings.dbScale ? "Low dB" : "Low"}</span>
                <span className="font-medium">{settings.colorScheme}</span>
                <span>{settings.dbScale ? "High dB" : "High"}</span>
              </div>
            </div>

            {/* FFT Settings */}
            <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200/70'} text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  <span className="font-semibold">FFT Size:</span> {settings.fftSize}
                </div>
                <div>
                  <span className="font-semibold">Hop Length:</span> {settings.hopLength}
                </div>
                <div>
                  <span className="font-semibold">Window Size:</span> {settings.windowSize}
                </div>
                <div>
                  <span className="font-semibold">Overlap:</span> {settings.overlap}%
                </div>
              </div>
            </div>

            {/* Selected point info */}
            <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200/70'} text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {selectedPoint ? (
                <div>
                  <div className="font-semibold mb-1">Selected Point:</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      <span className="font-semibold">Time:</span> {selectedPoint.time}s
                    </div>
                    <div>
                      <span className="font-semibold">Freq:</span> {selectedPoint.frequency} Hz
                    </div>
                    <div>
                      <span className="font-semibold">Amplitude:</span> {selectedPoint.amplitude}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <span className={`italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Click on the spectrogram to analyze specific points
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpectrogramDisplay;