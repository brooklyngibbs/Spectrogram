/**
 * Downloads the spectrogram as PNG image
 * @param {Object} spectrogramData - The spectrogram data
 * @param {Object} settings - The visualization settings
 * @param {File} audioFile - The audio file object
 */
export const downloadSpectrogram = (spectrogramData, settings, audioFile) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = `${audioFile?.name || 'spectrogram'}_${settings.spectrogramType}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  /**
   * Exports the spectrogram data as JSON
   * @param {Object} spectrogramData - The spectrogram data
   * @param {Object} settings - The visualization settings
   * @param {File} audioFile - The audio file object
   */
  export const exportSpectrogramData = (spectrogramData, settings, audioFile) => {
    if (!spectrogramData) return;
    
    // Create export data with metadata
    const exportData = {
      data: spectrogramData,
      settings: settings,
      metadata: {
        filename: audioFile?.name,
        createdAt: new Date().toISOString(),
        sampleRate: spectrogramData.sample_rate,
        duration: spectrogramData.duration
      }
    };
    
    // Convert to JSON string
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = `${audioFile?.name || 'spectrogram'}_${settings.spectrogramType}.json`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
    }, 100);
  };