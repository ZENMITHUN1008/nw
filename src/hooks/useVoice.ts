import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  VoiceService, 
  createVoiceService, 
   
  VoiceSettings,
  ElevenLabsVoice,
  isVoiceServiceConfigured 
} from '../services/voiceService';

interface UseVoiceOptions {
  apiKey?: string;
  voiceId?: string;
  voiceSettings?: Partial<VoiceSettings>;
  autoPlay?: boolean;
  maxRecordingDuration?: number;
}

interface VoiceState {
  isRecording: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  isTranscribing: boolean;
  error: string | null;
  recordingDuration: number;
  lastTranscription: string | null;
  availableVoices: ElevenLabsVoice[];
  isSupported: boolean;
  isConfigured: boolean;
}

interface UseVoiceReturn extends VoiceState {
  // Speech-to-Text functions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  recordAndTranscribe: () => Promise<string>;
  
  // Text-to-Speech functions
  speak: (text: string, voiceId?: string) => Promise<void>;
  stopSpeaking: () => void;
  
  // Voice management
  setVoiceId: (voiceId: string) => void;
  setVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  loadVoices: () => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  cleanup: () => void;
}

export const useVoice = (options: UseVoiceOptions = {}): UseVoiceReturn => {
  const {
    apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '',
    voiceId: initialVoiceId = VoiceService.VOICES.RACHEL,
    voiceSettings: initialVoiceSettings = {},
    
    maxRecordingDuration = 30000
  } = options;

  // State management
  const [state, setState] = useState<VoiceState>({
    isRecording: false,
    isPlaying: false,
    isLoading: false,
    isTranscribing: false,
    error: null,
    recordingDuration: 0,
    lastTranscription: null,
    availableVoices: [],
    isSupported: VoiceService.checkBrowserSupport().mediaRecorder && 
                  VoiceService.checkBrowserSupport().webAudio,
    isConfigured: isVoiceServiceConfigured() || !!apiKey
  });

  // Refs for managing audio and recording
  const voiceServiceRef = useRef<VoiceService | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const currentVoiceIdRef = useRef<string>(initialVoiceId);
  const currentVoiceSettingsRef = useRef<Partial<VoiceSettings>>(initialVoiceSettings);

  // Initialize voice service
  useEffect(() => {
    if (apiKey && !voiceServiceRef.current) {
      try {
        voiceServiceRef.current = createVoiceService({ apiKey });
        setState(prev => ({ ...prev, isConfigured: true, error: null }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: `Failed to initialize voice service: ${error instanceof Error ? error.message : 'Unknown error'}`,
          isConfigured: false
        }));
      }
    }
  }, [apiKey]);

  // Update error state helper
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Update recording duration
  const updateRecordingDuration = useCallback(() => {
    if (recordingStartTimeRef.current) {
      const duration = Date.now() - recordingStartTimeRef.current;
      setState(prev => ({ ...prev, recordingDuration: duration }));
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!voiceServiceRef.current) {
      setError('Voice service not initialized');
      return;
    }

    if (!state.isSupported) {
      setError('Voice recording not supported in this browser');
      return;
    }

    try {
      setState(prev => ({ ...prev, isRecording: true, error: null, recordingDuration: 0 }));
      recordingStartTimeRef.current = Date.now();
      
      // Start duration timer
      recordingTimerRef.current = setInterval(updateRecordingDuration, 100);
      
      await voiceServiceRef.current.startRecording();
      
      // Auto-stop after max duration
      setTimeout(() => {
        if (state.isRecording) {
          stopRecording();
        }
      }, maxRecordingDuration);
      
    } catch (error) {
      setState(prev => ({ ...prev, isRecording: false }));
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setError(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [state.isSupported, state.isRecording, maxRecordingDuration, updateRecordingDuration, setError]);

  // Stop recording and get transcription
  const stopRecording = useCallback(async (): Promise<string> => {
    if (!voiceServiceRef.current || !state.isRecording) {
      return '';
    }

    try {
      setState(prev => ({ ...prev, isRecording: false, isTranscribing: true }));
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      const audioBlob = await voiceServiceRef.current.stopRecording();
      const result = await voiceServiceRef.current.speechToText(audioBlob);
      const transcription = result.text.trim();
      
      setState(prev => ({ 
        ...prev, 
        isTranscribing: false, 
        lastTranscription: transcription,
        recordingDuration: 0
      }));
      
      recordingStartTimeRef.current = null;
      return transcription;
      
    } catch (error) {
      setState(prev => ({ ...prev, isRecording: false, isTranscribing: false }));
      setError(`Failed to process recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return '';
    }
  }, [state.isRecording, setError]);

  // Record and transcribe in one step
  const recordAndTranscribe = useCallback(async (): Promise<string> => {
    if (!voiceServiceRef.current) {
      setError('Voice service not initialized');
      return '';
    }

    try {
      const transcription = await voiceServiceRef.current.recordAndTranscribe({
        maxDuration: maxRecordingDuration,
        onRecordingStart: () => {
          setState(prev => ({ ...prev, isRecording: true, error: null }));
          recordingStartTimeRef.current = Date.now();
          recordingTimerRef.current = setInterval(updateRecordingDuration, 100);
        },
        onRecordingStop: () => {
          setState(prev => ({ ...prev, isRecording: false }));
          if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
          }
        },
        onTranscriptionStart: () => {
          setState(prev => ({ ...prev, isTranscribing: true }));
        },
        onTranscriptionComplete: (text) => {
          setState(prev => ({ 
            ...prev, 
            isTranscribing: false, 
            lastTranscription: text,
            recordingDuration: 0
          }));
          recordingStartTimeRef.current = null;
        },
        onError: (error) => {
          setState(prev => ({ 
            ...prev, 
            isRecording: false, 
            isTranscribing: false,
            recordingDuration: 0
          }));
          setError(error.message);
        }
      });

      return transcription;
    } catch (error) {
      setError(`Recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return '';
    }
  }, [maxRecordingDuration, updateRecordingDuration, setError]);

  // Text-to-speech
  const speak = useCallback(async (text: string, voiceId?: string) => {
    if (!voiceServiceRef.current) {
      setError('Voice service not initialized');
      return;
    }

    if (!text.trim()) {
      setError('No text provided to speak');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const selectedVoiceId = voiceId || currentVoiceIdRef.current;
      
      const audio = await voiceServiceRef.current.streamAndPlayTTS(text, selectedVoiceId, {
        voiceSettings: currentVoiceSettingsRef.current,
        onStart: () => {
          setState(prev => ({ ...prev, isLoading: false, isPlaying: true }));
        },
        onEnd: () => {
          setState(prev => ({ ...prev, isPlaying: false }));
          currentAudioRef.current = null;
        },
        onError: (error) => {
          setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
          setError(`Playback failed: ${error.message}`);
          currentAudioRef.current = null;
        }
      });

      currentAudioRef.current = audio;
      
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
      setError(`Speech synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [setError]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  // Set voice ID
  const setVoiceId = useCallback((voiceId: string) => {
    currentVoiceIdRef.current = voiceId;
  }, []);

  // Set voice settings
  const setVoiceSettings = useCallback((settings: Partial<VoiceSettings>) => {
    currentVoiceSettingsRef.current = { ...currentVoiceSettingsRef.current, ...settings };
  }, []);

  // Load available voices
  const loadVoices = useCallback(async () => {
    if (!voiceServiceRef.current) {
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const voices = await voiceServiceRef.current.getVoices();
      setState(prev => ({ ...prev, availableVoices: voices, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      setError(`Failed to load voices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [setError]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    if (voiceServiceRef.current) {
      voiceServiceRef.current.cleanup();
    }
    
    setState(prev => ({ 
      ...prev, 
      isRecording: false, 
      isPlaying: false, 
      isLoading: false,
      isTranscribing: false,
      recordingDuration: 0
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // State
    ...state,
    
    // Speech-to-Text functions
    startRecording,
    stopRecording,
    recordAndTranscribe,
    
    // Text-to-Speech functions
    speak,
    stopSpeaking,
    
    // Voice management
    setVoiceId,
    setVoiceSettings,
    loadVoices,
    
    // Utility functions
    clearError,
    cleanup
  };
};

export default useVoice; 