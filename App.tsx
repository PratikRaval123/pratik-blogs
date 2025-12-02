import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, Sun, Plus, Search, Github, Loader } from 'lucide-react';
import { BlogPost } from './types';
import { getPosts, createPost, deletePost, getFeaturedPosts } from './services/storage';
import { HeroSlider } from './components/HeroSlider';
import { BlogCard } from './components/BlogCard';
import { BlogForm } from './components/BlogForm';
import { BlogDetail } from './components/BlogDetail';

const App: React.FC = () => {
  // Theme State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('theme') === 'dark' ||
        (!('theme' in window.localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // App State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Infinite Scroll Ref
  const observerTarget = useRef<HTMLDivElement>(null);

  // Initial Data Load
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const featured = await getFeaturedPosts();
      setFeaturedPosts(featured);
      
      const response = await getPosts(0, 9);
      setPosts(response.data);
      setCursor(response.nextCursor || 0);
      setHasMore(response.hasMore);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handlers
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      // Load 9 more posts at a time for better scroll feel with large datasets
      const response = await getPosts(cursor, 9);
      setPosts(prev => [...prev, ...response.data]);
      setCursor(response.nextCursor || 0);
      setHasMore(response.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, hasMore, loadingMore]);

  // Infinite Scroll Observer
  useEffect(() => {
    const element = observerTarget.current;
    if (!element || loading || !hasMore || searchQuery) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleLoadMore, loading, hasMore, searchQuery]);

  const handleCreatePost = async (newPostData: Omit<BlogPost, 'id' | 'date' | 'readTime'>) => {
    const created = await createPost(newPostData);
    setPosts(prev => [created, ...prev]);
  };

  const handleDeletePost = async (id: string) => {
    await deletePost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
    setFeaturedPosts(prev => prev.filter(p => p.id !== id));
    // If deleted post was open, go back to list
    if (selectedPost?.id === id) {
      setSelectedPost(null);
    }
  };

  // Filtered Posts Logic
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div 
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" 
              onClick={() => {
                setSelectedPost(null);
                window.scrollTo(0,0);
              }}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg transform group-hover:rotate-6 transition-transform">
                P
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                Pratik
              </span>
            </div>

            {/* Search Bar - Hidden if reading a post or on mobile */}
            {!selectedPost && (
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-primary-500/25 transform hover:scale-105 active:scale-95"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Post</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      {selectedPost ? (
        <BlogDetail 
          post={selectedPost} 
          onBack={() => setSelectedPost(null)} 
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="animate-spin text-primary-500" size={48} />
            </div>
          ) : (
            <>
              {/* Hero Section (Only show when not searching) */}
              {!searchQuery && <HeroSlider posts={featuredPosts} />}

              {/* Content Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {searchQuery ? `Results for "${searchQuery}"` : 'Latest Articles'}
                </h2>
              </div>

              {/* Grid */}
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map(post => (
                    <BlogCard 
                      key={post.id} 
                      post={post} 
                      onDelete={handleDeletePost}
                      onClick={(p) => setSelectedPost(p)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No posts found matching your criteria.</p>
                </div>
              )}

              {/* Infinite Scroll Sentinel & Loader */}
              {!searchQuery && hasMore && (
                <div ref={observerTarget} className="mt-16 mb-8 flex flex-col items-center justify-center gap-2 py-8 min-h-[100px]">
                    <Loader className="animate-spin text-primary-500" size={32} />
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading more stories...</span>
                </div>
              )}
              
              {/* End of list message */}
              {!searchQuery && !hasMore && filteredPosts.length > 0 && (
                <div className="mt-16 text-center text-gray-400 dark:text-gray-600 text-sm mb-12">
                  <p>You've reached the end of the collection.</p>
                </div>
              )}
            </>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-lg font-bold shadow-md">P</div>
            <span className="font-semibold text-gray-900 dark:text-white">Pratik Blog</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Built with React & Gemini AI.
          </p>
          <div className="flex gap-4">
            <Github className="text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors" size={20} />
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isModalOpen && (
        <BlogForm 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleCreatePost} 
        />
      )}
    </div>
  );
};

export default App;