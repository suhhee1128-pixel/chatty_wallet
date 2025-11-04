import React, { useState } from 'react';

function AnalyticsPage() {
  // State for target goal
  const [target, setTarget] = useState(5000);
  const [showModal, setShowModal] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  
  // Data configuration
  const saved = 1625;
  const percentage = Math.round((saved / target) * 100);
  const currentDay = 17;
  
  // Activity data - spending levels per day
  const activityData = {
    1: 'good', 2: 'good', 3: 'good', 4: 'exceeded', 5: 'exceeded',
    6: 'good', 7: 'good', 8: 'good', 9: 'good', 10: 'good', 11: 'good', 12: 'good',
    13: 'exceeded', 14: 'exceeded', 15: 'good', 16: 'good', 17: 'good'
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Helper functions
  const getColorClass = (day) => {
    if (day > currentDay) return 'bg-[#F7F3F1]';
    const level = activityData[day];
    switch(level) {
      case 'exceeded': return 'bg-[#F35DC8]';
      case 'good': return 'bg-[#A4F982]';
      default: return 'bg-gray-200';
    }
  };
  
  const getTextColor = (day) => {
    return day > currentDay ? 'text-gray-400' : 'text-black';
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 1; i <= 30; i++) {
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

  const handleSetTarget = () => {
    const newTarget = parseFloat(targetInput);
    if (newTarget && newTarget > 0) {
      setTarget(newTarget);
      setShowModal(false);
      setTargetInput('');
    }
  };

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
              stroke="#A4F982"
              strokeWidth="28"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 4.71} 471`}
            />
          </svg>
          
          <div className="absolute bottom-2 text-center">
            <p className="text-xs text-gray-500 mb-1">${saved} Left</p>
            <p className="text-5xl font-bold text-black mb-1">{percentage}%</p>
            <p className="text-sm text-gray-500">Target • ${target}</p>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500" style={{ width: '340px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px', boxSizing: 'border-box' }}>
          <div>
            <p className="font-semibold text-black">24 Apr</p>
            <p>Start</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="font-semibold text-black">24 Jun</p>
            <p>End</p>
          </div>
        </div>
      </div>
      
      {/* Activity Section */}
      <div className="bg-white rounded-lg p-6 -mx-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Tracker</h2>
            <p className="text-sm text-gray-600 mt-1">Daily Goal: ${Math.round(target / 30)}</p>
          </div>
          <select className="bg-black text-white rounded-full text-sm font-medium" style={{ paddingLeft: '16px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: 'none', outline: 'none' }}>
            <option>June</option>
            <option>week</option>
            <option>year</option>
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

      {/* Target Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 mx-4">
            <h2 className="text-xl font-bold text-black mb-4">Set Target Goal</h2>
            <p className="text-sm text-gray-600 mb-4">Enter your savings goal for this month</p>
            
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
