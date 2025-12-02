import React from 'react';
import { Trash2, Clock, Calendar } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
  onDelete: (id: string) => void;
  onClick: (post: BlogPost) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onDelete, onClick }) => {
  return (
    <div className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => onClick(post)}>
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex gap-2 mb-3">
          {post.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-1 text-xs font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        <h3 
          onClick={() => onClick(post)}
          className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {post.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
             <span className="flex items-center gap-1">
               <Calendar size={12} />
               {post.date}
             </span>
             <span className="flex items-center gap-1">
               <Clock size={12} />
               {post.readTime}
             </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if(confirm("Are you sure you want to delete this post?")) {
                onDelete(post.id);
              }
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
            title="Delete Post"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};