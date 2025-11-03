import React, { useState, useRef, useEffect } from 'react';

const GEMINI_API_KEY = 'AIzaSyB9FnCBKH7zQf2cWwONvEzD4S3herMziPw';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'catty',
      text: "Hey there! I'm Catty, your AI finance friend! 😺 I'm here to help you manage your spending and build healthy money habits. How can I help you today?",
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const sendMessageToGemini = async (userMessage) => {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Catty, a friendly and empathetic AI finance assistant. Your role is to help users manage their spending through supportive conversations. Be warm, understanding, and provide practical financial advice. Keep responses concise and friendly. User message: ${userMessage}`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "I'm having trouble connecting right now. Please try again! 😿";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      time: getCurrentTime()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const aiResponse = await sendMessageToGemini(inputMessage);

    const cattyMessage = {
      id: messages.length + 2,
      type: 'catty',
      text: aiResponse,
      time: getCurrentTime()
    };

    setMessages(prev => [...prev, cattyMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Chat Header */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <span className="text-2xl">😺</span>
          </div>
          <div>
            <h2 className="text-xl font-medium text-black">Catty</h2>
            <p className="text-sm text-black opacity-60">Your Finance Friend</p>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          message.type === 'catty' ? (
            <div key={message.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">😺</span>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-3xl rounded-tl-md p-4 inline-block max-w-xs">
                  <p className="text-black text-base">{message.text}</p>
                </div>
                <p className="text-xs text-black opacity-40 mt-1 ml-2">{message.time}</p>
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex gap-3 justify-end">
              <div className="flex-1 text-right">
                <div className="bg-black rounded-3xl rounded-tr-md p-4 inline-block max-w-xs">
                  <p className="text-white text-base">{message.text}</p>
                </div>
                <p className="text-xs text-black opacity-40 mt-1 mr-2">{message.time}</p>
              </div>
            </div>
          )
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">😺</span>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-3xl rounded-tl-md p-4 inline-block">
                <p className="text-black text-base">Typing...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-6 pt-4 border-t border-gray-100">
        <div className="flex gap-3 items-center">
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 bg-gray-100 rounded-full px-6 py-4 text-black placeholder-gray-400 border-none outline-none text-base disabled:opacity-50"
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;

