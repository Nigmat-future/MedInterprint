import React from 'react';

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onBack, showBack }) => {
  return (
    <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-6 z-50 transition-all duration-300">
      <div className="flex items-center gap-3 backdrop-blur-md bg-white/70 px-4 py-2 rounded-full border border-white/50 shadow-sm">
        {showBack && (
          <button 
            onClick={onBack}
            className="mr-1 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        )}
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-medical-500 to-medical-700 flex items-center justify-center text-white text-xs shadow-md">
          <i className="fa-solid fa-dna"></i>
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-sm tracking-tight">MediInterpret<span className="text-medical-600">.AI</span></h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          className="w-10 h-10 rounded-full bg-white/50 hover:bg-white backdrop-blur-sm flex items-center justify-center text-slate-500 hover:text-medical-600 transition-all border border-white/50 shadow-sm"
          title="About"
          onClick={() => alert("MediInterpret AI uses advanced LLMs to interpret medical data. Always consult a doctor.")}
        >
          <i className="fa-regular fa-lightbulb"></i>
        </button>
      </div>
    </header>
  );
};