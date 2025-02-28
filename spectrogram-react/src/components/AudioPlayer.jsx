import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Upload, Music, Volume2, VolumeX } from "lucide-react";

const AudioPlayer = ({ onFileUpload, theme = 'dark' }) => {
    const [file, setFile] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [audioMetadata, setAudioMetadata] = useState(null);
    const audioRef = useRef(null);
    const inputRef = useRef(null);
    const seekBarRef = useRef(null);

    // Handle File Upload
    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files?.[0];
        if (uploadedFile) {
            processFile(uploadedFile);
        }
    };
    
    // Handle Drag and Drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };
    
    // Process uploaded file
    const processFile = (uploadedFile) => {
        console.log("File uploaded:", uploadedFile);
        setFile(uploadedFile);
        setAudioURL(URL.createObjectURL(uploadedFile));
        setIsPlaying(false);
        setCurrentTime(0);
        
        // Extract audio metadata when possible
        extractAudioMetadata(uploadedFile);

        // Pass the uploaded file to the Spectrogram component
        if (onFileUpload) {
            onFileUpload(uploadedFile);
        }
    };
    
    // Extract audio metadata
    const extractAudioMetadata = async (file) => {
        // Basic metadata from file object
        const metadata = {
            name: file.name,
            type: file.type,
            size: formatFileSize(file.size),
            lastModified: new Date(file.lastModified).toLocaleString()
        };
        
        setAudioMetadata(metadata);
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    // Play/Pause Toggle
    const togglePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Handle Seek Bar Change
    const handleSeek = (event) => {
        if (!audioRef.current) return;
        const newTime = (event.target.value / 100) * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };
    
    // Handle seek bar click (for precise positioning)
    const handleSeekBarClick = (e) => {
        if (!seekBarRef.current || !audioRef.current || !duration) return;
        
        const rect = seekBarRef.current.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const newTime = clickPosition * duration;
        
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    // Skip Forward and Back
    const skip = (amount) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime += amount;
        setCurrentTime(audioRef.current.currentTime);
    };
    
    // Handle Volume Change
    const handleVolumeChange = (event) => {
        const newVolume = parseFloat(event.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        if (newVolume === 0) {
            setIsMuted(true);
        } else {
            setIsMuted(false);
        }
    };
    
    // Toggle Mute
    const toggleMute = () => {
        if (!audioRef.current) return;
        
        if (isMuted) {
            audioRef.current.volume = volume || 0.5;
            setIsMuted(false);
        } else {
            audioRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    // Update Current Time and Duration in Real-Time
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => setCurrentTime(audio.currentTime);
        const setAudioDuration = () => setDuration(audio.duration);
        const handleEnd = () => setIsPlaying(false);
        
        // Set initial volume
        audio.volume = volume;

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", setAudioDuration);
        audio.addEventListener("ended", handleEnd);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", setAudioDuration);
            audio.removeEventListener("ended", handleEnd);
        };
    }, [audioURL, volume]);

    // Format Time (mm:ss)
    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };
    
    // Play/pause with keyboard
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only respond if this component is in focus
            if (!file) return;
            
            if (e.code === "Space") {
                e.preventDefault(); // Prevent scrolling
                togglePlayPause();
            } else if (e.code === "ArrowLeft") {
                skip(-5);
            } else if (e.code === "ArrowRight") {
                skip(5);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [file, isPlaying]);

    return (
        <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} p-4`}>
            <h3 className="font-semibold mb-2 flex items-center">
                <Music size={16} className="mr-1" />
                Audio Player
            </h3>
            
            {/* File Upload Area */}
            {!file && (
                <div 
                    className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer mb-4
                        ${dragOver ? 
                            theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-100/50' : 
                            theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <Upload className={`mx-auto mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Drag & drop an audio file or click to browse</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Supports MP3, WAV, FLAC, OGG, and more</p>
                </div>
            )}
            
            {/* Hidden File Input */}
            <input
                type="file"
                accept="audio/*"
                className="hidden"
                ref={inputRef}
                onChange={handleFileUpload}
            />
            
            {/* Audio Player UI */}
            {file && (
                <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-100/60'} p-4`}>
                    {/* File Info */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between">
                            <div className="truncate max-w-[80%]">
                                <p className={`font-medium truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                    {file.name}
                                </p>
                                {audioMetadata && (
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {audioMetadata.size} · {audioMetadata.type.split('/')[1]?.toUpperCase()}
                                    </p>
                                )}
                            </div>
                            <button
                                className={`text-xs px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                onClick={() => inputRef.current?.click()}
                            >
                                Change
                            </button>
                        </div>
                    </div>
                    
                    {/* Seek Bar */}
                    <div className="mb-2 relative">
                        <div 
                            className={`w-full h-2 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
                            ref={seekBarRef}
                            onClick={handleSeekBarClick}
                        >
                            {/* Progress indicator */}
                            <div 
                                className="absolute top-0 left-0 h-2 rounded-lg bg-blue-500"
                                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <input
                            type="range"
                            className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
                            min="0"
                            max="100"
                            value={duration ? (currentTime / duration) * 100 : 0}
                            onChange={handleSeek}
                        />
                    </div>
                    
                    {/* Time Display */}
                    <div className="flex justify-between text-xs mb-4">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {formatTime(currentTime)}
                        </span>
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {formatTime(duration)}
                        </span>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {/* Skip Back */}
                            <button
                                className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded-md transition-colors`}
                                onClick={() => skip(-10)}
                                title="Skip back 10 seconds"
                            >
                                <SkipBack size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                            </button>

                            {/* Play/Pause Button */}
                            <button
                                className={`p-3 mx-2 ${isPlaying ? 'bg-blue-600' : 'bg-blue-500'} hover:bg-blue-600 rounded-full transition-colors`}
                                onClick={togglePlayPause}
                            >
                                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                            </button>

                            {/* Skip Forward */}
                            <button
                                className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded-md transition-colors`}
                                onClick={() => skip(10)}
                                title="Skip forward 10 seconds"
                            >
                                <SkipForward size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                            </button>
                        </div>
                        
                        {/* Volume Control */}
                        <div className="flex items-center">
                            <button 
                                onClick={toggleMute}
                                className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded-md transition-colors`}
                            >
                                {isMuted ? (
                                    <VolumeX size={20} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                                ) : (
                                    <Volume2 size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                                )}
                            </button>
                            <div className="relative w-20 h-2 mx-2">
                                <div className={`absolute top-0 left-0 w-full h-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                <div className="absolute top-0 left-0 h-2 rounded-lg bg-blue-500" style={{ width: `${volume * 100}%` }}></div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Hidden Audio Element */}
                    <audio ref={audioRef} src={audioURL} preload="metadata"></audio>
                </div>
            )}
            
            {/* Keyboard shortcuts info */}
            {file && (
                <div className={`mt-3 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} text-center`}>
                    <p>Spacebar to play/pause · Arrow keys to skip 5s</p>
                </div>
            )}
        </div>
    );
};

export default AudioPlayer;