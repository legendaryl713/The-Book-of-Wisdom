import React, { useState } from 'react';
import { Quote } from '../types';
import { Trash2, Heart, Quote as QuoteIcon, Tag, Plus, X, Share2, Check } from 'lucide-react';

interface QuoteCardProps {
  quote: Quote;
  onDelete: (id: string) => void;
  onUpdate: (updatedQuote: Quote) => void;
  variant?: 'card' | 'book';
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onDelete, onUpdate, variant = 'card' }) => {
  const [isTagging, setIsTagging] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const toggleFavorite = () => {
    onUpdate({ ...quote, isFavorite: !quote.isFavorite });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const currentTags = quote.tags || [];
    if (!currentTags.includes(newTag.trim())) {
      onUpdate({ ...quote, tags: [...currentTags, newTag.trim()] });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = quote.tags || [];
    onUpdate({ ...quote, tags: currentTags.filter(t => t !== tagToRemove) });
  };

  const handleShare = async () => {
    const shareText = `"${quote.text}" — ${quote.author}`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: '智慧之书',
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to Clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const formattedDate = new Date(quote.dateAdded).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Dynamic Styles based on Variant
  const containerClasses = variant === 'book'
    ? "h-full bg-paper dark:bg-book-page page-texture relative rounded-r-lg shadow-none border-t border-b border-r border-slate-200/50 dark:border-white/5 overflow-hidden flex flex-col justify-center transition-colors duration-500" // Book Page Style
    : "w-full bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 p-6 rounded-xl shadow-sm hover:shadow-md dark:shadow-lg hover:shadow-gold/5 transition-all duration-500 mb-6 break-inside-avoid group"; // Default Card Style

  const textPrimary = variant === 'book' ? 'text-ink dark:text-slate-200' : 'text-slate-800 dark:text-slate-200';
  const textSecondary = variant === 'book' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500';

  return (
    <div className={containerClasses}>
      
      {/* Book Gutter Shadow (Only for Book Variant) */}
      {variant === 'book' && (
        <div className="absolute left-0 top-0 bottom-0 w-12 spine-gradient z-10 pointer-events-none" />
      )}

      {/* Content Container - Add padding adjustment for book spine */}
      <div className={`relative z-10 flex flex-col ${variant === 'book' ? 'p-8 pl-12 h-full' : ''}`}>
        
        {/* Decorative Icon */}
        <div className={`absolute text-gold/20 transform -rotate-12 transition-transform duration-500 ${variant === 'book' ? 'top-4 left-8 opacity-30' : '-top-3 -left-3 group-hover:rotate-0'}`}>
           <QuoteIcon size={variant === 'book' ? 60 : 40} fill="currentColor" />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className={`font-serif leading-relaxed italic text-center transition-colors duration-500 ${textPrimary} ${variant === 'book' ? 'text-2xl md:text-3xl px-2' : 'text-xl md:text-2xl'}`}>
            "{quote.text}"
          </p>
          
          <div className="mt-8 text-center">
            <p className="font-display text-gold text-sm tracking-widest uppercase font-bold">
              — {quote.author || "佚名"}
            </p>
            {variant !== 'book' && (
              <p className={`text-xs mt-1 font-sans ${textSecondary}`}>{formattedDate}</p>
            )}
          </div>
        </div>

        {/* Footer / Controls */}
        <div className={`border-t pt-4 mt-4 transition-colors duration-500 ${variant === 'book' ? 'border-slate-900/10 dark:border-white/10' : 'border-slate-100 dark:border-slate-700/30'}`}>
            <div className="flex justify-between items-center">
               <div className={`text-[10px] font-sans tracking-widest uppercase opacity-60 ${textSecondary}`}>
                 {variant === 'book' ? formattedDate : ''}
               </div>

               <div className="flex gap-2">
                  <button 
                    onClick={() => setIsTagging(!isTagging)}
                    className={`p-2 rounded-full transition-colors ${isTagging ? 'text-gold bg-gold/10' : 'text-slate-400 dark:text-slate-500 hover:text-gold hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    title="标签"
                  >
                    <Tag size={18} />
                  </button>
                  <button 
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full transition-colors ${quote.isFavorite ? 'text-red-400 bg-red-400/10' : 'text-slate-400 dark:text-slate-500 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    title="收藏"
                  >
                    <Heart size={18} fill={quote.isFavorite ? "currentColor" : "none"} />
                  </button>
                  
                  {/* Share Button */}
                  <button 
                    onClick={handleShare}
                    className={`p-2 rounded-full transition-colors ${isCopied ? 'text-green-500 bg-green-500/10' : 'text-slate-400 dark:text-slate-500 hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    title="分享"
                  >
                    {isCopied ? <Check size={18} /> : <Share2 size={18} />}
                  </button>

                  <button 
                    onClick={() => onDelete(quote.id)}
                    className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="删除"
                  >
                    <Trash2 size={18} />
                  </button>
               </div>
            </div>

             {/* Tags Section */}
            {(isTagging || (quote.tags && quote.tags.length > 0)) && (
              <div className={`mt-4 ${isTagging ? 'bg-slate-50 dark:bg-midnight/30 p-3 rounded-lg border border-slate-200 dark:border-white/5' : ''}`}>
                
                {/* Tag Input */}
                {isTagging && (
                  <div className="flex items-center gap-2 mb-3">
                    <input 
                      type="text" 
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="添加标签..." 
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md py-1 px-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-gold/50 transition-colors"
                    />
                    <button 
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      className="p-1.5 bg-gold/10 text-gold rounded-md hover:bg-gold/20 disabled:opacity-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}

                {/* Tag List */}
                {quote.tags && quote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quote.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-gold border border-gold/20">
                        #{tag}
                        {isTagging && (
                          <button 
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 text-slate-400 hover:text-red-400"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>
        
        {/* Footer Page Number Simulation */}
        {variant === 'book' && (
          <div className="text-center mt-4 text-slate-400 dark:text-slate-600 text-[10px] font-sans tracking-[0.2em] opacity-30">
            ~ WISDOM ~
          </div>
        )}
      </div>
    </div>
  );
};