import React, { useState, useRef, useEffect } from 'react';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

function ChatPage({ transactions }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'catty',
      text: "Hey there! 👋 I'm Catty, your AI finance buddy! 🐰 I'm here to help you make smart spending decisions. Ask me anything about your wallet - should you buy that coffee? Is your budget looking good? I've got your back! 💰",
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
              text: `You are Catty, a friendly but honest AI finance buddy 🐰

Your style:
- Short, direct responses. No fluff.
- Friendly but straight to the point
- Check the spending data and be real about it
- Use 1-2 emojis max. Keep it brief.
- Respond in the SAME language as the user (Korean or English)
- If Korean, always use polite ~요 ending, never ~다 or ~어

Current spending:
- Balance: $${balance.toFixed(2)}
- By category: ${JSON.stringify(expensesByCategory, null, 2)}
- Item counts: ${JSON.stringify(spendingContext.itemCounts, null, 2)}
- Recent transactions: ${JSON.stringify(spendingContext.recentTransactions, null, 2)}

When asked "should I buy X?":
- Check the recent transactions list FIRST with dates!
- Use dates naturally: "You bought coffee today" or "You got shopping on 10/31 already"
- Count recent purchases: "That's your 3rd coffee this week" 
- Reference specific spending: "You spent $160 on shopping already this month"
- Vary your responses! Don't repeat the same format every time.
- Sometimes mention balance, sometimes focus on frequency, sometimes talk about categories.
- Mix it up: "Maybe next time 😅", "You're good to go! Just don't go crazy 💸", "Nah, you bought enough today 🛑"
- Be specific about their actual behavior. Don't just say "your balance is low"
- Overspending? Stop them with concrete examples from their recent history.
- Reasonable? Encourage but add a small reminder about moderation.
- Keep responses under 3 sentences and sound natural!

User message: ${userMessage}`
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

