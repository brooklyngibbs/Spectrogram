import requests
import json
import numpy as np
import matplotlib.pyplot as plt
import librosa.display

# Upload the audio file
url = "http://127.0.0.1:8000/generate-spectrogram"
files = {'file': open("test_.wav", 'rb')}
data = {
    "spectrogram_type": "magnitude",
    "window_size": 1024,
    "hop_length": 512,
    "fft_size": 2048,
    "db_scale": True,
    "fmin": 50,
    "fmax": 8000,
    "normalization": "none",
    "overlap": 50,
    "colorScheme": "viridis"
}

response = requests.post(url, files=files, data=data)
spectrogram_data = response.json()["spectrogram_data"]

# Convert back to numpy array
S = np.array(spectrogram_data)

# Plot for verification
plt.figure(figsize=(10, 4))
librosa.display.specshow(S, x_axis="time", y_axis="log", cmap="viridis")
plt.colorbar(label="Amplitude (dB)")
plt.title("Spectrogram Debugging")
plt.show()