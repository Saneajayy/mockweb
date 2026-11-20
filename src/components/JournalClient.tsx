'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import { SendHorizontal, Loader2, Trash2, Heart, Image as ImageIcon, X, UserCircle, MoreVertical, LogOut, Sticker, Mic, Square, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { clsx } from 'clsx';
import { isToday, isYesterday, format } from 'date-fns';
import IdentityPicker from './IdentityPicker';
import Image from 'next/image';
import RoomFloor from './RoomFloor';
import Fireplace from './Fireplace';

interface Entry {
  id: string;
  author: string;
  content: string;
  image_url: string | null;
  audio_url?: string | null;
  reactions: Record<string, string>;
  created_at: string;
}

interface Profile {
  id: string;
  profile_image_url: string | null;
  last_seen: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const renderContentWithLinks = (text: string, isMine: boolean) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={clsx(
            "hover:underline break-all",
            isMine ? "text-amber-200 underline font-semibold" : "text-emerald-200 underline font-semibold"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <span key={i} className="whitespace-pre-wrap">{part}</span>;
  });
};

interface JournalClientProps {
  authorA: string;
  authorB: string;
}

export default function JournalClient({ authorA, authorB }: JournalClientProps) {
  const [localAuthor, setLocalAuthor] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [giphySearch, setGiphySearch] = useState('');
  const [stickers, setStickers] = useState<any[]>([]);
  const [isSearchingStickers, setIsSearchingStickers] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/music.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    musicRef.current = audio;

    let savedState = 'false';
    try {
      savedState = localStorage.getItem('journal_music_playing') || 'false';
    } catch {}

    if (savedState === 'true') {
      audio.play().then(() => {
        setIsPlayingMusic(true);
      }).catch(() => {
        // Autoplay may be restricted by the browser until first user gesture
        setIsPlayingMusic(false);
      });
    }

    const handleFirstGesture = () => {
      let isEnabled = false;
      try {
        isEnabled = localStorage.getItem('journal_music_playing') === 'true';
      } catch {}

      if (isEnabled && musicRef.current?.paused) {
        musicRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      audio.pause();
      audio.currentTime = 0;
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  const toggleMusic = () => {
    if (!musicRef.current) return;
    if (isPlayingMusic) {
      musicRef.current.pause();
      setIsPlayingMusic(false);
      try {
        localStorage.setItem('journal_music_playing', 'false');
      } catch {}
    } else {
      musicRef.current.play().then(() => {
        setIsPlayingMusic(true);
        try {
          localStorage.setItem('journal_music_playing', 'true');
        } catch {}
      }).catch((err) => {
        console.error('Audio playback failed:', err);
      });
    }
  };

  const handleTouchStart = (id: string) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setActiveReactionId(prev => prev === id ? null : id);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 500);
  };

  const clearTouchTimer = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };
  
  const { data, error, mutate: mutateEntries, isLoading } = useSWR<{ entries: Entry[] }>('/api/entries', fetcher, {
    refreshInterval: 15000,
  });

  const { data: profilesData } = useSWR<{ profiles: Record<string, Profile> }>('/api/profiles', fetcher, {
    refreshInterval: 10000,
  });

  const profiles = profilesData?.profiles || {};

  useEffect(() => {
    try {
      localStorage.removeItem('journal_author');
    } catch {}

    const saved = sessionStorage.getItem('journal_author');
    if (saved === authorA || saved === authorB) {
      setLocalAuthor(saved);
    }
  }, [authorA, authorB]);

  useEffect(() => {
    if (!localAuthor) return;
    const ping = () => {
      fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: localAuthor }),
      }).catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [localAuthor]);

  const fetchStickers = async (query: string) => {
    setIsSearchingStickers(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
      if (!apiKey || apiKey === 'dummy_key_replace_me') {
        // Fallback for dummy key so the user can verify UI
        setStickers([
          { id: '1', images: { fixed_height: { url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif' } } },
          { id: '2', images: { fixed_height: { url: 'https://media.giphy.com/media/l41YkxvU8c7J7Bba0/giphy.gif' } } },
          { id: '3', images: { fixed_height: { url: 'https://media.giphy.com/media/xT0xezQGU5xCDJuCPe/giphy.gif' } } },
          { id: '4', images: { fixed_height: { url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif' } } },
        ]);
        setIsSearchingStickers(false);
        return;
      }
      const endpoint = query 
        ? `https://api.giphy.com/v1/stickers/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20`
        : `https://api.giphy.com/v1/stickers/trending?api_key=${apiKey}&limit=20`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.data) {
        setStickers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stickers', err);
    } finally {
      setIsSearchingStickers(false);
    }
  };

  useEffect(() => {
    if (showStickers) {
      const timeout = setTimeout(() => {
        fetchStickers(giphySearch);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [giphySearch, showStickers]);


  const handleSelectAuthor = (author: string) => {
    try {
      sessionStorage.setItem('journal_author', author);
    } catch {}
    setLocalAuthor(author);
  };

  useEffect(() => {
    if (data?.entries) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [data?.entries?.length]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !localAuthor) return;

    try {
      const response = await fetch(`/api/profiles?author=${localAuthor}&filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      if (response.ok) {
        mutate('/api/profiles');
        setShowSettings(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Audio recording is not supported in this browser. If you're on mobile, ensure you are accessing the site via HTTPS.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        setAudioFile(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Error accessing mic:", err);
      if (err.name === 'NotAllowedError') {
        alert("Microphone access was denied. Please allow microphone access in your browser settings.");
      } else {
        alert("Failed to access microphone. Ensure you are on HTTPS and the browser supports it.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearAudio = () => {
    setAudioFile(null);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!content.trim() && !imageFile && !audioFile) || !localAuthor || isSending) return;

    setIsSending(true);
    const textToSend = content.trim();
    let uploadedImageUrl = null;
    let uploadedAudioUrl = null;

    try {
      if (imageFile) {
        try {
          const response = await fetch(`/api/upload?filename=${encodeURIComponent(imageFile.name)}`, {
            method: 'POST',
            body: imageFile,
          });
          if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`STATUS: ${response.status}\n\nDETAILS:\n${errorText}`);
          }
          const blob = await response.json();
          if (blob.url) {
            uploadedImageUrl = blob.url;
          }
        } catch (uploadError: any) {
          alert(`UPLOAD CRASHED!\n\n${uploadError.message}`);
          setIsSending(false);
          return;
        }
      }

      if (audioFile) {
        try {
          const extension = audioFile.type.includes('mp4') ? 'mp4' : 'webm';
          const response = await fetch(`/api/upload?filename=audio-${Date.now()}.${extension}`, {
            method: 'POST',
            body: audioFile,
          });
          if (!response.ok) throw new Error('Audio upload failed');
          const blob = await response.json();
          uploadedAudioUrl = blob.url;
        } catch (uploadError: any) {
          alert(`AUDIO UPLOAD CRASHED!\n\n${uploadError.message}`);
          setIsSending(false);
          return;
        }
      }

      const tempId = crypto.randomUUID();
      const optimisticEntry: Entry = {
        id: tempId,
        author: localAuthor,
        content: textToSend,
        image_url: uploadedImageUrl,
        audio_url: uploadedAudioUrl,
        reactions: {},
        created_at: new Date().toISOString(),
      };

      mutateEntries(
        (prev) => {
          if (!prev) return { entries: [optimisticEntry] };
          return { entries: [...prev.entries, optimisticEntry] };
        },
        false
      );

      setContent('');
      clearImage();
      clearAudio();
      
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          author: localAuthor, 
          content: textToSend,
          image_url: uploadedImageUrl,
          audio_url: uploadedAudioUrl
        }),
      });

      if (!res.ok) throw new Error('Failed to send');
      mutateEntries();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleStickerSelect = async (stickerUrl: string) => {
    if (!localAuthor || isSending) return;
    setIsSending(true);
    setShowStickers(false);
    
    const tempId = crypto.randomUUID();
    const optimisticEntry: Entry = {
      id: tempId,
      author: localAuthor,
      content: '',
      image_url: stickerUrl,
      reactions: {},
      created_at: new Date().toISOString(),
    };

    mutateEntries(
      (prev) => {
        if (!prev) return { entries: [optimisticEntry] };
        return { entries: [...prev.entries, optimisticEntry] };
      },
      false
    );

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          author: localAuthor, 
          content: '',
          image_url: stickerUrl 
        }),
      });

      if (!res.ok) throw new Error('Failed to send sticker');
      mutateEntries();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string, author: string) => {
    if (author !== localAuthor) return;
    setDeletingId(id);
    try {
      await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: localAuthor }),
      });
      mutateEntries();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleReact = async (id: string, emoji: string) => {
    if (!localAuthor) return;
    
    mutateEntries((prev) => {
      if (!prev) return prev;
      return {
        entries: prev.entries.map(entry => {
          if (entry.id === id) {
            const currentReactions = { ...(entry.reactions || {}) };
            if (currentReactions[localAuthor] === emoji) {
              delete currentReactions[localAuthor];
            } else {
              currentReactions[localAuthor] = emoji;
            }
            return { ...entry, reactions: currentReactions };
          }
          return entry;
        })
      };
    }, false);

    try {
      await fetch(`/api/entries/${id}/react`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: localAuthor, emoji }),
      });
      mutateEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const groupedEntries = data?.entries?.reduce((acc: Record<string, Entry[]>, entry) => {
    const d = new Date(entry.created_at);
    let key = '';
    if (isToday(d)) {
      key = 'Today';
    } else if (isYesterday(d)) {
      key = 'Yesterday';
    } else {
      key = format(d, 'EEEE, MMM d');
    }
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  if (localAuthor === null) {
    return <IdentityPicker authorA={authorA} authorB={authorB} onSelect={handleSelectAuthor} />;
  }

  const partnerName = localAuthor === authorA ? authorB : authorA;
  const partnerProfile = profiles[partnerName];
  const selfProfile = profiles[localAuthor];

  let partnerStatus = 'Offline';
  if (partnerProfile?.last_seen) {
    const lastSeenDate = new Date(partnerProfile.last_seen);
    const diffInMins = (Date.now() - lastSeenDate.getTime()) / (1000 * 60);
    if (diffInMins < 2) {
      partnerStatus = 'Online';
    } else {
      partnerStatus = `last seen ${isToday(lastSeenDate) ? 'today at' : isYesterday(lastSeenDate) ? 'yesterday at' : format(lastSeenDate, 'MMM d')} ${format(lastSeenDate, 'h:mm a')}`;
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] relative overflow-hidden bg-[#16382b] font-sans text-white/95" onClick={() => activeReactionId && setActiveReactionId(null)}>

      {/* ── Room Scene Background (Isolated in z-0 stacking context) ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
        {/* Wooden floor at the bottom */}
        <RoomFloor className="z-[1]" />

        {/* Animated Fireplace & Glow resting ON TOP of the floor on the right */}
        <div className="absolute top-0 bottom-0 right-0 sm:right-2 w-[44%] min-w-[180px] max-w-[420px] z-[2]">
          <Fireplace className="absolute left-1/2 -translate-x-1/2 -bottom-[38px] sm:-bottom-[50px] w-[370px] h-[370px] sm:w-[450px] sm:h-[450px]" />
        </div>
      </div>

      
      {/* Top Header / Profile Bar - Light Frosted Glass */}
      <header className="sticky top-0 z-30 bg-white/[0.04] backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/40 shadow-[0_2px_12px_rgba(0,0,0,0.25)] flex items-center justify-center shrink-0">
            {partnerProfile?.profile_image_url ? (
              <img src={partnerProfile.profile_image_url} alt={partnerName} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-6 h-6 text-white/90" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white leading-tight flex items-center gap-1.5 drop-shadow-sm">
              {partnerName}
            </span>
            <span className={clsx("text-[11px] font-medium", partnerStatus === 'Online' ? "text-emerald-300 font-semibold drop-shadow-sm" : "text-white/70")}>
              {partnerStatus}
            </span>
          </div>
        </div>


        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Simple Music Mute/Unmute */}
          <button
            onClick={toggleMusic}
            className="p-1.5 text-white/80 hover:text-white active:scale-95 transition-all flex items-center justify-center"
            title={isPlayingMusic ? "Mute" : "Unmute"}
            aria-label={isPlayingMusic ? "Mute" : "Unmute"}
          >
            {isPlayingMusic ? (
              <Volume2 className="w-5 h-5 text-white/90 hover:text-white" />
            ) : (
              <VolumeX className="w-5 h-5 text-white/50 hover:text-white/80" />
            )}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Settings"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          
          {showSettings && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0e291e]/85 border border-white/20 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl overflow-hidden py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-white/10 flex items-center space-x-3 mb-1 bg-white/[0.03]">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 ring-2 ring-white/30 shrink-0 flex items-center justify-center">
                  {selfProfile?.profile_image_url ? (
                    <img src={selfProfile.profile_image_url} alt="Your profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-6 h-6 text-white/80" />
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-white truncate">{localAuthor}</span>
                  <span className="text-xs text-white/60 truncate">Your Profile</span>
                </div>
              </div>
              <input type="file" ref={profileInputRef} onChange={handleProfileSelect} accept="image/*" className="hidden" />
              <button 
                onClick={() => profileInputRef.current?.click()}
                className="w-full px-4 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 flex items-center space-x-3 whitespace-nowrap transition-colors"
              >
                <UserCircle className="w-4 h-4 text-white/70" />
                <span>Change profile picture</span>
              </button>
              <div className="h-px bg-white/10 my-1 mx-2"></div>
              <button 
                onClick={() => {
                  try {
                    sessionStorage.removeItem('journal_author');
                    localStorage.removeItem('journal_author');
                  } catch {}
                  setLocalAuthor(null);
                  setShowSettings(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 flex items-center space-x-3 whitespace-nowrap transition-colors"
              >
                <UserCircle className="w-4 h-4 text-white/70" />
                <span>Switch profile</span>
              </button>
              <button 
                onClick={async () => {
                  try {
                    sessionStorage.removeItem('journal_author');
                    localStorage.removeItem('journal_author');
                    await fetch('/api/logout', { method: 'POST' });
                  } catch {}
                  window.location.href = '/login';
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/15 flex items-center space-x-3 whitespace-nowrap transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
          </div>
        </div>
      </header>

      <main className={clsx(
        "flex-1 overflow-y-auto px-4 pt-4 flex flex-col space-y-4 relative z-10",
        localAuthor === authorB ? "pb-6 sm:pb-7" : "pb-[90px] sm:pb-[100px]"
      )}>
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm">Failed to load entries</div>
        )}

        {!isLoading && !data?.entries?.length && (
          <div className="flex-1 flex items-center justify-center opacity-75">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 text-white/70 text-xs tracking-wide shadow-sm">
              <span>❄️</span>
              <span>Leave a warm note by the fire...</span>
              <span>☕</span>
            </div>
          </div>
        )}

        {groupedEntries && Object.entries(groupedEntries).map(([dateStr, entries]) => (
          <div key={dateStr} className="flex flex-col space-y-2">
            <div className="flex justify-center my-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white/85 text-xs font-medium backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.18)]">
                <span className="text-white/45 text-[10px]">❄</span>
                <span>{dateStr}</span>
                <span className="text-white/45 text-[10px]">❄</span>
              </div>
            </div>

            {entries.map((entry) => {
              const isMine = entry.author === localAuthor;
              const isDeleting = deletingId === entry.id;
              const hasReactions = entry.reactions && Object.keys(entry.reactions).length > 0;
              const iReacted = entry.reactions?.[localAuthor] === 'heart';

              return (
                <div 
                  key={entry.id} 
                  className={clsx(
                    "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                    isMine ? "self-end items-end" : "self-start items-start",
                    isDeleting && "opacity-50"
                  )}
                >
                  <div 
                    className="relative cursor-pointer select-none touch-manipulation" 
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setActiveReactionId(activeReactionId === entry.id ? null : entry.id);
                    }}
                    onTouchStart={() => handleTouchStart(entry.id)}
                    onTouchMove={clearTouchTimer}
                    onTouchEnd={clearTouchTimer}
                    onTouchCancel={clearTouchTimer}
                  >
                    {activeReactionId === entry.id && (
                      <div className={clsx(
                        "absolute -top-12 z-30 bg-[#0e291e]/90 border border-white/20 rounded-full px-3 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl flex items-center space-x-2.5 animate-in zoom-in-90 duration-200",
                        isMine ? "right-0" : "left-0"
                      )}>
                        {['❤️', '❄️', '☕', '🔥', '✨', '🧸'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReact(entry.id, emoji);
                              setActiveReactionId(null);
                            }}
                            className="text-xl hover:scale-130 transition-transform active:scale-95"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className={clsx(
                      "relative group shadow-sm text-[15px] leading-relaxed break-words whitespace-pre-wrap",
                      isMine 
                        ? "bg-gradient-to-br from-amber-500/35 via-amber-600/25 to-amber-700/20 backdrop-blur-md text-amber-50 rounded-2xl rounded-br-[4px] border border-amber-300/40 shadow-[0_4px_24px_rgba(245,158,11,0.22)]" 
                        : "bg-white/[0.12] backdrop-blur-md text-white/95 rounded-2xl rounded-bl-[4px] border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.18)]",
                      !entry.content && entry.image_url ? "bg-transparent shadow-none border-none backdrop-blur-none" : ""
                    )}>
                      {entry.image_url && (
                        <div className={clsx(
                          "relative w-full overflow-hidden",
                          !entry.content ? "rounded-2xl" : "rounded-t-2xl rounded-b-[4px]"
                        )}>
                          <img 
                            src={entry.image_url} 
                            alt="Entry image"
                            className="max-w-full h-auto object-cover max-h-64"
                          />
                        </div>
                      )}
                      
                      {entry.audio_url && (
                        <div className="px-4 py-2">
                          <audio controls src={entry.audio_url} className="max-w-full h-10 w-64" />
                        </div>
                      )}

                      {entry.content && (
                        <div className="px-4 py-3 whitespace-pre-wrap">
                          {renderContentWithLinks(entry.content, isMine)}
                        </div>
                      )}

                      {isMine && !isDeleting && (
                        <button 
                          onClick={() => handleDelete(entry.id, entry.author)}
                          className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-red-400"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1.5 px-1">
                    <span className="text-[11px] font-medium text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                      {format(new Date(entry.created_at), 'h:mm a')}
                    </span>
                    {hasReactions && (
                      <div className="flex -space-x-1">
                        {Object.entries(entry.reactions || {}).map(([reacter, emoji]) => (
                          <div key={reacter} className="bg-black/35 backdrop-blur-md border border-white/20 px-1.5 py-0.5 rounded-full shadow-sm text-[12px] leading-none text-white" title={reacter}>
                            {emoji as React.ReactNode}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        <div ref={bottomRef} className="h-1 shrink-0" />
      </main>

      {localAuthor === authorB && (
      <footer className="bg-transparent px-4 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-1 relative z-30 w-full flex flex-col items-center">
        {showStickers && (
          <div className="absolute bottom-full mb-2 w-full max-w-[340px] bg-[#0e291e]/92 border border-white/20 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl overflow-hidden flex flex-col h-72 animate-in fade-in slide-in-from-bottom-2 duration-200 z-30">
            <div className="p-2 border-b border-white/10 bg-white/[0.04]">
              <input
                type="text"
                placeholder="Search winter stickers..."
                value={giphySearch}
                onChange={(e) => setGiphySearch(e.target.value)}
                className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none border border-white/15 focus:border-white/40 placeholder:text-white/40"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/20">
              {isSearchingStickers ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-white/80 animate-spin" />
                </div>
              ) : stickers.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {stickers.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStickerSelect(s.images.fixed_height.url)}
                      className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/40 hover:scale-105 transition-all flex items-center justify-center group"
                    >
                      <img src={s.images.fixed_height.url} alt="Sticker" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white/50 text-sm">
                  No stickers found
                </div>
              )}
            </div>
          </div>
        )}

        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/40 shadow-lg">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-slate-900 border border-white/60 text-white p-1 rounded-full shadow-sm hover:bg-slate-800"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {audioFile && (
          <div className="mb-2 relative inline-block bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/30 shadow-lg">
            <audio controls src={URL.createObjectURL(audioFile)} className="h-8 w-44" />
            <button 
              onClick={clearAudio}
              className="absolute -top-2 -right-2 bg-slate-900 border border-white/60 text-white p-1 rounded-full shadow-sm hover:bg-slate-800"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        
        {/* Compact, glassy message input bar with rounded-lg matching login page */}
        <form 
          onSubmit={handleSend}
          className="w-full max-w-[310px] sm:max-w-[340px] flex items-center space-x-1 bg-white/[0.08] backdrop-blur-xl border border-white p-1.5 pl-2 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all focus-within:shadow-[0_0_20px_rgba(255,255,255,0.35)]"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors shrink-0"
            title="Upload photo"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowStickers(!showStickers)}
            className={clsx(
              "p-1.5 rounded transition-colors shrink-0",
              showStickers ? "text-white bg-white/20" : "text-white/70 hover:text-white hover:bg-white/10"
            )}
            title="Stickers"
          >
            <Sticker className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={clsx(
              "p-1.5 rounded transition-colors shrink-0",
              isRecording ? "text-red-400 animate-pulse bg-red-500/20" : "text-white/70 hover:text-white hover:bg-white/10"
            )}
            title={isRecording ? "Stop recording" : "Record voice note"}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Send a message..."
            className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-white px-2 py-1 placeholder:text-white/45"
          />
          <button
            type="submit"
            disabled={(!content.trim() && !imageFile && !audioFile) || isSending}
            className={clsx(
              "w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center shrink-0 transition-all",
              (content.trim() || imageFile || audioFile) && !isSending
                ? "bg-white text-slate-900 shadow-sm active:scale-95 hover:bg-white/90" 
                : "bg-white/10 text-white/30 cursor-not-allowed"
            )}
            title="Send message"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <SendHorizontal className="w-4 h-4" />
            )}
          </button>
        </form>
      </footer>
      )}
    </div>
  );
}
