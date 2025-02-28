import { HelpCircle } from "lucide-react";

const InfoPanel = ({ theme = 'dark', selectedPoint }) => {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2 flex items-center">
        <HelpCircle size={16} className="mr-1" />
        Help & Information
      </h3>
      <div className={`text-xs space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        <p><strong>Spectrogram Types:</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Magnitude:</strong> Standard STFT spectrogram</li>
          <li><strong>Mel:</strong> Maps to perceptual frequency scale</li>
          <li><strong>Chromagram:</strong> Shows tonal content</li>
          <li><strong>CQT:</strong> Constant-Q Transform</li>
        </ul>

        <p className="mt-3"><strong>FFT Size:</strong> Larger values give better frequency resolution</p>
        <p><strong>Hop Length:</strong> Controls time resolution</p>
        <p><strong>dB Scale:</strong> Logarithmic amplitude scaling</p>
        <p><strong>Window Size:</strong> Length of analysis window</p>
        <p><strong>Overlap:</strong> Percentage of frames that overlap</p>
        
        <div className="mt-3 p-2 rounded-md bg-blue-900/20 border border-blue-700/30">
          <p><strong>Interactive Features:</strong></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Click on the spectrogram to analyze specific points</li>
            <li>Use zoom controls to examine details</li>
            <li>Export as PNG for publication</li>
            <li>Export as JSON for further analysis</li>
          </ul>
        </div>

        {selectedPoint && (
          <div className="mt-3 p-2 rounded-md bg-blue-900/30 border border-blue-700">
            <p className="font-semibold">Selected Point:</p>
            <p>Time: {selectedPoint.time}s</p>
            <p>Frequency: {selectedPoint.frequency} Hz</p>
            <p>Amplitude: {selectedPoint.amplitude}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;