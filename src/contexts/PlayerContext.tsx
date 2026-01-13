'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { Howl } from 'howler';
import { toast } from 'sonner';
import type { Content, QueueItem, PlayerState } from '@/types';
import { PLAYER_SETTINGS } from '@/lib/constants';
import { nanoid } from 'nanoid';

type PlayerAction =
  | { type: 'SET_TRACK'; payload: Content }
  | { type: 'SET_QUEUE'; payload: QueueItem[] }
  | { type: 'ADD_TO_QUEUE'; payload: Content }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REPEAT'; payload: 'none' | 'one' | 'all' }
  | { type: 'SET_SHUFFLE'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREV_TRACK' };

const initialState: PlayerState = {
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: PLAYER_SETTINGS.DEFAULT_VOLUME,
  isMuted: false,
  progress: 0,
  duration: 0,
  isLoading: false,
  repeat: 'none',
  shuffle: false,
  error: null,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_TRACK':
      return { ...state, currentTrack: action.payload, progress: 0 };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [
          ...state.queue,
          { id: nanoid(), content: action.payload, addedAt: Date.now() },
        ],
      };
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter((item) => item.id !== action.payload),
      };
    case 'CLEAR_QUEUE':
      return { ...state, queue: [], currentIndex: -1 };
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_REPEAT':
      return { ...state, repeat: action.payload };
    case 'SET_SHUFFLE':
      return { ...state, shuffle: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'NEXT_TRACK': {
      if (state.queue.length === 0) return state;
      let nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.queue.length) {
        if (state.repeat === 'all') {
          nextIndex = 0;
        } else {
          return { ...state, isPlaying: false };
        }
      }
      return {
        ...state,
        currentIndex: nextIndex,
        currentTrack: state.queue[nextIndex]?.content ?? null,
        progress: 0,
      };
    }
    case 'PREV_TRACK': {
      if (state.queue.length === 0) return state;
      let prevIndex = state.currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.repeat === 'all' ? state.queue.length - 1 : 0;
      }
      return {
        ...state,
        currentIndex: prevIndex,
        currentTrack: state.queue[prevIndex]?.content ?? null,
        progress: 0,
      };
    }
    default:
      return state;
  }
}

interface PlayerContextType extends PlayerState {
  play: (content?: Content) => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  seekForward: () => void;
  seekBackward: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  next: () => void;
  prev: () => void;
  addToQueue: (content: Content) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  playPlaylist: (contents: Content[], startIndex?: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  clearError: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const howlRef = useRef<Howl | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Load new track when currentTrack changes
  useEffect(() => {
    if (!state.currentTrack?.file_url) return;

    // Cleanup previous audio
    if (howlRef.current) {
      howlRef.current.unload();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    // Create new Howl instance
    howlRef.current = new Howl({
      src: [state.currentTrack.file_url],
      html5: true,
      volume: state.isMuted ? 0 : state.volume,
      onload: () => {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({
          type: 'SET_DURATION',
          payload: howlRef.current?.duration() ?? 0,
        });
      },
      onplay: () => {
        dispatch({ type: 'SET_PLAYING', payload: true });
        // Update progress periodically
        progressIntervalRef.current = setInterval(() => {
          if (howlRef.current) {
            dispatch({
              type: 'SET_PROGRESS',
              payload: howlRef.current.seek() as number,
            });
          }
        }, 1000);
      },
      onpause: () => {
        dispatch({ type: 'SET_PLAYING', payload: false });
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      },
      onend: () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        if (state.repeat === 'one') {
          howlRef.current?.seek(0);
          howlRef.current?.play();
        } else {
          dispatch({ type: 'NEXT_TRACK' });
        }
      },
      onloaderror: (_, error) => {
        console.error('Audio load error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_ERROR', payload: 'Error al cargar el audio' });
        toast.error('Error al cargar el audio', {
          description: 'No se pudo cargar el archivo de audio. Intenta de nuevo.',
        });
      },
      onplayerror: (_, error) => {
        console.error('Audio play error:', error);
        dispatch({ type: 'SET_PLAYING', payload: false });
        dispatch({ type: 'SET_ERROR', payload: 'Error al reproducir' });
        toast.error('Error de reproducci\u00f3n', {
          description: 'No se pudo reproducir el audio. Intenta de nuevo.',
        });
        // Try to recover by unlocking audio context
        if (howlRef.current) {
          howlRef.current.once('unlock', () => {
            howlRef.current?.play();
          });
        }
      },
    });

    // Auto-play if was playing
    if (state.isPlaying) {
      howlRef.current.play();
    }
  }, [state.currentTrack?.id]);

  // Update volume when it changes
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(state.isMuted ? 0 : state.volume);
    }
  }, [state.volume, state.isMuted]);

  // Media Session API for lock screen controls
  useEffect(() => {
    if ('mediaSession' in navigator && state.currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: state.currentTrack.title,
        artist: state.currentTrack.author || 'Unknown',
        album: state.currentTrack.category?.name || '',
        artwork: state.currentTrack.thumbnail_url
          ? [{ src: state.currentTrack.thumbnail_url, sizes: '512x512' }]
          : [],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        howlRef.current?.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        howlRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        dispatch({ type: 'PREV_TRACK' });
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        dispatch({ type: 'NEXT_TRACK' });
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && howlRef.current) {
          howlRef.current.seek(details.seekTime);
          dispatch({ type: 'SET_PROGRESS', payload: details.seekTime });
        }
      });
    }
  }, [state.currentTrack]);

  const play = useCallback((content?: Content) => {
    if (content) {
      dispatch({ type: 'SET_TRACK', payload: content });
      dispatch({
        type: 'SET_QUEUE',
        payload: [{ id: nanoid(), content, addedAt: Date.now() }],
      });
      dispatch({ type: 'SET_CURRENT_INDEX', payload: 0 });
    } else {
      howlRef.current?.play();
    }
  }, []);

  const pause = useCallback(() => {
    howlRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      howlRef.current?.pause();
    } else {
      howlRef.current?.play();
    }
  }, [state.isPlaying]);

  const seek = useCallback((time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      dispatch({ type: 'SET_PROGRESS', payload: time });
    }
  }, []);

  const seekForward = useCallback(() => {
    if (howlRef.current) {
      const newTime = Math.min(
        (howlRef.current.seek() as number) + PLAYER_SETTINGS.SEEK_STEP,
        state.duration
      );
      howlRef.current.seek(newTime);
      dispatch({ type: 'SET_PROGRESS', payload: newTime });
    }
  }, [state.duration]);

  const seekBackward = useCallback(() => {
    if (howlRef.current) {
      const newTime = Math.max(
        (howlRef.current.seek() as number) - PLAYER_SETTINGS.SEEK_STEP,
        0
      );
      howlRef.current.seek(newTime);
      dispatch({ type: 'SET_PROGRESS', payload: newTime });
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: 'SET_MUTED', payload: !state.isMuted });
  }, [state.isMuted]);

  const next = useCallback(() => {
    dispatch({ type: 'NEXT_TRACK' });
  }, []);

  const prev = useCallback(() => {
    // If more than 3 seconds in, restart current track
    if (state.progress > 3) {
      seek(0);
    } else {
      dispatch({ type: 'PREV_TRACK' });
    }
  }, [state.progress, seek]);

  const addToQueue = useCallback((content: Content) => {
    dispatch({ type: 'ADD_TO_QUEUE', payload: content });
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', payload: id });
  }, []);

  const clearQueue = useCallback(() => {
    dispatch({ type: 'CLEAR_QUEUE' });
    if (howlRef.current) {
      howlRef.current.unload();
    }
  }, []);

  const playPlaylist = useCallback(
    (contents: Content[], startIndex: number = 0) => {
      const queue: QueueItem[] = contents.map((content) => ({
        id: nanoid(),
        content,
        addedAt: Date.now(),
      }));
      dispatch({ type: 'SET_QUEUE', payload: queue });
      dispatch({ type: 'SET_CURRENT_INDEX', payload: startIndex });
      dispatch({ type: 'SET_TRACK', payload: contents[startIndex] });
    },
    []
  );

  const toggleRepeat = useCallback(() => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(state.repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    dispatch({ type: 'SET_REPEAT', payload: modes[nextIndex] });
  }, [state.repeat]);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: 'SET_SHUFFLE', payload: !state.shuffle });
  }, [state.shuffle]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        play,
        pause,
        toggle,
        seek,
        seekForward,
        seekBackward,
        setVolume,
        toggleMute,
        next,
        prev,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playPlaylist,
        toggleRepeat,
        toggleShuffle,
        clearError,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
