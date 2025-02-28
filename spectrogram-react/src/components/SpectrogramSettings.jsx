import { useState, useEffect } from "react";
import { Settings, Save, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

const SpectrogramSettings = ({ onChange, theme = 'dark' }) => {
    const [settings, setSettings] = useState({
        colorScheme: "viridis",
        spectrogramType: "magnitude",
        windowSize: 1024,
        hopLength: 512,
        fftSize: 2048,
        dbScale: false,
        fmin: 50,
        fmax: 8000,
        overlap: 50,
        normalization: "none",
    });
    
    const [presets, setPresets] = useState([
        { name: "Speech Analysis", settings: { spectrogramType: "mel", fftSize: 2048, windowSize: 1024, hopLength: 512, dbScale: true, fmin: 50, fmax: 8000, overlap: 75, normalization: "minmax", colorScheme: "magma" } },
        { name: "Music Harmonics", settings: { spectrogramType: "chromagram", fftSize: 4096, windowSize: 2048, hopLength: 1024, dbScale: true, fmin: 20, fmax: 16000, overlap: 75, normalization: "minmax", colorScheme: "plasma" } },
        { name: "Low Latency", settings: { spectrogramType: "magnitude", fftSize: 512, windowSize: 256, hopLength: 128, dbScale: true, fmin: 20, fmax: 20000, overlap: 50, normalization: "none", colorScheme: "viridis" } },
    ]);
    
    const [activeSection, setActiveSection] = useState("basic");
    const [isDirty, setIsDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        if (onChange) {
            onChange(settings);
        }
        
        // Mark as dirty if settings change after initial load
        if (lastSaved) {
            setIsDirty(true);
        }
    }, [settings, onChange]);

    const updateSetting = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    
    const resetSettings = () => {
        setSettings({
            colorScheme: "viridis",
            spectrogramType: "magnitude",
            windowSize: 1024,
            hopLength: 512,
            fftSize: 2048,
            dbScale: false,
            fmin: 50,
            fmax: 8000,
            overlap: 50,
            normalization: "none",
        });
        setIsDirty(false);
    };
    
    const savePreset = () => {
        const presetName = prompt("Enter a name for this preset:");
        if (!presetName) return;
        
        const newPreset = {
            name: presetName,
            settings: { ...settings }
        };
        
        setPresets(prev => [...prev, newPreset]);
        setLastSaved(new Date());
        setIsDirty(false);
    };
    
    const loadPreset = (presetSettings) => {
        setSettings(presetSettings);
        setIsDirty(false);
        setLastSaved(new Date());
    };
    
    // Toggle section visibility
    const toggleSection = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    return (
        <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold flex items-center">
                    <Settings size={16} className="mr-1" />
                    Spectrogram Settings
                </h3>
                <div className="flex space-x-1">
                    <button 
                        onClick={resetSettings} 
                        className={`p-1 rounded-md text-xs ${theme === 'dark' ? 'hover:bg-gray-600 bg-gray-700' : 'hover:bg-gray-300 bg-gray-200'}`}
                        title="Reset to defaults"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button 
                        onClick={savePreset} 
                        className={`p-1 rounded-md text-xs ${theme === 'dark' ? 'hover:bg-blue-600 bg-blue-700' : 'hover:bg-blue-500 bg-blue-600'} text-white`}
                        title="Save as preset"
                    >
                        <Save size={14} />
                    </button>
                </div>
            </div>
            
            {/* Presets Dropdown */}
            <div className="mb-3">
                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Presets</label>
                <select
                    className={`w-full py-1 px-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
                    onChange={(e) => {
                        if (e.target.value === "") return;
                        const preset = presets.find(p => p.name === e.target.value);
                        if (preset) loadPreset(preset.settings);
                    }}
                    value=""
                >
                    <option value="">Select a preset...</option>
                    {presets.map((preset, index) => (
                        <option key={index} value={preset.name}>{preset.name}</option>
                    ))}
                </select>
            </div>
            
            {/* Basic Settings Section */}
            <div className="mb-2">
                <button 
                    className={`flex w-full items-center justify-between p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => toggleSection("basic")}
                >
                    <span className="font-medium">Basic Settings</span>
                    {activeSection === "basic" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {activeSection === "basic" && (
                    <div className={`mt-2 p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                            <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Type</label>
                                <select
                                    className={`w-full py-1 px-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'}`}
                                    value={settings.spectrogramType}
                                    onChange={(e) => updateSetting("spectrogramType", e.target.value)}
                                >
                                    <option value="magnitude">Magnitude</option>
                                    <option value="mel">Mel</option>
                                    <option value="chromagram">Chromagram</option>
                                    <option value="cqt">CQT</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Color</label>
                                <select
                                    className={`w-full py-1 px-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'}`}
                                    value={settings.colorScheme}
                                    onChange={(e) => updateSetting("colorScheme", e.target.value)}
                                >
                                    <option value="viridis">Viridis</option>
                                    <option value="magma">Magma</option>
                                    <option value="inferno">Inferno</option>
                                    <option value="plasma">Plasma</option>
                                    <option value="cividis">Cividis</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Min Freq (Hz)</label>
                                <input
                                    type="number"
                                    className={`w-full py-1 px-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'}`}
                                    value={settings.fmin}
                                    onChange={(e) => updateSetting("fmin", parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Max Freq (Hz)</label>
                                <input
                                    type="number"
                                    className={`w-full py-1 px-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'}`}
                                    value={settings.fmax}
                                    onChange={(e) => updateSetting("fmax", parseInt(e.target.value))}
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={settings.dbScale}
                                        onChange={() => updateSetting("dbScale", !settings.dbScale)}
                                        className="mr-2 h-4 w-4"
                                    />
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Use dB Scale (logarithmic)
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Advanced Settings Section */}
            <div className="mb-2">
                <button 
                    className={`flex w-full items-center justify-between p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => toggleSection("advanced")}
                >
                    <span className="font-medium">Advanced Settings</span>
                    {activeSection === "advanced" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {activeSection === "advanced" && (
                    <div className={`mt-2 p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                            <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>FFT Size</label>
                                <select
                                    className={`w-full py-1 px-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'}`}
                                    value={settings.fftSize}
                                    onChange={(e) => updateSetting("fftSize", parseInt(e.target.value))}
                                >
                                    <option value="512">512</option>
                                    <option value="1024">1024</option>
                                    <option value="2048">2048</option>
                                    <option value="4096">4096</option>
                                    <option value="8192">8192</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Window Size</label>
                                <select
                                    className={`w-full py-1 px-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'}`}
                                    value={settings.windowSize}
                                    onChange={(e) => updateSetting("windowSize", parseInt(e.target.value))}
                                >
                                    <option value="256">256</option>
                                    <option value="512">512</option>
                                    <option value="1024">1024</option>
                                    <option value="2048">2048</option>
                                    <option value="4096">4096</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Overlap (%)</label>
                                <input
                                    type="number"
                                    className={`w-full py-1 px-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'}`}
                                    value={settings.overlap}
                                    min="0"
                                    max="90"
                                    onChange={(e) => updateSetting("overlap", Math.min(90, parseInt(e.target.value)))}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Hop Length</label>
                                <input
                                    type="number"
                                    className={`w-full py-1 px-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'}`}
                                    value={settings.hopLength}
                                    onChange={(e) => updateSetting("hopLength", parseInt(e.target.value))}
                                />
                            </div>
                            
                            <div>
                                <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Normalization</label>
                                <select
                                    className={`w-full py-1 px-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-300'}`}
                                    value={settings.normalization}
                                    onChange={(e) => updateSetting("normalization", e.target.value)}
                                >
                                    <option value="none">None</option>
                                    <option value="minmax">Min-Max</option>
                                    <option value="zscore">Z-Score</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className={`mt-3 p-2 rounded-md text-xs ${theme === 'dark' ? 'bg-gray-800/50 text-gray-400' : 'bg-white/70 text-gray-600'}`}>
                            <p><strong>Expert mode:</strong> These settings control time-frequency resolution tradeoffs.</p>
                            <p className="mt-1">
                                <strong>Higher FFT size:</strong> Better frequency resolution, worse time resolution
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Status indicator */}
            {isDirty && (
                <div className="mt-3 text-xs text-center">
                    <span className={`px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-yellow-800/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
                        Settings changed - not saved as preset
                    </span>
                </div>
            )}
        </div>
    );
};

export default SpectrogramSettings;