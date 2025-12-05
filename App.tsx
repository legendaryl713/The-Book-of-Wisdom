import React, { useState, useEffect, useRef } from 'react';
import { Quote, AppView, InspirationResponse } from './types';
import { BottomNav } from './components/BottomNav';
import { QuoteCard } from './components/QuoteCard';
import { Button } from './components/Button';
import { Plus, Search, Sparkles, Feather, Book, ChevronLeft, ChevronRight, LayoutGrid, BookOpenText, Download, AlertCircle, Moon, Sun } from 'lucide-react';
import { getInspiration } from './services/geminiService';

const MOODS = [
  "积极", "忧郁", "好奇", "充满希望", 
  "斯多葛", "浪漫", "混乱", "宁静"
];

const DEFAULT_QUOTES: Quote[] = [{
  id: 'init-1',
  text: "伟大的工作源于对所做之事的热爱。",
  author: "史蒂夫·乔布斯",
  dateAdded: Date.now(),
  isFavorite: true,
  tags: ["工作", "热情"]
}];

const App: React.FC = () => {
  // --- State Initialization with Local Storage ---

  // 1. Quotes: Lazy load from local storage
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumina_quotes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse quotes", e);
        }
      }
    }
    return DEFAULT_QUOTES;
  });

  // 2. Preferences: Load last view, flip mode settings, and THEME
  const [view, setView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumina_prefs');
      if (saved) {
        try {
          return JSON.parse(saved).lastView || AppView.BOOK;
        } catch (e) {}
      }
    }
    return AppView.BOOK;
  });

  const [isFlipMode, setIsFlipMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumina_prefs');
      if (saved) {
        try {
          return JSON.parse(saved).isFlipMode ?? false;
        } catch (e) {}
      }
    }
    return false;
  });

  // Dark Mode State (Default to false = Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumina_prefs');
      if (saved) {
        try {
          return JSON.parse(saved).isDarkMode ?? false; // Default Light Mode
        } catch (e) {}
      }
    }
    return false;
  });

  // 3. Reading Progress
  const [flipIndex, setFlipIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem('lumina_prefs');
      const savedQuotes = localStorage.getItem('lumina_quotes');
      
      if (savedPrefs && savedQuotes) {
        try {
          const { lastReadQuoteId } = JSON.parse(savedPrefs);
          const quotesArr = JSON.parse(savedQuotes);
          
          if (lastReadQuoteId) {
            const idx = quotesArr.findIndex((q: any) => q.id === lastReadQuoteId);
            if (idx !== -1) return idx;
          }
        } catch (e) {}
      }
    }
    return 0;
  });
  
  // Write Form State
  const [inputText, setInputText] = useState('');
  const [inputAuthor, setInputAuthor] = useState('');
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Book View Navigation State
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  
  // Animation State
  const [outgoingQuote, setOutgoingQuote] = useState<Quote | null>(null);

  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Inspiration State
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [inspirationResult, setInspirationResult] = useState<InspirationResponse | null>(null);
  const [isLoadingInspiration, setIsLoadingInspiration] = useState(false);
  
  // Export State
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  // Helper ref to track first render for search effect
  const isFirstRender = useRef(true);

  // --- Persistence Effects ---

  // Save Quotes
  useEffect(() => {
    localStorage.setItem('lumina_quotes', JSON.stringify(quotes));
  }, [quotes]);

  // Save Preferences
  useEffect(() => {
    const currentQuoteId = quotes[flipIndex]?.id;
    const prefs = {
      isFlipMode,
      lastView: view,
      lastReadQuoteId: currentQuoteId,
      isDarkMode
    };
    localStorage.setItem('lumina_prefs', JSON.stringify(prefs));
  }, [isFlipMode, view, flipIndex, quotes, isDarkMode]);

  // Apply Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Reset flip index when search changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setFlipIndex(0);
    setDirection('next');
    setOutgoingQuote(null);
  }, [searchTerm]);

  // --- Handlers ---

  const handleAddQuote = (text: string, author: string) => {
    if (!text.trim()) return;
    const newQuote: Quote = {
      id: Date.now().toString(),
      text: text.trim(),
      author: author.trim() || "佚名",
      dateAdded: Date.now(),
      isFavorite: false,
      tags: [],
    };
    setQuotes([newQuote, ...quotes]);
    setInputText('');
    setInputAuthor('');
    setView(AppView.BOOK);
    setIsFlipMode(false);
  };

  const handleDelete = (id: string) => {
    setQuotes(quotes.filter(q => q.id !== id));
    setOutgoingQuote(null);
    if (flipIndex >= quotes.length - 2) { 
       setFlipIndex(Math.max(0, flipIndex - 1));
    }
  };

  const handleUpdate = (updatedQuote: Quote) => {
    setQuotes(quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q));
  };

  const handleInspire = async (mood: string) => {
    setSelectedMood(mood);
    setIsLoadingInspiration(true);
    setInspirationResult(null);
    
    const result = await getInspiration(mood);
    setInspirationResult(result);
    setIsLoadingInspiration(false);
  };

  const saveInspiration = () => {
    if (inspirationResult) {
      handleAddQuote(inspirationResult.text, inspirationResult.author);
      setInspirationResult(null);
      setSelectedMood(null);
    }
  };

  const handleExportClick = () => {
    setShowExportConfirm(true);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const executePDFExport = () => {
    setShowExportConfirm(false);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("请允许弹出窗口以导出 PDF");
      return;
    }

    const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>智慧之书语录导出 - ${today}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
          body {
            font-family: "Songti SC", "Noto Serif SC", serif;
            padding: 40px;
            color: #1a1a1a;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #c5a059;
            padding-bottom: 20px;
            margin-bottom: 40px;
          }
          .header h1 {
            font-size: 32px;
            margin: 0 0 10px 0;
            color: #2a1d1d;
          }
          .header p {
            font-size: 14px;
            color: #666;
            margin: 0;
          }
          .quote-item {
            margin-bottom: 30px;
            padding: 20px;
            background-color: #fcfbf9;
            border-left: 4px solid #c5a059;
            page-break-inside: avoid;
          }
          .quote-text {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 15px;
            font-weight: bold;
            color: #333;
          }
          .quote-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #666;
          }
          .quote-author {
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #c5a059;
          }
          .tags {
            margin-top: 8px;
          }
          .tag {
            display: inline-block;
            background: #eee;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            margin-right: 5px;
            color: #555;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>智慧之书</h1>
          <p>导出日期: ${today} | 共 ${quotes.length} 条珍藏</p>
        </div>
        
        <div class="content">
          ${quotes.map(q => `
            <div class="quote-item">
              <div class="quote-text">"${q.text}"</div>
              <div class="quote-meta">
                <span class="quote-author">— ${q.author}</span>
                <span>${new Date(q.dateAdded).toLocaleDateString('zh-CN')}</span>
              </div>
              ${q.tags && q.tags.length > 0 ? `
                <div class="tags">
                  ${q.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div class="footer">
          Developed by Junzhe with Book of Wisdom
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrevPage = () => {
    if (flipIndex <= 0) return;
    setDirection('prev');
    setOutgoingQuote(quotes[flipIndex]);
    setFlipIndex(prev => prev - 1);
    setTimeout(() => setOutgoingQuote(null), 1200);
  };

  const handleNextPage = (max: number) => {
    if (flipIndex >= max - 1) return;
    setDirection('next');
    setOutgoingQuote(quotes[flipIndex]);
    setFlipIndex(prev => prev + 1);
    setTimeout(() => setOutgoingQuote(null), 1200);
  };

  // --- Swipe Handlers ---
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (max: number) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && flipIndex < max - 1) {
       handleNextPage(max);
    }
    if (isRightSwipe && flipIndex > 0) {
       handlePrevPage();
    }
  };

  // --- Render Views ---

  const renderWriteView = () => (
    <div className="flex flex-col h-full max-w-lg mx-auto p-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl text-gold mb-2">新篇章</h2>
        <p className="text-slate-500 dark:text-slate-400 font-sans text-sm">将智慧永恒珍藏。</p>
      </div>

      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-sm transition-colors duration-500">
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">语录内容</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="写下深刻的文字..."
          className="w-full h-40 bg-transparent text-xl font-serif text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 border-none focus:ring-0 resize-none p-0 leading-relaxed transition-colors"
          autoFocus
        />
        
        <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-4 transition-colors" />

        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">作者</label>
        <input
          type="text"
          value={inputAuthor}
          onChange={(e) => setInputAuthor(e.target.value)}
          placeholder="是谁说的？"
          className="w-full bg-transparent font-sans text-gold border-none focus:ring-0 p-0 placeholder-slate-400 dark:placeholder-slate-600"
        />
      </div>

      <div className="mt-8">
        <Button 
          onClick={() => handleAddQuote(inputText, inputAuthor)} 
          disabled={!inputText.trim()}
          className="w-full"
          icon={<Feather size={20} />}
        >
          载入史册
        </Button>
      </div>
    </div>
  );

  const renderBookView = () => {
    const lowerSearch = searchTerm.toLowerCase();
    const filteredQuotes = quotes.filter(q => 
      q.text.toLowerCase().includes(lowerSearch) || 
      q.author.toLowerCase().includes(lowerSearch) ||
      q.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
    );

    const currentQuote = filteredQuotes[flipIndex];

    return (
      <div className="max-w-2xl mx-auto p-4 pb-24 min-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-paper/95 dark:bg-midnight/95 backdrop-blur-xl py-4 mb-4 border-b border-slate-200 dark:border-white/5 transition-colors duration-500">
          <div className="flex justify-between items-center mb-4 px-2">
            <div>
              <h1 className="font-display text-3xl text-gold">智慧之书</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] tracking-widest uppercase mt-1">
                已收录 {quotes.length} {quotes.length === 1 ? '条' : '条'} 智慧
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-gold hover:border-gold/30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                title={isDarkMode ? "切换亮色模式" : "切换夜间模式"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={handleExportClick}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-gold hover:border-gold/30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                title="导出 PDF"
              >
                <Download size={18} />
              </button>

              <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setIsFlipMode(false)}
                  className={`p-2 rounded-md transition-all ${!isFlipMode ? 'bg-gold text-midnight shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  title="列表视图"
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setIsFlipMode(true)}
                  className={`p-2 rounded-md transition-all ${isFlipMode ? 'bg-gold text-midnight shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  title="翻页视图"
                >
                  <BookOpenText size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="relative group mx-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-gold transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="搜索智慧、作者或标签..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all font-sans"
            />
          </div>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-400 dark:text-slate-600">
            <Feather size={48} className="mb-4 opacity-20" />
            <p className="font-serif italic text-lg">此处空空如也...</p>
            <button onClick={() => setView(AppView.WRITE)} className="mt-4 text-gold hover:underline text-sm font-bold uppercase tracking-widest">
              开始记录
            </button>
          </div>
        ) : (
          <>
            {isFlipMode && currentQuote ? (
              // Enhanced 3D Book Flip View
              <div 
                className="flex-1 flex flex-col items-center justify-center animate-fade-in relative px-2 py-6 select-none"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={() => onTouchEnd(filteredQuotes.length)}
              >
                
                {/* Book Container */}
                <div className="perspective-2000 relative w-full max-w-[500px] aspect-[4/5] md:aspect-[3/4]">
                  
                  {/* Book Back Cover */}
                  <div className="absolute inset-0 bg-book-cover rounded-r-2xl shadow-book transform translate-x-3 translate-y-3 z-0" />
                  
                  {/* Fake Page Stack */}
                  <div className="absolute top-2 bottom-2 right-1 w-4 bg-slate-200 dark:bg-slate-300 rounded-r-sm z-0 transform translate-x-1 transition-colors" />
                  <div className="absolute top-3 bottom-3 right-2 w-4 bg-slate-300 dark:bg-slate-400 rounded-r-sm z-0 transform translate-x-1 transition-colors" />

                  {/* Spine */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 dark:from-white/10 to-transparent z-20 pointer-events-none rounded-l-sm" />

                  {/* Active Pages Wrapper */}
                  <div className="absolute inset-0 z-10 origin-left transform-style-3d">
                    
                    {/* PREV ACTION (Going Back) */}
                    {direction === 'prev' && outgoingQuote && (
                       <>
                         {/* Bottom Layer: Old Page (Outgoing) */}
                         <div className="absolute inset-0 z-10 w-full h-full bg-paper dark:bg-book-page rounded-r-lg overflow-hidden shadow-page transition-colors duration-500">
                            <QuoteCard 
                              quote={outgoingQuote} 
                              onDelete={handleDelete}
                              onUpdate={handleUpdate}
                              variant="book"
                            />
                         </div>
                         
                         {/* Top Layer: New Page (Incoming) */}
                         <div className="absolute inset-0 z-20 w-full h-full transform-style-3d animate-flip-in-right origin-left">
                            <div className="absolute inset-0 backface-hidden z-20 bg-paper dark:bg-book-page rounded-r-lg overflow-hidden transition-colors duration-500">
                              <QuoteCard 
                                quote={currentQuote} 
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                                variant="book"
                              />
                            </div>
                            <div className="absolute inset-0 backface-hidden z-10 page-back-face rounded-l-lg page-texture" />
                         </div>
                       </>
                    )}

                    {/* NEXT ACTION (Going Forward) */}
                    {direction === 'next' && outgoingQuote && (
                       <>
                         {/* Bottom Layer: New Page (Incoming) */}
                         <div className="absolute inset-0 z-10 w-full h-full bg-paper dark:bg-book-page rounded-r-lg overflow-hidden shadow-page transition-colors duration-500">
                            <QuoteCard 
                              quote={currentQuote} 
                              onDelete={handleDelete}
                              onUpdate={handleUpdate}
                              variant="book"
                            />
                         </div>
                         
                         {/* Top Layer: Old Page (Outgoing) */}
                         <div className="absolute inset-0 z-20 w-full h-full transform-style-3d animate-flip-out-left origin-left">
                            <div className="absolute inset-0 backface-hidden z-20 bg-paper dark:bg-book-page rounded-r-lg overflow-hidden transition-colors duration-500">
                               <QuoteCard 
                                 quote={outgoingQuote} 
                                 onDelete={handleDelete}
                                 onUpdate={handleUpdate}
                                 variant="book"
                               />
                            </div>
                            <div className="absolute inset-0 backface-hidden z-10 page-back-face rounded-l-lg page-texture" />
                         </div>
                       </>
                    )}
                    
                    {/* Static State */}
                    {!outgoingQuote && (
                       <div className="absolute inset-0 z-10 w-full h-full bg-paper dark:bg-book-page rounded-r-lg overflow-hidden shadow-page transition-colors duration-500">
                          <QuoteCard 
                            quote={currentQuote} 
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            variant="book"
                          />
                       </div>
                    )}

                  </div>

                  {/* Navigation Click Areas */}
                  <div className="absolute inset-y-0 left-0 w-16 z-30 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden md:block" onClick={handlePrevPage} />
                  <div className="absolute inset-y-0 right-0 w-16 z-30 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden md:block" onClick={() => handleNextPage(filteredQuotes.length)} />

                </div>

                {/* Visible Navigation Controls */}
                <div className="flex items-center justify-between w-full max-w-[500px] mt-8 px-4">
                  <button 
                    onClick={handlePrevPage} 
                    disabled={flipIndex === 0}
                    className="p-3 rounded-full bg-white dark:bg-slate-800 text-gold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-lg flex items-center gap-2"
                  >
                    <ChevronLeft size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider hidden md:block">上一页</span>
                  </button>
                  
                  <div className="font-display text-slate-500 dark:text-gold/50 tracking-widest text-sm bg-white/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                    第 {flipIndex + 1} / {filteredQuotes.length} 页
                  </div>

                  <button 
                    onClick={() => handleNextPage(filteredQuotes.length)} 
                    disabled={flipIndex >= filteredQuotes.length - 1}
                    className="p-3 rounded-full bg-white dark:bg-slate-800 text-gold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-lg flex items-center gap-2"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider hidden md:block">下一页</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ) : (
              // List View
              <div className="columns-1 gap-6 space-y-6 animate-fade-in">
                 {filteredQuotes.map(quote => (
                   <QuoteCard 
                     key={quote.id} 
                     quote={quote} 
                     onDelete={handleDelete}
                     onUpdate={handleUpdate}
                     variant="card"
                   />
                 ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderInspireView = () => (
    <div className="max-w-xl mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-100 to-white dark:from-purple-900 dark:to-slate-900 border border-purple-200 dark:border-purple-500/30 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <Sparkles className="text-purple-500 dark:text-purple-400" size={32} />
        </div>
        <h2 className="font-display text-3xl text-slate-800 dark:text-slate-100">缪斯的低语</h2>
        <p className="text-slate-500 mt-2 font-serif italic">"当你找不到词句时，让词句来找你。"</p>
      </div>

      {!inspirationResult && !isLoadingInspiration && (
        <div className="grid grid-cols-2 gap-3 w-full">
          {MOODS.map(mood => (
            <button
              key={mood}
              onClick={() => handleInspire(mood)}
              className="p-4 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 hover:border-gold/30 rounded-xl text-center transition-all duration-300 group shadow-sm"
            >
              <span className="font-display text-sm text-slate-600 dark:text-slate-300 group-hover:text-gold uppercase tracking-wider">{mood}</span>
            </button>
          ))}
        </div>
      )}

      {isLoadingInspiration && (
        <div className="flex flex-col items-center text-gold animate-pulse my-12">
           <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
           <p className="font-serif italic text-lg">正在虚空中寻找关于“{selectedMood}”的思绪...</p>
        </div>
      )}

      {inspirationResult && (
        <div className="w-full bg-white dark:bg-slate-900 border border-gold/20 p-8 rounded-2xl shadow-xl relative overflow-hidden animate-scale-in">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
          
          <p className="font-serif text-2xl md:text-3xl text-slate-800 dark:text-slate-100 text-center leading-relaxed mb-6">
            "{inspirationResult.text}"
          </p>
          <p className="text-center text-gold font-display uppercase tracking-widest text-sm mb-8">
            — {inspirationResult.author}
          </p>

          <div className="flex flex-col gap-3">
            <Button onClick={saveInspiration} className="w-full" icon={<Book size={18} />}>
              保存至语录集
            </Button>
            <Button variant="ghost" onClick={() => setInspirationResult(null)}>
              尝试其他
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-paper dark:bg-midnight text-ink dark:text-slate-200 pb-20 selection:bg-gold/30 selection:text-gold overflow-x-hidden transition-colors duration-500">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 dark:opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-200 via-paper to-paper dark:from-slate-800 dark:via-midnight dark:to-midnight" />
      
      {/* Export Confirmation Modal */}
      {showExportConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-midnight/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gold/20 rounded-xl p-6 max-w-sm w-full shadow-2xl transform animate-scale-in">
             <div className="flex items-center gap-3 mb-4 text-gold">
               <AlertCircle size={24} />
               <h3 className="font-display text-xl">确认导出</h3>
             </div>
             <p className="text-slate-600 dark:text-slate-300 mb-6 font-sans leading-relaxed">
               您确定要将语录集导出为 PDF 文件吗？系统将生成打印预览，请在打印窗口中选择 <strong>"另存为 PDF"</strong>。
             </p>
             <div className="flex gap-3 justify-end">
               <Button variant="ghost" onClick={() => setShowExportConfirm(false)} className="text-sm px-4">
                 取消
               </Button>
               <Button onClick={executePDFExport} className="text-sm px-4">
                 确认导出
               </Button>
             </div>
          </div>
        </div>
      )}

      <main className="relative z-10">
        {view === AppView.WRITE && renderWriteView()}
        {view === AppView.BOOK && renderBookView()}
        {view === AppView.INSPIRE && renderInspireView()}
      </main>

      <BottomNav currentView={view} setView={setView} />
      
      {/* Watermark Signature */}
      <div className="fixed bottom-24 left-0 w-full text-center pointer-events-none z-0">
        <p className="font-display text-[9px] text-slate-300 dark:text-gold/20 tracking-[0.3em] uppercase">
          Developed by Junzhe
        </p>
      </div>

      {/* Floating Action Button for Quick Add on Book View */}
      {view === AppView.BOOK && (
        <button
          onClick={() => setView(AppView.WRITE)}
          className="fixed right-6 bottom-24 w-14 h-14 bg-gradient-to-r from-gold to-gold-light rounded-full shadow-[0_4px_20px_rgba(197,160,89,0.4)] flex items-center justify-center text-midnight hover:scale-110 active:scale-95 transition-all z-40 group"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
};

export default App;