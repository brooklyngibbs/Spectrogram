// Define standard colormaps
const colormaps = {
    viridis: [
      0.267, 0.005, 0.329,
      0.283, 0.141, 0.458,
      0.259, 0.260, 0.536,
      0.206, 0.371, 0.553,
      0.153, 0.475, 0.530,
      0.125, 0.575, 0.480,
      0.164, 0.671, 0.380,
      0.291, 0.761, 0.233,
      0.493, 0.834, 0.082,
      0.749, 0.875, 0.066
    ],
    magma: [
      0.001, 0.000, 0.013,
      0.088, 0.061, 0.221,
      0.281, 0.080, 0.418,
      0.480, 0.088, 0.474,
      0.659, 0.143, 0.452,
      0.820, 0.243, 0.390,
      0.935, 0.378, 0.299,
      0.990, 0.559, 0.235,
      0.996, 0.759, 0.316,
      0.988, 0.966, 0.678
    ],
    inferno: [
      0.001, 0.000, 0.014,
      0.122, 0.047, 0.212,
      0.324, 0.063, 0.365,
      0.531, 0.093, 0.366,
      0.721, 0.155, 0.288,
      0.866, 0.251, 0.195,
      0.957, 0.390, 0.123,
      0.988, 0.575, 0.144,
      0.961, 0.790, 0.325,
      0.835, 0.980, 0.650
    ],
    plasma: [
      0.050, 0.030, 0.528,
      0.255, 0.017, 0.586,
      0.417, 0.005, 0.580,
      0.568, 0.040, 0.525,
      0.706, 0.121, 0.425,
      0.824, 0.226, 0.311,
      0.910, 0.347, 0.200,
      0.962, 0.494, 0.093,
      0.973, 0.662, 0.043,
      0.941, 0.850, 0.152
    ],
    cividis: [
      0.000, 0.135, 0.304,
      0.080, 0.196, 0.350,
      0.165, 0.250, 0.375,
      0.253, 0.305, 0.392,
      0.345, 0.363, 0.403,
      0.437, 0.420, 0.410,
      0.536, 0.480, 0.414,
      0.640, 0.545, 0.414,
      0.749, 0.618, 0.415,
      0.875, 0.705, 0.412
    ]
  };
  
  /**
   * Gets a colormap array based on name
   * @param {string} name - The name of the colormap
   * @returns {Array} - The colormap array
   */
  export const getColormap = (name) => {
    return colormaps[name] || colormaps.viridis;
  };
  
  /**
   * Applies a colormap to a value
   * @param {number} value - A value between 0 and 1
   * @param {Array} colormap - The colormap array to use
   * @returns {Array} - An RGB array [r, g, b] with values 0-255
   */
  export const applyColormap = (value, colormap) => {
    // Ensure value is between 0 and 1
    value = Math.max(0, Math.min(1, value));
    
    // Map value to colormap
    const idx = Math.floor(value * (colormap.length/3 - 1)) * 3;
    return [
      colormap[idx] * 255,
      colormap[idx + 1] * 255,
      colormap[idx + 2] * 255
    ];
  };
  
  /**
   * Gets CSS gradient string for a colormap
   * @param {string} colorScheme - The name of the colormap
   * @returns {string} - CSS gradient string
   */
  export const getColormapGradient = (colorScheme) => {
    const gradients = {
      viridis: "#440154, #3b528b, #21918c, #5ec962, #fde725",
      magma: "#000004, #3b0f70, #8c2981, #de4968, #fca50a, #fcfdbf",
      inferno: "#000004, #420a68, #932667, #dd513a, #fca50a, #fcffa4",
      plasma: "#0d0887, #5b02a3, #9a179b, #cb4678, #ec7853, #fdb32f, #f0f921",
      cividis: "#00224e, #084c8d, #3d81b2, #73a9c9, #a6cee1, #daded3, #fafa8c"
    };
    
    return gradients[colorScheme] || "#000000, #ffffff";
  };