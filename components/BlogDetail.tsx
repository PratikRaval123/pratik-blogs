import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Loader2, Calendar, Clock, User, Tag } from 'lucide-react';
import { BlogPost } from '../types';
import { generateSpeech } from '../services/gemini';

// --- Audio Helper Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface BlogDetailProps {
  post: BlogPost;
  onBack: () => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ post, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    return () => {
      // Cleanup audio on unmount
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (e) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    return audioContextRef.current;
  };

  const handlePlayAudio = async () => {
    const ctx = initAudioContext();

    // If currently playing, pause it
    if (isPlaying) {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (e) {}
        sourceNodeRef.current = null;
        pausedTimeRef.current += ctx.currentTime - startTimeRef.current;
      }
      setIsPlaying(false);
      return;
    }

    // Determine starting offset
    let startOffset = pausedTimeRef.current;
    
    // If we have buffer, play it
    if (audioBuffer) {
      // If we finished playing previously, reset
      if (startOffset >= audioBuffer.duration) {
        startOffset = 0;
        pausedTimeRef.current = 0;
      }
      playBuffer(ctx, audioBuffer, startOffset);
    } else {
      // Fetch and Generate
      setIsLoadingAudio(true);
      const base64Audio = await generateSpeech(post.content);
      setIsLoadingAudio(false);

      if (base64Audio) {
        const bytes = decode(base64Audio);
        const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
        setAudioBuffer(buffer);
        playBuffer(ctx, buffer, 0);
      } else {
        alert("Sorry, audio generation is currently unavailable.");
      }
    }
  };

  const playBuffer = (ctx: AudioContext, buffer: AudioBuffer, offset: number) => {
    setIsPlaying(true);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    source.onended = () => {
       // Logic to handle auto-reset could go here, 
       // but we handle UI state mostly via user interaction for simplicity
       // We can check ctx.currentTime vs duration if needed
    };

    source.start(0, offset);
    startTimeRef.current = ctx.currentTime;
    sourceNodeRef.current = source;
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Image */}
      <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all z-10 group"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-primary-600/80 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wide">
                        {tag}
                    </span>
                ))}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-shadow-lg">
                {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-gray-200 text-sm md:text-base font-medium">
                    <span className="flex items-center gap-2">
                        <User size={18} />
                        {post.author}
                    </span>
                    <span className="flex items-center gap-2">
                        <Calendar size={18} />
                        {post.date}
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock size={18} />
                        {post.readTime}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        
        {/* Audio Player Control */}
        <div className="mb-10 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={handlePlayAudio}
                    disabled={isLoadingAudio}
                    className={`w-12 h-12 flex items-center justify-center rounded-full text-white shadow-lg transition-all ${
                        isLoadingAudio ? 'bg-gray-400 cursor-not-allowed' : 
                        isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary-600 hover:bg-primary-700'
                    }`}
                >
                    {isLoadingAudio ? <Loader2 className="animate-spin" size={20} /> : 
                     isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                        {isLoadingAudio ? 'Generating Audio...' : isPlaying ? 'Now Playing' : 'Listen to this article'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Powered by Gemini Audio
                    </p>
                </div>
            </div>
            {/* Visualizer bars placeholder */}
            <div className="flex gap-1 items-end h-8">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-1 bg-primary-500 rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse h-full' : 'h-2'}`} style={{ height: isPlaying ? `${Math.random() * 100}%` : '20%' }}></div>
                ))}
            </div>
        </div>

        {/* Text Content */}
        <article className="prose prose-lg dark:prose-invert prose-primary max-w-none">
            {post.content.split('\n').map((paragraph, idx) => (
                paragraph.trim() && <p key={idx} className="text-gray-700 dark:text-gray-300 leading-loose mb-6">{paragraph}</p>
            ))}
        </article>

        {/* Footer Tags */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Filed Under</h3>
            <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                    <div key={tag} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                        <Tag size={14} />
                        {tag}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};