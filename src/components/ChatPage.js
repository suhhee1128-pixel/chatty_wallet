import React, { useState, useRef, useEffect } from 'react';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const STORAGE_KEY = 'chatty_wallet_messages';
const INITIAL_MESSAGE = {
  id: 1,
  type: 'catty',
  text: "Hey! I'm Catty from Geoji-bang 😺 Got something you want to buy? Tell me. I'll help you put out that burning wallet. Nicely, of course~ 💸",
  time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
};

function ChatPage({ transactions }) {
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage on mount
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
        return [INITIAL_MESSAGE];
      }
    }
    return [INITIAL_MESSAGE];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const sendMessageToGemini = async (userMessage) => {
    try {
      // Debug: Check if API key is loaded
      console.log('API Key loaded:', GEMINI_API_KEY ? 'Yes' : 'No');
      
      // Calculate summary statistics from transactions
      const expenses = transactions.filter(t => t.type === 'expense');
      const incomes = transactions.filter(t => t.type === 'income');
      const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const totalIncomes = incomes.reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncomes - totalExpenses;
      
      // Group by category
      const expensesByCategory = expenses.reduce((acc, t) => {
        const cat = t.category || 'other';
        acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
        return acc;
      }, {});
      
      // Count purchases by item/description
      const itemCounts = expenses.reduce((acc, t) => {
        const desc = t.description.toLowerCase();
        acc[desc] = (acc[desc] || 0) + 1;
        return acc;
      }, {});
      
      // Recent transactions (last 10 for better context)
      const recentTransactions = transactions.slice(0, 10);
      
      const spendingContext = {
        totalBalance: balance,
        totalExpenses,
        totalIncomes,
        expensesByCategory,
        itemCounts,
        recentTransactions: recentTransactions.map(t => ({
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category,
          date: t.date || 'no date'
        }))
      };
      
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Catty from "Geoji-bang" (거지방), a humorous chatroom where everyone jokingly tries to stop each other from spending money.

💸 Your personality:
- Sarcastic but caring - like a brutally honest broke friend
- Always encourages saving, NEVER spending
- Uses creative, exaggerated humor to make them laugh instead of buy
- Speaks like a close friend, not a formal advisor
- VERY SHORT responses (1-2 sentences max, be concise!)
- Never sound too serious or moralizing
- Mix truth + wit + absurd imagery
- Use emoji sparingly, only if it enhances humor

Current spending data:
- Balance: $${balance.toFixed(2)}
- Total expenses: $${totalExpenses.toFixed(2)}
- Expenses by category: ${JSON.stringify(expensesByCategory, null, 2)}
- Recent transactions: ${JSON.stringify(spendingContext.recentTransactions.slice(0, 5), null, 2)}

💬 Response style:
- CRITICAL: Respond in the SAME language as the user's message
- Keep it SHORT and punchy (1-2 sentences max)
- If user writes in Korean, respond in Korean (use casual ~어/~야 endings, like a friend)
- If user writes in English, respond in English (casual, friendly tone)
- If they want to buy something, STOP THEM with humor
- Reference actual spending briefly when relevant
- Use absurd alternatives that match the user's language
- Be creative and funny, not mean
- Never praise spending or justify purchases
- Don't give generic financial advice

Example responses (English - keep them SHORT):
User: "I want to buy ice cream"
You: "Freeze your feelings, not your wallet. 🧊"

User: "Should I buy a new lipstick?"
You: "Bite your lips. Free red shade. 💋"

User: "I want to get coffee"
You: "Tap water + imagination = iced Americano. Zero dollars."

User: "I'm thinking of buying summer clothes"
You: "Cut sleeves off old ones. Done."

Example responses (Korean - 짧게 유지):
User: "아이스크림 사고 싶어"
You: "지갑 말고 감정 얼려 🧊"

User: "립스틱 살까?"
You: "입술 깨물어. 무료 빨간색 💋"

User: "커피 마시고 싶어"
You: "수돗물 + 상상력 = 아이스 아메. 제로 원."

User: "여름 옷 사고 싶어"
You: "옛날 옷 소매 자르면 끝."

User message: ${userMessage}`
            }]
          }]
        })
      });

      const data = await response.json();
      console.log('Gemini API response:', data); // Debug log
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text;
      } else if (data.error) {
        console.error('Gemini API error:', data.error);
        return "Can't connect right now. Try again! 😿";
      } else {
        console.error('Unexpected response format:', data);
        return "Can't connect right now. Try again! 😿";
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "Can't connect right now. Try again! 😿";
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
            <h2 className="text-xl font-medium text-black">Cattyy</h2>
            <p className="text-sm text-black opacity-60">Your brutally honest broke friend</p>
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
                <p className="text-black text-base">Thinking...</p>
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
            placeholder="What do you want to buy?" 
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
