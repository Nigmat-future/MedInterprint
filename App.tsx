import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MessageBubble } from './components/MessageBubble';
import { InputArea } from './components/InputArea';
import { Message, Role, Attachment, ConsultationType } from './types';
import { sendMessageStream, initializeChat } from './services/geminiService';
import { getSystemInstruction } from './constants';

type ViewState = 'landing' | 'chat';

// Configuration for the 4 consultation types
const CONSULTATION_OPTIONS = [
  {
    type: ConsultationType.IMAGING,
    title: "Imaging & Radiology",
    desc: "Interpretation of CT, MRI, Ultrasound, and X-Ray reports.",
    icon: "fa-solid fa-x-ray",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50"
  },
  {
    type: ConsultationType.LAB_TEST,
    title: "Lab Test Analysis",
    desc: "Detailed breakdown of blood work, urinalysis, and pathology.",
    icon: "fa-solid fa-flask-vial",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50"
  },
  {
    type: ConsultationType.DECISION,
    title: "Medical Decision",
    desc: "Support for treatment options, surgery vs. conservative care.",
    icon: "fa-solid fa-scale-balanced",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50"
  },
  {
    type: ConsultationType.MEDICATION,
    title: "Medication & Safety",
    desc: "Drug interactions, side effects, and dosage guidelines.",
    icon: "fa-solid fa-pills",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50"
  }
];

const LandingView: React.FC<{ onStart: (type: ConsultationType) => void }> = ({ onStart }) => (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center animate-fade-in relative overflow-hidden select-none">
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse-slow"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-medical-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse-slow" style={{ animationDelay: '1s'}}></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse-slow" style={{ animationDelay: '2s'}}></div>

        <div className="z-10 max-w-5xl flex flex-col items-center w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-white/60 shadow-sm backdrop-blur-md mb-8 animate-slide-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">AI Medical Assistant</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-[1.1] animate-slide-up" style={{ animationDelay: '0.1s'}}>
                Your Personal <br className="md:hidden"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 via-indigo-600 to-medical-600 bg-300% animate-gradient">Medical Intelligence.</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s'}}>
                Select a category below to get professional AI interpretations of your medical data.
            </p>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-4xl px-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                {CONSULTATION_OPTIONS.map((option, idx) => (
                    <button
                        key={option.type}
                        onClick={() => onStart(option.type)}
                        className="group relative flex items-start gap-5 p-6 rounded-[24px] bg-white/60 hover:bg-white backdrop-blur-md border border-white/50 text-left transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
                    >
                        <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-white bg-gradient-to-br ${option.color} shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform duration-300`}>
                            <i className={`${option.icon} text-2xl`}></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-medical-700 transition-colors">{option.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{option.desc}</p>
                        </div>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-slate-300">
                             <i className="fa-solid fa-chevron-right"></i>
                        </div>
                    </button>
                ))}
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-slate-400 animate-slide-up text-sm" style={{ animationDelay: '0.5s' }}>
                <span className="flex items-center gap-2"><i className="fa-solid fa-shield-halved"></i> Private & Secure</span>
                <span className="flex items-center gap-2"><i className="fa-solid fa-user-doctor"></i> For Info Only</span>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [consultationType, setConsultationType] = useState<ConsultationType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat when entering chat view and we have a type selected
    if (view === 'chat' && consultationType && messages.length === 0) {
        // 1. Initialize Gemini with specific system instruction
        const instruction = getSystemInstruction(consultationType);
        initializeChat(instruction);
        
        // 2. Determine Welcome Message
        let welcomeText = "";
        switch(consultationType) {
            case ConsultationType.IMAGING:
                welcomeText = "Hello. I am your **AI Imaging Consultant**.\n\nPlease upload a clear photo or **PDF** of your **CT, MRI, Ultrasound, or X-Ray report**, or copy the findings here. I'll help you understand the radiological terms.";
                break;
            case ConsultationType.MEDICATION:
                welcomeText = "Hello. I am your **AI Medication Assistant**.\n\nI can check for **drug interactions**, explain **side effects**, or clarify dosage instructions. What medication are you asking about?";
                break;
            case ConsultationType.DECISION:
                welcomeText = "Hello. I am your **AI Medical Decision Support**.\n\nI can help you weigh the **pros and cons** of different treatments or explain specific procedures. What decision are you facing today?";
                break;
            case ConsultationType.LAB_TEST:
            default:
                welcomeText = "Hello. I am your **AI Lab Interpreter**.\n\nPlease upload a photo or **PDF** of your **blood test or lab report**, or type in your values. I'll explain what the results mean.";
                break;
        }

        // Staggered welcome message
        const timer = setTimeout(() => {
            setMessages([{
                id: 'welcome',
                role: Role.MODEL,
                text: welcomeText,
                timestamp: Date.now()
              }]);
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [view, consultationType]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, view, isLoading]);

  const handleStartConsultation = (type: ConsultationType) => {
    setConsultationType(type);
    setView('chat');
  };

  const handleBack = () => {
    setView('landing');
    setMessages([]);
    setConsultationType(null);
  };

  const handleSendMessage = async (text: string, attachment: Attachment | null) => {
    const userMessageId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMessageId,
      role: Role.USER,
      text,
      attachment: attachment || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const modelMessageId = (Date.now() + 1).toString();
      // Add empty model message for streaming
      setMessages(prev => [...prev, {
        id: modelMessageId,
        role: Role.MODEL,
        text: '', 
        timestamp: Date.now()
      }]);

      await sendMessageStream(text, attachment, (streamedText) => {
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, text: streamedText } 
            : msg
        ));
      });

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: "I apologize, but I encountered an error. Please try again.",
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <Header 
        showBack={view === 'chat'} 
        onBack={handleBack} 
      />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-0 h-full">
        {view === 'landing' ? (
            <LandingView onStart={handleStartConsultation} />
        ) : (
            <div className="h-full flex flex-col max-w-4xl mx-auto px-4 animate-fade-in relative">
                {/* Chat Container - Fixed padding for header/footer */}
                <div className="flex-1 overflow-y-auto scrollbar-hide pt-24 pb-48">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                    
                    {isLoading && (
                    <div className="flex w-full mb-6 justify-start animate-fade-in pl-1">
                        <div className="flex gap-3 flex-row items-end">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-medical-500 to-medical-600 flex-shrink-0 flex items-center justify-center shadow-sm">
                                <i className="fa-solid fa-dna text-white text-xs fa-spin" style={{ animationDuration: '3s'}}></i>
                            </div>
                            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                                <div className="flex gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-medical-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                                    <span className="w-1.5 h-1.5 bg-medical-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                                    <span className="w-1.5 h-1.5 bg-medical-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                    
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>
        )}
      </main>

      {/* Input Area */}
      {view === 'chat' && (
        <InputArea 
            onSendMessage={handleSendMessage} 
            disabled={isLoading} 
            consultationType={consultationType}
        />
      )}
    </div>
  );
};

export default App;