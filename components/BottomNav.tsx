import React from 'react';
import { AppView } from '../types';
import { PenTool, BookOpen, Lightbulb } from 'lucide-react';

interface BottomNavProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: AppView.WRITE, label: '撰写', icon: PenTool },
    { id: AppView.BOOK, label: '珍藏', icon: BookOpen },
    { id: AppView.INSPIRE, label: '灵感', icon: Lightbulb },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-paper/90 dark:bg-midnight/90 backdrop-blur-md border-t border-slate-200 dark:border-white/5 z-50 pb-safe transition-colors duration-500">
      <div className="flex justify-around items-center max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center w-full py-4 transition-all duration-300 ${
                isActive ? 'text-gold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-gold/10 scale-110 mb-1' : 'mb-1'}`}>
                <item.icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-sans tracking-widest uppercase ${isActive ? 'opacity-100 font-bold' : 'opacity-60'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-12 h-0.5 bg-gold shadow-[0_0_10px_#c5a059] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};