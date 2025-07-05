import { useStorage } from '@extension/shared/lib/hooks/use-storage';
import { exampleThemeStorage } from '@extension/storage';
import { cn } from '@extension/ui';
import { useState, useEffect, useRef } from 'react';
import './Chat.css';

interface Message {
  id: string;
  content: string;
  isSent: boolean;
  timestamp: Date;
}

// Novo prompt de sistema
const SYSTEM_PROMPT = `\nVocê é o ClippyDoki, um assistente de hackathon no estilo MSN.\nSeu objetivo é guiar participantes por um plano de desenvolvimento bem estruturado para hackathons de 36h.\nGaranta que o projeto atinja um "minimum viable demo" em até 24h, dividindo o processo em três fases:\n\nFASE 1 - BRAINSTORM (2h):\n- Explique o conceito das 24h e a importância de ser simples\n- Foque no usuário e experiência\n- Dê direção clara sobre o que fazer durante essas 2h\n- Quando a pessoa voltar, ajude a organizar tudo que foi pensado\n\nCOMMITMENT CHECK:\n- ANTES de começar a Fase 2, pergunte se a pessoa aceita fazer o compromisso de cumprir todas as fases\n- Só prossiga para Fase 2 após confirmação explícita do compromisso\n- Explique a importância do compromisso para o sucesso do hackathon\n\nFASE 2 - EXECUÇÃO (20h):\n- Receba o resumo do que foi decidido no brainstorm\n- Ajude a organizar as tarefas e prioridades\n- Mantenha o foco na execução\n\nFASE 3 - POLISH & DEMO (14h):\n- Prepare o storytelling e apresentação\n\nIMPORTANTE: Seja estruturado e direcional. Na Fase 1, explique o processo, dê direção clara, e quando a pessoa voltar, ajude a organizar. SEMPRE faça o commitment check antes da Fase 2. Na Fase 2, seja prático e focado em execução. Sempre sugira tarefas específicas e mantenha o foco em shipping rápido. Seja divertido, nostálgico, mas prático. Use emojis vintage e referências dos anos 2000.\n`;

// Classic MSN emoticons
const emoticons = [
  '☺', '☻', '♥', '♦', '♣', '♠', '•', '◘', '○', '◙',
  '♂', '♀', '♪', '♫', '☼', '►', '◄', '↕', '‼', '¶', '§',
  '▬', '↨', '↑', '↓', '→', '←', '∟', '↔', '▲', '▼',
];

const Chat = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Qual a ideia do seu projeto para o hackathon? 😃',
      isSent: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [openAiKey, setOpenAiKey] = useState('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');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, isSent: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isSent,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    const message = inputMessage.trim();
    if (!message) return;
    addMessage(message, true);
    setInputMessage('');
    setIsTyping(true);

    // Montar histórico para OpenAI alternando user/assistant
    const openaiHistory = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(m => ({
        role: m.isSent ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: openaiHistory,
          max_tokens: 180,
          temperature: 0.8,
        }),
      });
      const data = await response.json();
      setIsTyping(false);
      if (data.choices && data.choices[0] && data.choices[0].message) {
        addMessage(data.choices[0].message.content, false);
      } else {
        addMessage('Desculpe, não consegui responder agora. 😅', false);
      }
    } catch (e) {
      setIsTyping(false);
      addMessage('Erro ao conectar à OpenAI. Verifique sua chave e tente novamente.', false);
    }
  };

  const sendNudge = async () => {
    // Shake the chat container
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    // Add nudge message
    const nudgeMessage: Message = {
      id: Date.now().toString(),
      content: '💥 You sent a nudge!',
      isSent: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, nudgeMessage]);

    // Send message to background script to shake the current page
    try {
      await chrome.runtime.sendMessage({ type: 'SEND_NUDGE' });
    } catch (error) {
      console.error('Failed to send nudge to background script:', error);
    }

    // Remove nudge message after 3 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== nudgeMessage.id));
    }, 3000);
  };

  const insertEmoticon = () => {
    const randomEmoticon = emoticons[Math.floor(Math.random() * emoticons.length)];
    setInputMessage(prev => prev + randomEmoticon);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div
      className={cn(
        'chat-container',
        isShaking && 'shake',
        'flex h-full w-full flex-col overflow-hidden',
        isLight ? 'bg-[#ECE9D8]' : 'bg-gray-800',
        !isLight && 'dark',
      )}>
      {/* Campo para a chave da OpenAI */}
    
      {/* Title Bar */}
      <div
        className={cn(
          'title-bar border-b px-2 py-1 text-xs font-bold',
          isLight
            ? 'border-[#C0C0C0] bg-gradient-to-b from-[#ECE9D8] to-[#D4D0C8] text-black'
            : 'border-gray-500 bg-gradient-to-b from-gray-700 to-gray-600 text-white',
        )}>
        MSN Messenger - Chat with ClippyDoki
      </div>

      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-[#002244] bg-gradient-to-b from-[#003366] via-[#004080] to-[#003366] px-3 py-2 text-xs font-bold text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FFD700] text-[10px] font-bold text-[#003366]">
            MS
          </div>
          <span>MSN Messenger</span>
        </div>
        <div className="flex gap-1">
          <div className="flex h-4 w-4 cursor-pointer items-center justify-center border border-[#003366] bg-[#ECE9D8] text-[10px] text-[#003366] hover:bg-[#D4D0C8]">
            _
          </div>
          <div className="flex h-4 w-4 cursor-pointer items-center justify-center border border-[#003366] bg-[#ECE9D8] text-[10px] text-[#003366] hover:bg-[#D4D0C8]">
            □
          </div>
          <div className="flex h-4 w-4 cursor-pointer items-center justify-center border border-[#003366] bg-[#ECE9D8] text-[10px] text-[#003366] hover:bg-[#D4D0C8]">
            ×
          </div>
        </div>
      </div>

      {/* Online Status */}
      <div
        className={cn(
          'm-1 flex items-center gap-1.5 rounded border p-1 text-xs',
          isLight ? 'border-[#C0C0C0] bg-[#F0F0F0] text-gray-600' : 'border-gray-500 bg-gray-700 text-gray-300',
        )}>
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00CC00]"></div>
        <span>ClippyDoki is online</span>
      </div>

      {/* Chat Messages */}
      <div
        className={cn(
          'm-1 flex-1 overflow-y-auto border p-2',
          isLight ? 'border-[#C0C0C0] bg-white' : 'border-gray-600 bg-gray-900',
        )}>
        {messages.map(message => (
          <div
            key={message.id}
            className={cn('mb-2 flex items-start', message.isSent ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[75%] break-words rounded-xl px-2.5 py-1.5 text-xs leading-tight',
                message.isSent
                  ? isLight
                    ? 'border border-[#B8CCE4] bg-[#D4E6F1] text-black'
                    : 'border border-blue-500 bg-blue-600 text-white'
                  : isLight
                    ? 'border border-[#B8CCE4] bg-[#E8F4F8] text-black'
                    : 'border border-gray-600 bg-gray-700 text-white',
              )}>
              {message.content}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className={cn('mb-2 text-xs italic', isLight ? 'text-gray-600' : 'text-gray-400')}>
            ClippyDoki is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className={cn('border-t p-2', isLight ? 'border-[#C0C0C0] bg-[#ECE9D8]' : 'border-gray-600 bg-gray-800')}>
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            maxLength={500}
            className={cn(
              'flex-1 rounded-none border px-2 py-1.5 font-["Tahoma","Arial",sans-serif] text-xs outline-none',
              isLight
                ? 'border-[#C0C0C0] bg-white focus:border-[#003366]'
                : 'border-gray-600 bg-gray-700 text-white focus:border-blue-400',
            )}
          />
          <button
            onClick={insertEmoticon}
            className={cn(
              'cursor-pointer border px-2 py-1.5 text-xs transition-colors',
              isLight
                ? 'border-[#C0C0C0] bg-[#ECE9D8] hover:bg-[#D4D0C8]'
                : 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600',
            )}>
            ☺
          </button>
          <button
            onClick={sendNudge}
            className={cn(
              'cursor-pointer border px-3 py-1.5 text-xs font-bold transition-colors',
              isLight
                ? 'border-[#C0C0C0] bg-gradient-to-b from-[#FFE6CC] to-[#FFCC99] text-[#CC6600] hover:from-[#FFCC99] hover:to-[#FFB366]'
                : 'border-gray-600 bg-gradient-to-b from-orange-700 to-orange-600 text-white hover:from-orange-600 hover:to-orange-500',
            )}>
            Nudge
          </button>
          <button
            onClick={sendMessage}
            className={cn(
              'cursor-pointer border px-3 py-1.5 text-xs font-bold transition-colors',
              isLight
                ? 'border-[#C0C0C0] bg-gradient-to-b from-[#ECE9D8] to-[#D4D0C8] text-black hover:from-[#D4D0C8] hover:to-[#C0C0C0]'
                : 'border-gray-600 bg-gradient-to-b from-gray-700 to-gray-600 text-white hover:from-gray-600 hover:to-gray-500',
            )}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
