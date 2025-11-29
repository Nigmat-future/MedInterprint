import React, { useState, useRef, ChangeEvent } from 'react';
import { Attachment, ConsultationType } from '../types';
import { SUGGESTED_QUESTIONS } from '../constants';

interface InputAreaProps {
  onSendMessage: (text: string, attachment: Attachment | null) => void;
  disabled: boolean;
  consultationType: ConsultationType | null;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled, consultationType }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        setAttachment({
          mimeType: file.type,
          data: base64Data
        });
        
        textareaRef.current?.focus();
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!text.trim() && !attachment) || disabled) return;

    onSendMessage(text, attachment);
    setText('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Reset height
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    if (textareaRef.current) {
        textareaRef.current.focus();
        // Small timeout to allow value update before calculating height
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
            }
        }, 0);
    }
  };

  const isPDF = attachment?.mimeType === 'application/pdf';

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pb-6 pt-2 px-4 animate-slide-up bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        
        {/* Suggested Chips */}
        {consultationType && !disabled && !text && !attachment && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-sides">
                {SUGGESTED_QUESTIONS[consultationType]?.map((q, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSuggestionClick(q)}
                        className="whitespace-nowrap px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:text-medical-600 hover:border-medical-200 hover:bg-white shadow-sm transition-all active:scale-95 flex-shrink-0"
                    >
                        {q}
                    </button>
                ))}
            </div>
        )}

        <div className="relative group">
            {/* Input Container */}
            <div className={`bg-white backdrop-blur-xl border border-slate-200/80 rounded-[24px] shadow-xl shadow-slate-200/50 overflow-hidden transition-all duration-300 ${disabled ? 'opacity-80' : 'focus-within:border-medical-300 focus-within:ring-4 focus-within:ring-medical-100'}`}>
                
                {/* Attachment Preview Area */}
                {attachment && (
                <div className="px-4 pt-4 flex animate-fade-in bg-slate-50/50 border-b border-slate-100 pb-3">
                    <div className="relative group/image inline-block">
                        <div className={`h-20 w-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative flex items-center justify-center ${isPDF ? 'bg-red-50' : 'bg-slate-100'}`}>
                            {isPDF ? (
                                <div className="text-center p-2">
                                    <i className="fa-solid fa-file-pdf text-3xl text-red-500 mb-1"></i>
                                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">PDF DOC</div>
                                </div>
                            ) : (
                                <img 
                                    src={`data:${attachment.mimeType};base64,${attachment.data}`} 
                                    className="h-full w-full object-cover"
                                    alt="preview"
                                />
                            )}
                            {/* Overlay for generic files to ensure text contrast if needed */}
                            {!isPDF && <div className="absolute inset-0 bg-black/5"></div>}
                        </div>
                        <button 
                            onClick={() => {
                                setAttachment(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-md hover:bg-red-500 transition-colors z-10 border-2 border-white"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                </div>
                )}

                <div className="flex items-end gap-3 p-3">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        className="hidden"
                    />
                    
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:text-medical-600 hover:bg-medical-50 transition-all active:scale-90"
                        title="Upload Image or PDF"
                        disabled={disabled}
                    >
                        <i className="fa-solid fa-paperclip text-lg"></i>
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder={attachment ? "What would you like to know about this result?" : "Ask a medical question or explain symptoms..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 max-h-[150px] text-slate-700 placeholder-slate-400 text-[15px] leading-relaxed scrollbar-hide"
                        rows={1}
                        disabled={disabled}
                    />

                    <button 
                        onClick={() => handleSubmit()}
                        disabled={disabled || (!text.trim() && !attachment)}
                        className={`w-10 h-10 mb-0.5 flex-shrink-0 flex items-center justify-center rounded-full transition-all shadow-sm transform ${
                        disabled || (!text.trim() && !attachment)
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                        : 'bg-gradient-to-br from-slate-800 to-slate-900 text-white hover:shadow-lg hover:shadow-slate-500/20 hover:scale-105 active:scale-95'
                        }`}
                    >
                        {disabled ? (
                            <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                        ) : (
                            <i className="fa-solid fa-arrow-up text-sm"></i>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Disclaimer */}
            <p className="text-center text-[10px] text-slate-400 mt-2 font-medium opacity-60">
                AI may display inaccurate info, including about people, so double-check its responses.
            </p>
        </div>
      </div>
    </div>
  );
};