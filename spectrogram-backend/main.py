from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import librosa
import io
import uvicorn
import logging
import json
from typing import Optional, Union, List

app = FastAPI(title="Audio Spectrogram API")

# Enable CORS with more specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("spectrogram-api")

# Supported colormaps - these match the frontend options
COLORMAPS = {
    "viridis": "viridis",
    "magma": "magma",
    "inferno": "inferno",
    "plasma": "plasma",
    "cividis": "cividis",
}

@app.get("/")
async def root():
    """Root endpoint that provides API information"""
    return {
        "message": "Audio Spectrogram API",
        "endpoints": {
            "/generate-spectrogram": "POST endpoint to generate a spectrogram from an audio file"
        }
    }

@app.post("/generate-spectrogram")
async def generate_spectrogram(
    file: UploadFile = File(...),
    spectrogram_type: str = Form("magnitude"),
    window_size: int = Form(1024),
    hop_length: int = Form(512),
    fft_size: int = Form(2048),
    db_scale: bool = Form(False),
    fmin: int = Form(50),
    fmax: int = Form(8000),
    normalization: str = Form("none"),
    overlap: int = Form(50),
    colorScheme: str = Form("viridis")
):
    """
    Generate a spectrogram from an uploaded audio file.
    
    Parameters:
    - file: The audio file to analyze
    - spectrogram_type: Type of spectrogram to generate (magnitude, mel, chromagram, cqt)
    - window_size: Size of the analysis window in samples
    - hop_length: Number of samples between successive frames
    - fft_size: Length of the FFT window
    - db_scale: Whether to convert to decibel scale
    - fmin: Minimum frequency to display
    - fmax: Maximum frequency to display
    - normalization: Type of normalization to apply (none, minmax, zscore)
    - overlap: Percentage of overlap between windows
    - colorScheme: Colormap to use for visualization
    
    Returns:
    - JSON with spectrogram data, sample rate, and hop length
    """
    try:
        # Log request data
        logger.info(f"Processing file: {file.filename}")
        logger.info(f"Parameters: type={spectrogram_type}, window={window_size}, "
                  f"hop={hop_length}, fft={fft_size}, db={db_scale}, "
                  f"freq_range={fmin}-{fmax}Hz, norm={normalization}, "
                  f"overlap={overlap}%, colormap={colorScheme}")
        
        # Validate parameters
        if spectrogram_type not in ["magnitude", "mel", "chromagram", "cqt"]:
            raise HTTPException(status_code=400, detail="Invalid spectrogram type")
        
        if normalization not in ["none", "minmax", "zscore"]:
            raise HTTPException(status_code=400, detail="Invalid normalization method")
            
        if colorScheme not in COLORMAPS:
            logger.warning(f"Unsupported colormap: {colorScheme}, defaulting to viridis")
            colorScheme = "viridis"
            
        if fmin >= fmax:
            raise HTTPException(status_code=400, detail="fmin must be less than fmax")
        
        # File content validation and loading
        content_type = file.content_type
        if not content_type or not content_type.startswith('audio/'):
            logger.warning(f"Non-audio file received: {content_type}")
            # Continue anyway as librosa can handle various formats
        
        # Read file content
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file")
            
        # Process audio data
        try:
            audio, sr = librosa.load(io.BytesIO(contents), sr=None)
        except Exception as e:
            logger.error(f"Failed to load audio file: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid audio file: {str(e)}")
            
        # Calculate actual hop length based on overlap
        hop_length = int(window_size * (1 - overlap / 100))
        
        # Generate spectrogram based on type
        try:
            if spectrogram_type == "mel":
                # Mel spectrogram for perceptual frequency scaling
                S = librosa.feature.melspectrogram(
                    y=audio, 
                    sr=sr, 
                    n_fft=fft_size, 
                    hop_length=hop_length, 
                    win_length=window_size,
                    n_mels=128, 
                    fmin=fmin, 
                    fmax=min(fmax, sr//2)
                )
            elif spectrogram_type == "chromagram":
                # Chromagram for pitch class content
                S = librosa.feature.chroma_stft(
                    y=audio, 
                    sr=sr, 
                    n_fft=fft_size, 
                    hop_length=hop_length,
                    win_length=window_size
                )
            elif spectrogram_type == "cqt":
                # Constant-Q transform for logarithmic frequency scaling
                S = np.abs(librosa.cqt(
                    audio, 
                    sr=sr, 
                    hop_length=hop_length, 
                    fmin=fmin,
                    n_bins=84,
                    bins_per_octave=12
                ))
            else:
                # Regular magnitude spectrogram from STFT
                D = librosa.stft(
                    audio, 
                    n_fft=fft_size, 
                    hop_length=hop_length, 
                    win_length=window_size
                )
                S = np.abs(D)
                
                # Apply frequency filtering if needed
                if fmin > 0 or fmax < sr//2:
                    # Convert frequency to bin indices
                    freq_bins = librosa.fft_frequencies(sr=sr, n_fft=fft_size)
                    min_bin = np.argmin(np.abs(freq_bins - fmin))
                    max_bin = np.argmin(np.abs(freq_bins - fmax))
                    # Apply frequency filtering
                    S = S[min_bin:max_bin+1]
        except Exception as e:
            logger.error(f"Error generating spectrogram: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error generating spectrogram: {str(e)}")
            
        # Apply normalization
        try:
            if normalization == "minmax":
                eps = np.finfo(float).eps  # Small epsilon to avoid division by zero
                S = (S - np.min(S)) / (np.max(S) - np.min(S) + eps)
            elif normalization == "zscore":
                eps = np.finfo(float).eps
                mean = np.mean(S)
                std = np.std(S) + eps
                S = (S - mean) / std
        except Exception as e:
            logger.error(f"Error in normalization: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error in normalization: {str(e)}")
            
        # Apply dB scale if requested
        if db_scale:
            try:
                S = librosa.amplitude_to_db(S, ref=np.max)
            except Exception as e:
                logger.error(f"Error in dB conversion: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error in dB conversion: {str(e)}")
                
        # Prepare response
        logger.info(f"Spectrogram generated successfully. Shape: {S.shape}")
        
        # Convert to list with minimal precision to reduce payload size
        spectrogram_list = S.astype(np.float32).tolist()
        
        response_data = {
            "spectrogram_data": spectrogram_list,
            "sample_rate": int(sr),
            "hop_length": int(hop_length),
            "duration": float(len(audio) / sr),
            "shape": list(S.shape),
            "time_axis_labels": [float(i * hop_length / sr) for i in range(0, S.shape[1], max(1, S.shape[1] // 10))],
        }
        
        return JSONResponse(content=response_data)

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        # Log unexpected errors
        logger.exception(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# Add health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)