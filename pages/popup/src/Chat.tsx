import { useStorage } from '@extension/shared';
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

const Chat = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! How are you doing today? :)',
      isSent: false,
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: '2',
      content: "Hi! I'm doing great, thanks for asking! How about you?",
      isSent: true,
      timestamp: new Date(Date.now() - 45000),
    },
    {
      id: '3',
      content: 'Pretty good! Just working on some projects. Want to chat?',
      isSent: false,
      timestamp: new Date(Date.now() - 30000),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample responses for the AI friend (vintage style)
  const responses = [
    "That's cool! Tell me more about it.",
    'Haha, I know what you mean! :)',
    "Really? That's awesome!",
    "I'm not sure I understand, can you explain?",
    'That sounds like fun!',
    "Oh wow, that's cool!",
    'I agree with you on that one!',
    'Thanks for sharing that with me!',
    "That's a good point!",
    "I'm glad you told me that!",
    "LOL! That's funny!",
    'OMG, really?',
    "That's so true!",
    'I totally get what you mean!',
    "That's interesting!",
    'Cool beans!',
    "That's wicked!",
    "I'm with you on that!",
    "That's the bomb!",
    'Sweet! Tell me more!',
  ];

  // Classic MSN emoticons
  const emoticons = [
    '☺',
    '☻',
    '♥',
    '♦',
    '♣',
    '♠',
    '•',
    '◘',
    '○',
    '◙',
    '♂',
    '♀',
    '♪',
    '♫',
    '☼',
    '►',
    '◄',
    '↕',
    '‼',
    '¶',
    '§',
    '▬',
    '↨',
    '↑',
    '↓',
    '→',
    '←',
    '∟',
    '↔',
    '▲',
    '▼',
  ];

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

  const sendMessage = () => {
    const message = inputMessage.trim();
    if (message) {
      addMessage(message, true);
      setInputMessage('');

      // Show typing indicator
      setIsTyping(true);

      // Simulate AI response after a delay
      setTimeout(
        () => {
          setIsTyping(false);
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          addMessage(randomResponse, false);
        },
        1500 + Math.random() * 2000,
      );
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
