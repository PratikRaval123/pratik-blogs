import React, { useState } from 'react';
import { X, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { BlogPost } from '../types';
import { generateBlogContent, generateBlogImage } from '../services/gemini';

interface BlogFormProps {
  onClose: () => void;
  onSubmit: (post: Omit<BlogPost, 'id' | 'date' | 'readTime'>) => Promise<void>;
}

export const BlogForm: React.FC<BlogFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    imageUrl: '',
    excerpt: '',
    tags: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAiGenerate = async () => {
    if (!formData.title) {
      alert("Please enter a title first!");
      return;
    }
    
    setIsGenerating(true);
    try {
      // Parallel execution for speed
      const [contentData, imageUrl] = await Promise.all([
        generateBlogContent(formData.title),
        generateBlogImage(formData.title)
      ]);

      setFormData(prev => ({
        ...prev,
        content: contentData.content,
        excerpt: contentData.excerpt,
        tags: contentData.tags.join(', '),
        imageUrl: imageUrl
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to generate content. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Post</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          
          {/* Unique Feature: AI Magic */}
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-100 dark:border-primary-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary-900 dark:text-primary-100 flex items-center gap-2">
                <Sparkles size={18} />
                AI Auto-Author
              </h3>
              <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                Enter a title and let AI write the story & paint the cover.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGenerating || !formData.title}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-primary-500/25 flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {isGenerating ? 'Magic working...' : 'Auto-Generate'}
            </button>
          </div>

          <form id="create-post-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Enter an inspiring title..."
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author Name</label>
                <input
                  required
                  type="text"
                  value={formData.author}
                  onChange={e => setFormData({...formData, author: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                  />
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
            </div>

            {formData.imageUrl && (
              <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
              <textarea
                required
                rows={6}
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none resize-none"
              />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt (Short Summary)</label>
               <input
                type="text"
                value={formData.excerpt}
                onChange={e => setFormData({...formData, excerpt: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
              />
            </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
               <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                placeholder="Tech, AI, Life..."
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-post-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
            {isSubmitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </div>
    </div>
  );
};