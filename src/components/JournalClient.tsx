'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import { SendHorizontal, Loader2, Trash2, Heart, Image as ImageIcon, X, UserCircle, MoreVertical, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { isToday, isYesterday, format } from 'date-fns';
import IdentityPicker from './IdentityPicker';
import Image from 'next/image';

interface Entry {
  id: string;
  author: string;
  content: string;
  image_url: string | null;
  reactions: Record<string, string>;
  created_at: string;
}

interface Profile {
  id: string;
  profile_image_url: string | null;
  last_seen: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface JournalClientProps {
  authorA: string;
  authorB: string;
}

export default function JournalClient({ authorA, authorB }: JournalClientProps) {
  const [localAuthor, setLocalAuthor] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    const saved = localStorage.getItem('journal_author');
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

  const handleSelectAuthor = (author: string) => {
    localStorage.setItem('journal_author', author);
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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!content.trim() && !imageFile) || !localAuthor || isSending) return;

    setIsSending(true);
    const textToSend = content.trim();
    let uploadedImageUrl = null;

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

      const tempId = crypto.randomUUID();
      const optimisticEntry: Entry = {
        id: tempId,
        author: localAuthor,
        content: textToSend,
        image_url: uploadedImageUrl,
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
      
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          author: localAuthor, 
          content: textToSend,
          image_url: uploadedImageUrl 
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
    <div className="flex flex-col h-[100dvh] bg-slate-950 bg-[url('/2224368.png')] bg-cover bg-center bg-fixed sm:bg-none sm:bg-slate-950 font-sans text-slate-200" onClick={() => activeReactionId && setActiveReactionId(null)}>
      
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
            {partnerProfile?.profile_image_url ? (
              <img src={partnerProfile.profile_image_url} alt={partnerName} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-6 h-6 text-slate-500" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-100 leading-tight">{partnerName}</span>
            <span className={clsx("text-[11px] font-medium", partnerStatus === 'Online' ? "text-emerald-400" : "text-slate-400")}>
              {partnerStatus}
            </span>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-400 hover:text-slate-200">
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showSettings && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden py-1 z-30">
              <input type="file" ref={profileInputRef} onChange={handleProfileSelect} accept="image/*" className="hidden" />
              <button 
                onClick={() => profileInputRef.current?.click()}
                className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center space-x-3 whitespace-nowrap"
              >
                <UserCircle className="w-5 h-5" />
                <span>Change profile picture</span>
              </button>
              <div className="h-px bg-slate-800 my-1 mx-2"></div>
              <button 
                onClick={() => {
                  localStorage.removeItem('journal_author');
                  setLocalAuthor(null);
                  setShowSettings(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-slate-800 flex items-center space-x-3 whitespace-nowrap"
              >
                <LogOut className="w-5 h-5" />
                <span>Switch Profile</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 flex flex-col space-y-4">
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm">Failed to load entries</div>
        )}

        {!isLoading && !data?.entries?.length && (
          <div className="flex-1 flex items-center justify-center opacity-60">
            <p className="text-slate-500 text-sm">no messages here yet.</p>
          </div>
        )}

        {groupedEntries && Object.entries(groupedEntries).map(([dateStr, entries]) => (
          <div key={dateStr} className="flex flex-col space-y-2">
            <div className="flex justify-center my-2">
              <span className="text-xs font-medium text-slate-500 tracking-wide">
                {dateStr}
              </span>
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
                        "absolute -top-12 z-30 bg-slate-800 border border-slate-700 rounded-full px-3 py-2 shadow-xl flex items-center space-x-3 animate-in zoom-in-90 duration-200",
                        isMine ? "right-0" : "left-0"
                      )}>
                        {['👍', '❤️', '👎', '🫂'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReact(entry.id, emoji);
                              setActiveReactionId(null);
                            }}
                            className="text-xl hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className={clsx(
                      "relative group shadow-sm text-[15px] leading-relaxed break-words whitespace-pre-wrap",
                      isMine 
                        ? "bg-blue-600 text-white rounded-xl rounded-br-[4px]" 
                        : "bg-slate-800 text-slate-100 rounded-xl rounded-bl-[4px]",
                      !entry.content && entry.image_url ? "bg-transparent shadow-none" : ""
                    )}>
                      {entry.image_url && (
                        <div className={clsx(
                          "relative w-full overflow-hidden",
                          !entry.content ? "rounded-xl" : "rounded-t-xl rounded-b-[4px]"
                        )}>
                          <img 
                            src={entry.image_url} 
                            alt="Entry image"
                            className="max-w-full h-auto object-cover max-h-64"
                          />
                        </div>
                      )}
                      
                      {entry.content && (
                        <div className="px-4 py-3">
                          {entry.content}
                        </div>
                      )}

                      {isMine && !isDeleting && (
                        <button 
                          onClick={() => handleDelete(entry.id, entry.author)}
                          className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1.5 px-1">
                    <span className="text-[11px] text-slate-500">
                      {format(new Date(entry.created_at), 'h:mm a')}
                    </span>
                    {hasReactions && (
                      <div className="flex -space-x-1">
                        {Object.entries(entry.reactions || {}).map(([reacter, emoji]) => (
                          <div key={reacter} className="bg-slate-900 border border-slate-800 px-1 py-0.5 rounded-full shadow-sm text-[12px] leading-none" title={reacter}>
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
        
        <div ref={bottomRef} className="h-2" />
      </main>

      <footer className="bg-transparent px-4 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-700">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-slate-800 border border-slate-700 text-slate-300 p-1 rounded-full shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        
        <form 
          onSubmit={handleSend}
          className="flex items-end space-x-2 bg-slate-900 p-1.5 focus-within:ring-1 focus-within:ring-blue-900 focus-within:bg-slate-800 transition-all border border-slate-700 shadow-xl rounded-3xl"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-400 hover:text-blue-400 transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message..."
            className="flex-1 max-h-32 bg-transparent resize-none outline-none text-[15px] text-slate-100 px-2 py-2.5 leading-relaxed placeholder:text-slate-600"
            rows={Math.min(4, content.split('\n').length || 1)}
          />
          <button
            type="submit"
            disabled={(!content.trim() && !imageFile) || isSending}
            className={clsx(
              "p-2.5 flex items-center justify-center transition-all rounded-xl",
              (content.trim() || imageFile) && !isSending
                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500 active:scale-95" 
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            )}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <SendHorizontal className="w-5 h-5 -ml-0.5" />
            )}
          </button>
        </form>
      </footer>
    </div>
  );
}
