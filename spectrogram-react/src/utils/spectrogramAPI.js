/**
 * Generates a spectrogram by sending data to the backend API
 * @param {File} audioFile - The audio file to analyze
 * @param {Object} settings - The spectrogram settings
 * @returns {Promise<Object>} - The spectrogram data
 */
export const generateSpectrogram = async (audioFile, settings) => {
    // Create form data with file and settings
    const formData = new FormData();
    formData.append("file", audioFile);
    
    // Add all settings to the form data
    formData.append("spectrogram_type", settings.spectrogramType);
    formData.append("window_size", settings.windowSize);
    formData.append("hop_length", settings.hopLength);
    formData.append("fft_size", settings.fftSize);
    formData.append("db_scale", settings.dbScale);
    formData.append("fmin", settings.fmin);
    formData.append("fmax", settings.fmax);
    formData.append("normalization", settings.normalization);
    formData.append("overlap", settings.overlap);
    formData.append("colorScheme", settings.colorScheme);
  
    // Send request to backend
    const response = await fetch("http://localhost:8000/generate-spectrogram", {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      // Try to get error details from response
      let errorDetail = "Unknown error";
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorData.message || response.statusText;
      } catch {
        errorDetail = response.statusText || `Error code: ${response.status}`;
      }
      throw new Error(errorDetail);
    }
  
    // Parse and return the data
    const data = await response.json();
    return data;
  };
  
  /**
   * Checks if the API server is available
   * @returns {Promise<boolean>} - Whether the server is available
   */
  export const checkServerStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/health", { 
        method: "GET",
        timeout: 3000 
      });
      return response.ok;
    } catch (error) {
      console.error("Server check failed:", error);
      return false;
    }
  };