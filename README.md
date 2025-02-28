# 🎶 Spectrogram Visualizer

**A sleek, interactive audio spectrogram visualizer built with React, TailwindCSS, and FastAPI.**

## 🔥 Features
- **Upload & Analyze Audio**: Supports MP3, WAV, FLAC, OGG, and more.
- **Interactive Spectrogram**: Click to inspect time, frequency, and amplitude.
- **Customizable Settings**: Adjust FFT size, hop length, color schemes, and more.
- **Export Options**: Save spectrograms as images or JSON files.
- **Keyboard Shortcuts**: Spacebar to play/pause, arrow keys to seek.
- **Dark & Light Modes**: Choose your vibe. 🌙☀️

## 🛠️ Tech Stack
### Frontend (React + TailwindCSS)
- **Audio Player**: Handles playback, seeking, and volume control.
- **Spectrogram Display**: Renders frequency data dynamically using the canvas API.
- **Spectrogram Settings**: Customization panel with presets and user-defined settings.
- **Visualizer Toolbar**: Controls zoom, fullscreen, and exports.

### Backend (FastAPI)
- **Audio Processing**: Uses `librosa` to extract frequency data.
- **Spectrogram Generation**: Supports Magnitude, Mel, Chromagram, and CQT spectrograms.
- **Normalization & Scaling**: dB conversion, Min-Max, and Z-score normalization.
- **CORS Enabled**: Allows seamless API requests from the frontend.

## 🚀 Getting Started
### 1. Clone the Repository
```sh
git clone https://github.com/brooklyngibbs/Spectrogram.git
cd Spectrogram
```

### 2. Install Dependencies
#### Frontend (React)
```sh
cd spectrogram-react
npm install
```

#### Backend (FastAPI)
```sh
cd spectrogram-backend
pip install -r requirements.txt
```

### 3. Run the Project
#### Start the Backend Server
```sh
uvicorn main:app --reload
```

#### Start the Frontend
```sh
npm run dev
```

## 🎨 Customization
- **Change Color Maps**: Modify `SpectrogramSettings.js` to add more color options.
- **Modify FFT & Hop Length**: Adjust these in `generate-spectrogram` API parameters.
- **Enable Real-Time Processing**: Future feature (WebAssembly could be explored).

## 💡 Future Improvements
- ✅ **Optimize Large File Handling** (Streaming instead of loading everything in memory)
- ✅ **More Customization** (User-defined colormaps)
- ✅ **WebAssembly Processing** (Move calculations to the frontend for speed)
- ✅ **Real-Time Spectrograms** (Live audio visualization)
- ✅ **Save & Share Spectrograms** (Persistent storage)

## 📜 License
MIT License © 2025 Brooklyn Gibbs

---

Made with ❤️ and a whole lot of **FFT calculations**. 🚀

