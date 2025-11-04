import React, { useState, useEffect } from 'react';

function AnalyticsPage({ transactions = [] }) {
  // State for target goal and period
  const [target, setTarget] = useState(() => {
    const saved = localStorage.getItem('chatty_wallet_target');
    return saved ? parseFloat(saved) : 5000;
  });
  const [showModal, setShowModal] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [period, setPeriod] = useState(() => {
    const saved = localStorage.getItem('chatty_wallet_period');
    return saved || 'month';
  }); // 'week', '2weeks', '3weeks', 'month'
  
  // Period configuration
  const periodConfig = {
    week: { days: 7, label: '1 Week' },
    '2weeks': { days: 14, label: '2 Weeks' },
    '3weeks': { days: 21, label: '3 Weeks' },
    month: { days: 30, label: '1 Month' }
  };
  
  const currentPeriod = periodConfig[period];
  const daysInPeriod = currentPeriod.days;
  
  // Calculate actual data from transactions
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const saved = Math.max(0, target - totalExpenses);
  // Calculate spending percentage (지출 기준)
  const spendingPercentage = target > 0 ? Math.round((totalExpenses / target) * 100) : 0;
  const savedPercentage = target > 0 ? Math.round((saved / target) * 100) : 0;
  
  // Calculate progress bar color based on spending percentage
  // spendingPercentage = 지출한 금액 비율 (높을수록 많이 씀 = 나쁨)
  // 0-60%: Green (점점 진해지는 초록) - 적게 쓸 때
  // 60-80%: Yellow to Orange (노란색에서 주황색으로)
  // 80-100%: Orange to Red (점점 빨갛게, 100%가 제일 빨강) - 많이 쓸 때
  const getProgressColor = (spentPct) => {
    // Clamp percentage between 0 and 100
    const p = Math.max(0, Math.min(100, spentPct));
    
    if (p <= 60) {
      // 0-60%: Light green to dark green (점점 진해지는 초록) - 적게 쓸 때
      // 0%에서 밝은 초록(#90EE90), 60%에서 진한 초록(#00CC00)
      const ratio = p / 60; // 0 at 0%, 1 at 60%
      const r = Math.round(144 - (144 * ratio));   // 144 → 0
      const g = Math.round(238 - (34 * ratio));     // 238 → 204
      const b = Math.round(144 - (144 * ratio));    // 144 → 0
      return `rgb(${r}, ${g}, ${b})`;
    } else if (p <= 80) {
      // 60-80%: Yellow to orange (노란색에서 주황색으로)
      // 60%에서 노란색(#FFFF00), 80%에서 주황색(#FFA500)
      const ratio = (p - 60) / 20; // 0 at 60%, 1 at 80%
      const r = 255;
      const g = Math.round(255 - (90 * ratio));    // 255 → 165
      const b = 0;
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // 80-100%: Orange to red (점점 빨갛게, 100%가 제일 빨강) - 많이 쓸 때
      // 80%에서 주황색(#FFA500), 100%에서 빨강(#FF0000)
      const ratio = (p - 80) / 20; // 0 at 80%, 1 at 100%
      const r = 255;
      const g = Math.round(165 - (165 * ratio));    // 165 → 0
      const b = 0;
      return `rgb(${r}, ${g}, ${b})`;
    }
  };
  
  const progressColor = getProgressColor(spendingPercentage);
  
  // Calculate daily spending from transactions
  const dailyGoal = Math.round(target / daysInPeriod);
  const today = new Date();
  const currentDay = today.getDate();
  
  // Group expenses by day
  const expensesByDay = {};
  expenses.forEach(expense => {
    if (expense.date) {
      // Parse date from format like "Nov 4" or extract day number
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
  
  // Activity data based on actual spending
  const activityData = {};
  for (let i = 1; i <= daysInPeriod; i++) {
    const daySpending = expensesByDay[i] || 0;
    if (i > currentDay) {
      activityData[i] = 'future';
    } else if (daySpending > dailyGoal) {
      activityData[i] = 'exceeded';
    } else if (daySpending > 0) {
      activityData[i] = 'good';
    } else {
      activityData[i] = 'good'; // No spending is also good
    }
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Helper functions
  const getColorClass = (day) => {
    const level = activityData[day];
    switch(level) {
      case 'future': return 'bg-[#F7F3F1]';
      case 'exceeded': return 'bg-[#F35DC8]';
      case 'good': return 'bg-[#A4F982]';
      default: return 'bg-gray-200';
    }
  };
  
  const getTextColor = (day) => {
    const level = activityData[day];
    return level === 'future' ? 'text-gray-400' : 'text-black';
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 1; i <= daysInPeriod; i++) {
      days.push(
        <div key={i} className="flex flex-col items-center justify-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorClass(i)} transition-all hover:scale-110`}>
            <span className={`text-sm font-medium ${getTextColor(i)}`}>{i}</span>
          </div>
        </div>
      );
    }
    return days;
  };
  
  // Calculate start and end dates based on period
  const getDateRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(1); // Start of month
    
    const endDate = new Date(today);
    endDate.setDate(daysInPeriod);
    
    const formatDate = (date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    };
    
    return {
      start: formatDate(startDate),
      end: formatDate(endDate)
    };
  };
  
  const dateRange = getDateRange();

  const handleSetTarget = () => {
    const newTarget = parseFloat(targetInput);
    if (newTarget && newTarget > 0) {
      setTarget(newTarget);
      // Save to localStorage for ChatPage to access
      localStorage.setItem('chatty_wallet_target', newTarget.toString());
      setShowModal(false);
      setTargetInput('');
    }
  };
  
  // Save target and period to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatty_wallet_target', target.toString());
    localStorage.setItem('chatty_wallet_period', period);
  }, [target, period]);

  return (
    <div className="p-6 pb-24 min-h-screen">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Details</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      
      {/* Progress Section */}
      <div className="mb-4">
        <div className="relative flex justify-center items-end mb-2" style={{ height: '160px' }}>
          <svg width="340" height="180" viewBox="0 0 340 180" className="absolute bottom-0">
            <path
              d="M 20 180 A 150 150 0 0 1 320 180"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <path
              d="M 20 180 A 150 150 0 0 1 320 180"
              fill="none"
              stroke={progressColor}
              strokeWidth="28"
              strokeLinecap="round"
              strokeDasharray={`${spendingPercentage * 4.71} 471`}
            />
          </svg>
          
          <div className="absolute bottom-2 text-center">
            <p className="text-xs text-gray-500 mb-1">${totalExpenses.toFixed(2)} Spent</p>
            <p className="text-5xl font-bold text-black mb-1">{spendingPercentage}%</p>
            <p className="text-sm text-gray-500">Target • ${target}</p>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500" style={{ width: '340px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px', boxSizing: 'border-box' }}>
          <div>
            <p className="font-semibold text-black">{dateRange.start}</p>
            <p>Start</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="font-semibold text-black">{dateRange.end}</p>
            <p>End</p>
          </div>
        </div>
      </div>
      
      {/* Activity Section */}
      <div className="bg-white rounded-lg p-6 -mx-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Tracker</h2>
            <p className="text-sm text-gray-600 mt-1">Daily Goal: ${dailyGoal}</p>
          </div>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-black text-white rounded-full text-sm font-medium" 
            style={{ paddingLeft: '16px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: 'none', outline: 'none' }}
          >
            <option value="week">1 Week</option>
            <option value="2weeks">2 Weeks</option>
            <option value="3weeks">3 Weeks</option>
            <option value="month">1 Month</option>
          </select>
        </div>
        
        <div className="grid grid-cols-7 gap-3 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-3 mb-6">
          {renderCalendar()}
        </div>
        
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#F35DC8]"></div>
            <span className="text-gray-700 font-medium">Over Budget</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#A4F982]"></div>
            <span className="text-gray-700 font-medium">On Budget</span>
          </div>
        </div>
      </div>

      {/* Mood Statistics Section */}
      <div className="bg-white rounded-lg p-6 -mx-6">
        <h2 className="text-2xl font-bold text-black mb-6">Mood Statistics</h2>
        
        {(() => {
          const expenses = transactions.filter(t => t.type === 'expense' && t.mood);
          const moodStats = {
            happy: { count: 0, total: 0, emoji: '🙂' },
            neutral: { count: 0, total: 0, emoji: '😐' },
            sad: { count: 0, total: 0, emoji: '🫠' }
          };
          
          expenses.forEach(expense => {
            if (expense.mood && moodStats[expense.mood]) {
              moodStats[expense.mood].count++;
              moodStats[expense.mood].total += Math.abs(expense.amount);
            }
          });
          
          const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
          const totalCount = expenses.length;
          
          return (
            <div className="space-y-4">
              {Object.entries(moodStats).map(([moodKey, stats]) => {
                const percentage = totalCount > 0 ? Math.round((stats.count / totalCount) * 100) : 0;
                const amountPercentage = totalExpenses > 0 ? Math.round((stats.total / totalExpenses) * 100) : 0;
                
                return (
                  <div key={moodKey} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{stats.emoji}</span>
                        <div>
                          <p className="text-base font-semibold text-black capitalize">{moodKey}</p>
                          <p className="text-xs text-gray-500">{stats.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-black">${stats.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{amountPercentage}% of total</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-black rounded-full h-2 transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              {totalCount === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No mood data yet. Add expenses with mood to see statistics.
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Target Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 mx-4">
            <h2 className="text-xl font-bold text-black mb-4">Set Target Goal</h2>
            <p className="text-sm text-gray-600 mb-4">Enter your savings goal and period</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                <option value="week">1 Week</option>
                <option value="2weeks">2 Weeks</option>
                <option value="3weeks">3 Weeks</option>
                <option value="month">1 Month</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount ($)
              </label>
              <input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="5000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              {targetInput && !isNaN(parseFloat(targetInput)) && (
                <p className="text-xs text-gray-500 mt-1">
                  Daily Goal: ${Math.round(parseFloat(targetInput) / daysInPeriod)}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTargetInput('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetTarget}
                className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
