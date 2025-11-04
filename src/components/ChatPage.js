import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
  const { user } = useAuth();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages from Supabase on mount
  useEffect(() => {
    if (user) {
      loadMessages();
      migrateLocalMessagesToSupabase();
    } else {
      // If not logged in, use localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved messages:', e);
          setMessages([INITIAL_MESSAGE]);
        }
      }
      setLoadingMessages(false);
    }
  }, [user]);

  const loadMessages = async () => {
    if (!user) return;

    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('message_id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedMessages = data.map(m => ({
          id: m.message_id,
          type: m.type,
          text: m.text,
          time: m.time
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([INITIAL_MESSAGE]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([INITIAL_MESSAGE]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const migrateLocalMessagesToSupabase = async () => {
    if (!user) return;

    try {
      // Check if user already has messages in Supabase
      const { data: existingData } = await supabase
        .from('messages')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      // If no data exists, migrate from localStorage
      if (!existingData || existingData.length === 0) {
        const localMessages = localStorage.getItem(STORAGE_KEY);
        if (localMessages) {
          const parsed = JSON.parse(localMessages);
          if (parsed && parsed.length > 0) {
            const messagesToInsert = parsed.map((msg, index) => ({
              user_id: user.id,
              message_id: msg.id || index + 1,
              type: msg.type,
              text: msg.text,
              time: msg.time
            }));

            const { error } = await supabase
              .from('messages')
              .insert(messagesToInsert);

            if (!error) {
              localStorage.removeItem(STORAGE_KEY);
              loadMessages();
            }
          }
        }
      }
    } catch (error) {
      console.error('Error migrating messages:', error);
    }
  };

  // Save messages to Supabase whenever messages change
  useEffect(() => {
    if (user && messages.length > 0 && !loadingMessages) {
      // Only save new messages, not on initial load
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.id !== 1) { // Skip initial message
        saveMessageToSupabase(lastMessage);
      }
    } else if (!user) {
      // Fallback to localStorage if not logged in
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, user, loadingMessages]);

  const saveMessageToSupabase = async (message) => {
    if (!user) return;

    try {
      // Check if message already exists
      const { data: existing } = await supabase
        .from('messages')
        .select('id')
        .eq('user_id', user.id)
        .eq('message_id', message.id)
        .maybeSingle();

      if (!existing) {
        // New message - insert to Supabase
        const { error } = await supabase
          .from('messages')
          .insert({
            user_id: user.id,
            message_id: message.id,
            type: message.type,
            text: message.text,
            time: message.time
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

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
      
      // Group by mood
      const expensesByMood = expenses.reduce((acc, t) => {
        if (t.mood) {
          acc[t.mood] = (acc[t.mood] || 0) + Math.abs(t.amount);
        }
        return acc;
      }, {});
      
      // Recent transactions with all details (last 15 for better context)
      const recentTransactions = transactions.slice(0, 15).map(t => ({
        date: t.date || 'no date',
        time: t.time || 'no time',
        description: t.description,
        amount: Math.abs(t.amount),
        type: t.type,
        category: t.category || 'none',
        mood: t.mood || 'none'
      }));
      
      // Calculate Analytics data (matching AnalyticsPage logic)
      // Get target and period from localStorage (set by AnalyticsPage)
      const savedTarget = localStorage.getItem('chatty_wallet_target');
      const savedPeriod = localStorage.getItem('chatty_wallet_period');
      const target = savedTarget ? parseFloat(savedTarget) : 5000; // Default 5000
      const period = savedPeriod || 'month'; // Default month
      
      const periodConfig = {
        week: { days: 7, label: '1 Week' },
        '2weeks': { days: 14, label: '2 Weeks' },
        '3weeks': { days: 21, label: '3 Weeks' },
        month: { days: 30, label: '1 Month' }
      };
      const daysInPeriod = periodConfig[period]?.days || 30;
      const spendingPercentage = target > 0 ? Math.round((totalExpenses / target) * 100) : 0;
      const saved = Math.max(0, target - totalExpenses);
      const dailyGoal = Math.round(target / daysInPeriod);
      
      // Group expenses by day for trend analysis
      const expensesByDay = {};
      expenses.forEach(expense => {
        if (expense.date) {
          const dayMatch = expense.date.match(/\d+/);
          if (dayMatch) {
            const day = parseInt(dayMatch[0]);
            if (!expensesByDay[day]) {
              expensesByDay[day] = 0;
            }
            expensesByDay[day] += Math.abs(expense.amount);
          }
        }
      });
      
      const spendingContext = {
        // Spending Summary
        totalBalance: balance,
        totalExpenses,
        totalIncomes,
        expensesByCategory,
        expensesByMood,
        itemCounts,
        
        // Detailed Spending Data
        allTransactions: transactions.map(t => ({
          date: t.date || 'no date',
          time: t.time || 'no time',
          description: t.description,
          amount: Math.abs(t.amount),
          type: t.type,
          category: t.category || 'none',
          mood: t.mood || 'none'
        })),
        recentTransactions,
        expensesByDay,
        
        // Analytics Data
        target,
        period,
        daysInPeriod,
        spendingPercentage,
        saved,
        dailyGoal,
        currentSpendingStatus: spendingPercentage <= 60 ? 'good' : spendingPercentage <= 80 ? 'warning' : 'critical'
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

📊 COMPLETE SPENDING & ANALYTICS DATA:

**Spending Summary:**
- Total Balance: $${balance.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Total Income: $${totalIncomes.toFixed(2)}
- Expenses by Category: ${JSON.stringify(expensesByCategory, null, 2)}
- Expenses by Mood: ${JSON.stringify(expensesByMood, null, 2)}
- Item Purchase Counts: ${JSON.stringify(itemCounts, null, 2)}

**Detailed Spending History (All Transactions):**
${JSON.stringify(spendingContext.allTransactions, null, 2)}

**Recent Transactions (Last 15):**
${JSON.stringify(spendingContext.recentTransactions, null, 2)}

**Daily Spending Pattern:**
${JSON.stringify(spendingContext.expensesByDay, null, 2)}

**Analytics & Goals:**
- Target Amount: $${target}
- Current Period: ${period} (${daysInPeriod} days)
- Spending Percentage: ${spendingPercentage}% of target
- Amount Spent: $${totalExpenses.toFixed(2)}
- Amount Left: $${saved.toFixed(2)}
- Daily Goal: $${dailyGoal}
- Current Status: ${spendingContext.currentSpendingStatus} (${spendingPercentage <= 60 ? 'Good - spending under control' : spendingPercentage <= 80 ? 'Warning - getting close to limit' : 'Critical - spending too much!'})

💬 Response Guidelines:
- CRITICAL: Respond in the SAME language as the user's message
- Keep it SHORT and punchy (1-2 sentences max)
- If user writes in Korean, respond in Korean (use casual ~어/~야 endings, like a friend)
- If user writes in English, respond in English (casual, friendly tone)
- If they want to buy something, STOP THEM with humor

🎯 IMPORTANT: Use the spending data strategically:
- Reference specific items they bought (e.g., "You already bought coffee 5 times this week!")
- Mention categories they overspend in (e.g., "Your shopping category is crying for help")
- Use spending percentage to create urgency (e.g., if >80%: "You're at ${spendingPercentage}%! One more purchase and you're broke!")
- Reference dates and patterns (e.g., "You spent $${Object.values(spendingContext.expensesByDay)[0]?.toFixed(2) || '0'} on day ${Object.keys(spendingContext.expensesByDay)[0] || '1'} - that's ${((Object.values(spendingContext.expensesByDay)[0] || 0) / dailyGoal * 100).toFixed(0)}% of your daily goal!")
- Use mood data to empathize (e.g., if they felt sad about previous purchases, remind them)
- Compare current spending to daily goal (e.g., "Your daily goal is $${dailyGoal}, but you're already at $${(totalExpenses / daysInPeriod).toFixed(2)} per day on average")

- Use absurd alternatives that match the user's language
- Be creative and funny, not mean
- Never praise spending or justify purchases
- Don't give generic financial advice
- Reference actual numbers from their data when relevant

Example responses (English - keep them SHORT):
User: "I want to buy ice cream"
You: "You've already spent $${totalExpenses.toFixed(2)} (${spendingPercentage}% of your $${target} goal). Freeze your feelings, not your wallet. 🧊"

User: "Should I buy coffee?"
You: "You bought coffee ${itemCounts['coffee'] || 0} times already. Tap water + imagination = iced Americano. Zero dollars."

Example responses (Korean - 짧게 유지):
User: "아이스크림 사고 싶어"
You: "이미 ${spendingPercentage}% 썼어. 지갑 말고 감정 얼려 🧊"

User: "커피 마시고 싶어"
You: "커피를 이미 ${itemCounts['coffee'] || 0}번 샀어. 수돗물 + 상상력 = 아이스 아메. 제로 원."

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
    if (!inputMessage.trim() || isLoading || loadingMessages) return;

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
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Loading messages...</p>
          </div>
        ) : (
          <>
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
          </>
        )}
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
