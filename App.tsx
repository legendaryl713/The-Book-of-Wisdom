import React, { useState, useEffect } from 'react';
import { Quote, AppView, InspirationResponse } from './types';
import { BottomNav } from './components/BottomNav';
import { QuoteCard } from './components/QuoteCard';
import { Button } from './components/Button';
import { Plus, Search, Sparkles, Feather, Book, ChevronLeft, ChevronRight, LayoutGrid, BookOpenText } from 'lucide-react';
import { getInspiration } from './services/geminiService';

const MOODS = [
  "积极", "忧郁", "好奇", "充满希望", 
  "斯多葛", "浪漫", "混乱", "宁静"
];

const App: React.FC = () => {
  // --- State ---
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [view, setView] = useState<AppView>(AppView.BOOK);
  
  // Write Form State
  const [inputText, setInputText] = useState('');
  const [inputAuthor, setInputAuthor] = useState('');
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Book View State
  const [isFlipMode, setIsFlipMode] = useState(false);
  const [flipIndex, setFlipIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Inspiration State
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [inspirationResult, setInspirationResult] = useState<InspirationResponse | null>(null);
  const [isLoadingInspiration, setIsLoadingInspiration] = useState(false);

  // --- Effects ---
  
  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('lumina_quotes');
    if (saved) {
      try {
        setQuotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse quotes", e);
      }
    } else {
      // Add a starter quote if empty
      setQuotes([{
        id: 'init-1',
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        dateAdded: Date.now(),
        isFavorite: true,
        tags: ["工作", "热情"]
      }]);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('lumina_quotes', JSON.stringify(quotes));
  }, [quotes]);

  // Reset flip index when search changes
  useEffect(() => {
    setFlipIndex(0);
    setDirection('next');
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
    setIsFlipMode(false); // Switch back to list view to see new quote
  };

  const handleDelete = (id: string) => {
    setQuotes(quotes.filter(q => q.id !== id));
    // Adjust flip index if needed
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

  const handlePrevPage = () => {
    setDirection('prev');
    setFlipIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = (max: number) => {
    setDirection('next');
    setFlipIndex(prev => Math.min(max - 1, prev + 1));
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
        <p className="text-slate-400 font-sans text-sm">将智慧永恒珍藏。</p>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">语录内容</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="写下深刻的文字..."
          className="w-full h-40 bg-transparent text-xl font-serif text-slate-200 placeholder-slate-600 border-none focus:ring-0 resize-none p-0 leading-relaxed"
          autoFocus
        />
        
        <div className="h-px w-full bg-slate-700 my-4" />

        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">作者</label>
        <input
          type="text"
          value={inputAuthor}
          onChange={(e) => setInputAuthor(e.target.value)}
          placeholder="是谁说的？"
          className="w-full bg-transparent font-sans text-gold border-none focus:ring-0 p-0 placeholder-slate-600"
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

    return (
      <div className="max-w-2xl mx-auto p-4 pb-24 min-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-40 bg-midnight/95 backdrop-blur-xl py-4 mb-4 border-b border-white/5">
          <div className="flex justify-between items-center mb-4 px-2">
            <div>
              <h1 className="font-display text-3xl text-gold">语录集</h1>
              <p className="text-slate-400 text-[10px] tracking-widest uppercase mt-1">
                已收录 {quotes.length} {quotes.length === 1 ? '条' : '条'} 智慧
              </p>
            </div>
            
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button 
                onClick={() => setIsFlipMode(false)}
                className={`p-2 rounded-md transition-all ${!isFlipMode ? 'bg-gold text-midnight shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                title="列表视图"
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setIsFlipMode(true)}
                className={`p-2 rounded-md transition-all ${isFlipMode ? 'bg-gold text-midnight shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                title="翻页视图"
              >
                <BookOpenText size={16} />
              </button>
            </div>
          </div>

          <div className="relative group mx-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="搜索智慧、作者或标签..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all font-sans"
            />
          </div>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-600">
            <Feather size={48} className="mb-4 opacity-20" />
            <p className="font-serif italic text-lg">此处空空如也...</p>
            <button onClick={() => setView(AppView.WRITE)} className="mt-4 text-gold hover:underline text-sm font-bold uppercase tracking-widest">
              开始记录
            </button>
          </div>
        ) : (
          <>
            {isFlipMode ? (
              // Enhanced 3D Book Flip View with Swipe
              <div 
                className="flex-1 flex flex-col items-center justify-center animate-fade-in relative px-2 py-6 select-none"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={() => onTouchEnd(filteredQuotes.length)}
              >
                
                {/* Book Container */}
                <div className="perspective-2000 relative w-full max-w-[500px] aspect-[4/5] md:aspect-[3/4]">
                  
                  {/* Book Back Cover (Leather texture) */}
                  <div className="absolute inset-0 bg-book-cover rounded-r-2xl shadow-book transform translate-x-3 translate-y-3 z-0" />
                  
                  {/* Fake Page Stack (Right side thickness) */}
                  <div className="absolute top-2 bottom-2 right-1 w-4 bg-slate-300 rounded-r-sm z-0 transform translate-x-1" />
                  <div className="absolute top-3 bottom-3 right-2 w-4 bg-slate-400 rounded-r-sm z-0 transform translate-x-1" />

                  {/* Spine (Left side) */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/10 to-transparent z-20 pointer-events-none rounded-l-sm" />

                  {/* Active Page Wrapper */}
                  <div className="absolute inset-0 z-10 origin-left transition-all duration-700">
                     <div 
                       key={filteredQuotes[flipIndex].id} 
                       className={`w-full h-full bg-book-page rounded-r-lg overflow-hidden shadow-page ${direction === 'next' ? 'animate-turn-next' : 'animate-turn-prev'}`}
                     >
                       <QuoteCard 
                         quote={filteredQuotes[flipIndex]} 
                         onDelete={handleDelete}
                         onUpdate={handleUpdate}
                         variant="book"
                       />
                     </div>
                  </div>

                  {/* Navigation Click Areas (for mouse users) */}
                  <div className="absolute inset-y-0 left-0 w-16 z-30 cursor-pointer hover:bg-white/5 transition-colors hidden md:block" onClick={handlePrevPage} />
                  <div className="absolute inset-y-0 right-0 w-16 z-30 cursor-pointer hover:bg-white/5 transition-colors hidden md:block" onClick={() => handleNextPage(filteredQuotes.length)} />

                </div>

                {/* Visible Navigation Controls */}
                <div className="flex items-center justify-between w-full max-w-[500px] mt-8 px-4">
                  <button 
                    onClick={handlePrevPage} 
                    disabled={flipIndex === 0}
                    className="p-3 rounded-full bg-slate-800 text-gold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors shadow-lg flex items-center gap-2"
                  >
                    <ChevronLeft size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider hidden md:block">上一页</span>
                  </button>
                  
                  <div className="font-display text-gold/50 tracking-widest text-sm bg-slate-800/50 px-4 py-1.5 rounded-full border border-white/5">
                    第 {flipIndex + 1} / {filteredQuotes.length} 页
                  </div>

                  <button 
                    onClick={() => handleNextPage(filteredQuotes.length)} 
                    disabled={flipIndex >= filteredQuotes.length - 1}
                    className="p-3 rounded-full bg-slate-800 text-gold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors shadow-lg flex items-center gap-2"
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-900 to-slate-900 border border-purple-500/30 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <Sparkles className="text-purple-400" size={32} />
        </div>
        <h2 className="font-display text-3xl text-slate-100">缪斯的低语</h2>
        <p className="text-slate-500 mt-2 font-serif italic">"当你找不到词句时，让词句来找你。"</p>
      </div>

      {!inspirationResult && !isLoadingInspiration && (
        <div className="grid grid-cols-2 gap-3 w-full">
          {MOODS.map(mood => (
            <button
              key={mood}
              onClick={() => handleInspire(mood)}
              className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-gold/30 rounded-xl text-center transition-all duration-300 group"
            >
              <span className="font-display text-sm text-slate-300 group-hover:text-gold uppercase tracking-wider">{mood}</span>
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
        <div className="w-full bg-slate-900 border border-gold/20 p-8 rounded-2xl shadow-2xl relative overflow-hidden animate-scale-in">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
          
          <p className="font-serif text-2xl md:text-3xl text-slate-100 text-center leading-relaxed mb-6">
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
    <div className="min-h-screen bg-midnight text-slate-200 pb-20 selection:bg-gold/30 selection:text-white overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-midnight to-midnight" />
      
      <main className="relative z-10">
        {view === AppView.WRITE && renderWriteView()}
        {view === AppView.BOOK && renderBookView()}
        {view === AppView.INSPIRE && renderInspireView()}
      </main>

      <BottomNav currentView={view} setView={setView} />
      
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