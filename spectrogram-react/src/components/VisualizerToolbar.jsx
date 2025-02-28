import { FileText, Download, ZoomIn, ZoomOut, Maximize, Sliders, Info } from "lucide-react";
import { downloadSpectrogram, exportSpectrogramData } from "../utils/exportUtils";

const VisualizerToolbar = ({
  theme = 'dark',
  showSettings,
  showInfo,
  toggleSettings,
  toggleInfo,
  zoomLevel,
  handleZoom,
  isFullscreen,
  toggleFullscreen,
  spectrogramData,
  settings,
  audioFile
}) => {
  return (
    <div className={`flex justify-between items-center mb-4 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-200/70'}`}>
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleSettings}
          className={`p-2 rounded-md ${theme === 'dark' ?
            'hover:bg-gray-600 ' + (showSettings ? 'bg-gray-600' : 'bg-gray-700') :
            'hover:bg-gray-300 ' + (showSettings ? 'bg-gray-300' : 'bg-gray-200')}`}
          title="Toggle Settings Panel"
        >
          <Sliders size={18} />
        </button>
        <button
          onClick={toggleInfo}
          className={`p-2 rounded-md ${theme === 'dark' ?
            'hover:bg-gray-600 ' + (showInfo ? 'bg-gray-600' : 'bg-gray-700') :
            'hover:bg-gray-300 ' + (showInfo ? 'bg-gray-300' : 'bg-gray-200')}`}
          title="Toggle Info Panel"
        >
          <Info size={18} />
        </button>
      </div>

      <div className="flex items-center">
        <h2 className="text-lg font-semibold hidden sm:block">Audio Spectrogram Visualizer</h2>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleZoom('out')}
          disabled={zoomLevel <= 0.5}
          className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-600 bg-gray-700' : 'hover:bg-gray-300 bg-gray-200'} 
            ${zoomLevel <= 0.5 ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => handleZoom('in')}
          disabled={zoomLevel >= 3}
          className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-600 bg-gray-700' : 'hover:bg-gray-300 bg-gray-200'} 
            ${zoomLevel >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-600 bg-gray-700' : 'hover:bg-gray-300 bg-gray-200'}`}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <Maximize size={18} />
        </button>
        {spectrogramData && settings && (
          <>
            <button
              onClick={() => downloadSpectrogram(spectrogramData, settings, audioFile)}
              className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-600 bg-gray-700' : 'hover:bg-gray-300 bg-gray-200'}`}
              title="Download as PNG"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => exportSpectrogramData(spectrogramData, settings, audioFile)}
              className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-600 bg-gray-700' : 'hover:bg-gray-300 bg-gray-200'}`}
              title="Export Data as JSON"
            >
              <FileText size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VisualizerToolbar;