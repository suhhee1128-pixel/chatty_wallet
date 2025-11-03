import React from 'react';

function AnalyticsPage() {
  // Data configuration
  const saved = 1625;
  const target = 5000;
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

  return (
    <div className="p-6 pb-24 min-h-screen">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-black">Details</h1>
      </div>
      
      {/* Progress Section */}
      <div className="mb-4">
        <div className="relative flex justify-center items-end mb-2" style={{ height: '220px' }}>
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
              stroke="#3b82f6"
              strokeWidth="28"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 4.71} 471`}
            />
          </svg>
          
          <div className="absolute bottom-2 text-center">
            <p className="text-xs text-gray-500 mb-1">${saved} Saved</p>
            <p className="text-5xl font-bold text-black mb-1">{percentage}%</p>
            <p className="text-sm text-gray-500">Target • ${target}</p>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500" style={{ width: '340px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
          <div className="text-left">
            <p className="font-semibold text-black">24 Apr</p>
            <p>Start</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-black">24 Jun</p>
            <p>End</p>
          </div>
        </div>
      </div>
      
      {/* Activity Section */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Activity</h2>
          <select className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
            <option>month</option>
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
    </div>
  );
}

export default AnalyticsPage;
