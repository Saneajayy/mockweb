'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { SendHorizontal, Loader2, Trash2, Heart, Image as ImageIcon, X } from 'lucide-react';
import { clsx } from 'clsx';
import { isToday, isYesterday, format } from 'date-fns';
import IdentityPicker from './IdentityPicker';
import { upload } from '@vercel/blob/client';

interface Entry {
  id: string;
  author: string;
  content: string;
  image_url?: string | null;
  reactions?: Record<string, string>;
  created_at: string;
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
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data, error, mutate, isLoading } = useSWR<{ entries: Entry[] }>('/api/entries', fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('journal_author');
    if (saved) {
      setLocalAuthor(saved);
    }
  }, []);

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
          // DIAGNOSTIC FETCH
          const diagRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'upload', payload: 'test' })
          });
          const diagText = await diagRes.text();
          if (!diagRes.ok) {
            alert(`SERVER ERROR DETECTED:\n\n${diagText}`);
            setIsSending(false);
            return;
          }

          const newBlob = await upload(imageFile.name, imageFile, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          uploadedImageUrl = newBlob.url;
        } catch (uploadError: any) {
          alert(`IMAGE UPLOAD CRASHED!\n\nReason: ${uploadError.message}\n\nIf it says token is missing, Vercel did not link your Blob correctly.`);
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

      mutate(
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
      mutate();
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
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleReact = async (id: string) => {
    if (!localAuthor) return;
    
    mutate((prev) => {
      if (!prev) return prev;
      return {
        entries: prev.entries.map(entry => {
          if (entry.id === id) {
            const currentReactions = { ...(entry.reactions || {}) };
            if (currentReactions[localAuthor]) {
              delete currentReactions[localAuthor];
            } else {
              currentReactions[localAuthor] = 'heart';
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
        body: JSON.stringify({ author: localAuthor }),
      });
      mutate();
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

  return (
    <div className="flex flex-col h-[100dvh] bg-rose-50/30 font-serif">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-rose-100 px-5 py-4 flex items-center justify-between">
        <h1 className="text-xl font-medium text-rose-950 tracking-wide">Our Journal</h1>
        <div className="text-sm font-medium text-rose-800 tracking-wide">
          {localAuthor}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 flex flex-col space-y-6">
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-rose-300 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm">Failed to load entries</div>
        )}

        {!isLoading && !data?.entries?.length && (
          <div className="flex-1 flex items-center justify-center opacity-60">
            <p className="text-rose-900 text-sm">no messages here yet.</p>
          </div>
        )}

        {groupedEntries && Object.entries(groupedEntries).map(([dateStr, entries]) => (
          <div key={dateStr} className="flex flex-col space-y-6">
            <div className="flex justify-center my-2">
              <span className="text-xs font-medium text-rose-400/80 tracking-wide">
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
                  <div className={clsx(
                    "relative group shadow-sm text-[15px] leading-relaxed break-words whitespace-pre-wrap border",
                    isMine 
                      ? "bg-rose-500 text-white border-rose-600 rounded-3xl rounded-br-[4px]" 
                      : "bg-white text-rose-950 border-rose-200 rounded-3xl rounded-bl-[4px]"
                  )}>
                    {entry.image_url && (
                      <div className="relative w-full overflow-hidden">
                        {/* Use standard img tag for simplicity with unknown domains */}
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
                        className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-rose-300 hover:text-red-500"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {!isMine && (
                      <button 
                        onClick={() => handleReact(entry.id)}
                        className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-rose-300 hover:text-rose-500"
                        title="React"
                      >
                        <Heart className={clsx("w-4 h-4", iReacted && "fill-rose-500 text-rose-500")} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1.5 px-1">
                    <span className="text-[11px] text-rose-400/80">
                      {format(new Date(entry.created_at), 'h:mm a')}
                    </span>
                    {hasReactions && (
                      <div className="flex -space-x-1">
                        {Object.keys(entry.reactions || {}).map((reacter) => (
                          <div key={reacter} className="bg-white border border-rose-100 p-0.5 rounded-full shadow-sm" title={reacter}>
                            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
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

      <footer className="bg-white border-t border-rose-100 p-4 pb-[env(safe-area-inset-bottom,16px)]">
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <div className="relative w-24 h-24 border border-rose-200">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-white border border-rose-200 text-rose-500 p-1 rounded-full shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        
        <form 
          onSubmit={handleSend}
          className="flex items-end space-x-2 bg-rose-50/50 p-2 focus-within:ring-1 focus-within:ring-rose-200 focus-within:bg-white transition-all border border-rose-100"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-rose-400 hover:text-rose-600 transition-colors"
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
            placeholder=""
            className="flex-1 max-h-32 bg-transparent resize-none outline-none text-[15px] text-rose-950 px-2 py-3 leading-relaxed"
            rows={Math.min(4, content.split('\n').length || 1)}
          />
          <button
            type="submit"
            disabled={(!content.trim() && !imageFile) || isSending}
            className={clsx(
              "p-3 flex items-center justify-center transition-all",
              (content.trim() || imageFile) && !isSending
                ? "bg-rose-500 text-white shadow-sm hover:bg-rose-600 active:scale-95" 
                : "bg-rose-200/50 text-rose-300 cursor-not-allowed"
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
