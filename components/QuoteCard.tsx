import React, { useState } from 'react';
import { Quote } from '../types';
import { Trash2, Heart, Quote as QuoteIcon, Tag, Plus, X, Share2, Check, Loader2 } from 'lucide-react';

interface QuoteCardProps {
  quote: Quote;
  onDelete: (id: string) => void;
  onUpdate: (updatedQuote: Quote) => void;
  variant?: 'card' | 'book';
}

// Helper to generate a Baroque-style image blob from the quote
const generateQuoteImage = async (quote: Quote): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Ensure fonts are loaded if possible
  await document.fonts.ready;

  // Dimensions (4:5 Ratio for mobile/social)
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  // --- 1. Background: Antique Parchment with Texture ---
  
  // Base Gradient
  const gradient = ctx.createRadialGradient(width/2, height/2, 200, width/2, height/2, height);
  gradient.addColorStop(0, '#fffefb');
  gradient.addColorStop(0.5, '#f7f1e3');
  gradient.addColorStop(1, '#dccbb1'); // Darker antique edges
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Noise Texture (Old Paper Grain)
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 12;
    data[i] += grain;
    data[i+1] += grain;
    data[i+2] += grain;
  }
  ctx.putImageData(imageData, 0, 0);

  // Subtle Pattern Overlay (Damask-ish dots)
  ctx.save();
  ctx.fillStyle = 'rgba(197, 160, 89, 0.08)'; // Very faint gold/brown
  for(let i=0; i<width; i+=40) {
    for(let j=0; j<height; j+=40) {
      if ((i+j) % 80 === 0) {
        ctx.beginPath();
        ctx.arc(i, j, 2, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }
  ctx.restore();

  // --- 2. Metallic Gold Configuration ---
  const goldGradient = ctx.createLinearGradient(0, 0, width, height);
  goldGradient.addColorStop(0, '#c5a059');
  goldGradient.addColorStop(0.2, '#e5c07b'); // Highlight
  goldGradient.addColorStop(0.5, '#b8860b'); // Shadow
  goldGradient.addColorStop(0.8, '#e5c07b');
  goldGradient.addColorStop(1, '#c5a059');

  // Shadow for "Foil" effect
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // --- 3. Intricate Border Frames ---
  const outerMargin = 50;
  const innerMargin = 75;

  // Outer Heavy Frame
  ctx.strokeStyle = goldGradient;
  ctx.lineWidth = 5;
  ctx.strokeRect(outerMargin, outerMargin, width - outerMargin*2, height - outerMargin*2);

  // Inner Thin Frame
  ctx.lineWidth = 2;
  ctx.strokeRect(innerMargin, innerMargin, width - innerMargin*2, height - innerMargin*2);
  
  // Reset shadow for detailed work to avoid blurriness
  ctx.shadowColor = 'transparent';

  // --- 4. Baroque Ornaments ---
  
  // Helper: Draw detailed corner flourish
  const drawFancyCorner = (x: number, y: number, rotation: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(1.5, 1.5); // Make them substantial

    ctx.strokeStyle = goldGradient;
    ctx.fillStyle = goldGradient;
    
    // 1. Corner Bracket (Structural)
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, 120);
    ctx.lineTo(10, 30);
    ctx.bezierCurveTo(10, 10, 30, 10, 120, 10); // Curve corner
    ctx.stroke();

    // 2. Inner Scroll (Decorative)
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(25, 100);
    ctx.bezierCurveTo(25, 50, 50, 25, 100, 25);
    ctx.stroke();

    // 3. Leaf / Shell Motifs
    // Top-left corner bead
    ctx.beginPath();
    ctx.arc(10, 10, 6, 0, Math.PI*2);
    ctx.fill();

    // Scroll endings
    ctx.beginPath();
    ctx.arc(120, 10, 3, 0, Math.PI*2);
    ctx.arc(10, 120, 3, 0, Math.PI*2);
    ctx.fill();

    // Diagonal Flourish
    ctx.beginPath();
    ctx.moveTo(15, 15);
    ctx.quadraticCurveTo(35, 35, 55, 15);
    ctx.quadraticCurveTo(35, 35, 15, 55);
    ctx.fill();

    ctx.restore();
  };

  // Draw 4 corners
  drawFancyCorner(outerMargin, outerMargin, 0);
  drawFancyCorner(width - outerMargin, outerMargin, 90);
  drawFancyCorner(width - outerMargin, height - outerMargin, 180);
  drawFancyCorner(outerMargin, height - outerMargin, 270);

  // Side Center Ornaments (Midpoints)
  const drawSideOrnament = (x: number, y: number, rotation: number) => {
     ctx.save();
     ctx.translate(x, y);
     ctx.rotate(rotation * Math.PI / 180);
     
     ctx.fillStyle = goldGradient;
     ctx.beginPath();
     ctx.moveTo(0, 0);
     ctx.lineTo(10, 15);
     ctx.lineTo(0, 25);
     ctx.lineTo(-10, 15);
     ctx.fill();
     
     ctx.restore();
  };

  drawSideOrnament(width/2, outerMargin, 0); // Top
  drawSideOrnament(width/2, height - outerMargin, 180); // Bottom
  drawSideOrnament(outerMargin, height/2, 270); // Left
  drawSideOrnament(width - outerMargin, height/2, 90); // Right

  // --- 5. Typography & Layout ---
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const textCenterX = width / 2;
  const textCenterY = height / 2 - 40; // Shift up slightly to fit everything

  // QUOTE TEXT
  ctx.fillStyle = '#2d2a2e'; // Deep ink
  // Priority: Playfair (Serif), then generic serif
  ctx.font = 'italic 56px "Playfair Display", "Times New Roman", serif'; 
  
  const maxTextWidth = width - 300; // Generous padding
  const lineHeight = 85;

  // Text Wrapping
  // Detect if primarily Chinese to use character-based splitting
  const isChinese = /[\u4e00-\u9fa5]/.test(quote.text);
  const words = isChinese ? quote.text.split('') : quote.text.split(' ');
  let lines: string[] = [];
  let currentLine = '';

  for (let n = 0; n < words.length; n++) {
    const spacer = (isChinese || n === 0) ? '' : ' ';
    const testLine = currentLine + spacer + words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxTextWidth && n > 0) {
      lines.push(currentLine);
      currentLine = words[n];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);

  // Render Quote Lines
  const totalTextHeight = lines.length * lineHeight;
  let startY = textCenterY - (totalTextHeight / 2);

  lines.forEach((line, i) => {
    // Add subtle shadow to text for print-like quality
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(line.trim(), textCenterX, startY + (i * lineHeight));
  });

  // Reset shadow
  ctx.shadowColor = 'transparent';

  // DECORATIVE DIVIDER
  const dividerY = startY + totalTextHeight + 30;
  
  ctx.strokeStyle = goldGradient;
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Left wing
  ctx.moveTo(textCenterX - 20, dividerY);
  ctx.bezierCurveTo(textCenterX - 60, dividerY - 10, textCenterX - 100, dividerY + 10, textCenterX - 140, dividerY);
  // Right wing
  ctx.moveTo(textCenterX + 20, dividerY);
  ctx.bezierCurveTo(textCenterX + 60, dividerY - 10, textCenterX + 100, dividerY + 10, textCenterX + 140, dividerY);
  ctx.stroke();

  // Center diamond
  ctx.fillStyle = goldGradient;
  ctx.beginPath();
  ctx.moveTo(textCenterX, dividerY - 8);
  ctx.lineTo(textCenterX + 8, dividerY);
  ctx.lineTo(textCenterX, dividerY + 8);
  ctx.lineTo(textCenterX - 8, dividerY);
  ctx.fill();

  // AUTHOR
  const authorY = dividerY + 70;
  ctx.font = '700 42px "Cinzel", serif'; // Classic Roman serif look
  ctx.fillStyle = '#b8860b'; // Dark gold
  ctx.fillText(`—  ${quote.author}  —`, textCenterX, authorY);

  // DATE
  const dateStr = new Date(quote.dateAdded).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  ctx.font = '400 26px "Lato", sans-serif';
  ctx.fillStyle = '#888888';
  ctx.fillText(dateStr, textCenterX, authorY + 60);

  // WATERMARK
  const bottomY = height - 80;
  ctx.font = '700 28px "Cinzel", serif';
  ctx.fillStyle = 'rgba(197, 160, 89, 0.6)';
  ctx.fillText("BOOK OF WISDOM", textCenterX, bottomY);
  
  ctx.font = '500 18px "Lato", sans-serif';
  ctx.fillStyle = 'rgba(197, 160, 89, 0.4)';
  ctx.fillText("Developed by Junzhe", textCenterX, bottomY + 35);

  // Return Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
};

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onDelete, onUpdate, variant = 'card' }) => {
  const [isTagging, setIsTagging] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isSharing, setIsSharing] = useState(false);
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
    if (isSharing) return;
    setIsSharing(true);

    try {
      const imageBlob = await generateQuoteImage(quote);
      if (!imageBlob) throw new Error("Failed to generate image");

      const file = new File([imageBlob], 'wisdom_card.png', { type: 'image/png' });

      // Try native sharing first
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: '智慧之书语录',
        });
      } else {
        // Fallback: Download the image
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wisdom_quote_${quote.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show copied/success feedback
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (error) {
      console.error("Share failed:", error);
      // Fallback to text copy if image fails
      const text = `"${quote.text}" — ${quote.author}`;
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } finally {
      setIsSharing(false);
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
                    disabled={isSharing}
                    className={`p-2 rounded-full transition-colors ${isCopied ? 'text-green-500 bg-green-500/10' : 'text-slate-400 dark:text-slate-500 hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    title="分享图片"
                  >
                    {isSharing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : isCopied ? (
                      <Check size={18} />
                    ) : (
                      <Share2 size={18} />
                    )}
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
