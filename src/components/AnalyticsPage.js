import React from 'react';

function AnalyticsPage() {
  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-normal text-black mb-2">Analytics</h1>
      </div>
      
      {/* Monthly Overview */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
          <h3 className="text-base text-black opacity-60 mb-2">This Month</h3>
          <p className="text-5xl font-bold text-black mb-4">$380.45</p>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-black opacity-60">Income</p>
              <p className="text-xl font-medium text-green-500">$914.24</p>
            </div>
            <div className="text-right">
              <p className="text-black opacity-60">Expenses</p>
              <p className="text-xl font-medium text-red-500">$533.79</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="mb-6">
        <h2 className="text-xl font-medium text-black mb-4">Categories</h2>
        
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg text-black">Shopping</span>
              <span className="text-lg font-bold text-black">$160</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-400 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg text-black">Food</span>
              <span className="text-lg font-bold text-black">$120</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-400 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg text-black">Transport</span>
              <span className="text-lg font-bold text-black">$80</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg text-black">Entertainment</span>
              <span className="text-lg font-bold text-black">$60</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{ width: '22%' }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Insights */}
      <div className="mb-6">
        <h2 className="text-xl font-medium text-black mb-4">Insights</h2>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
          <p className="text-base text-black">
            You're spending 40% more on shopping this month. Catty suggests setting a weekly budget! 💡
          </p>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;

