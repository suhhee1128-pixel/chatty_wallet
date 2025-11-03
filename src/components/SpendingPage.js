import React from 'react';

function SpendingPage() {
  const transactions = [
    { id: 1, date: '10/31', description: 'shopping', amount: -40, type: 'expense' },
    { id: 2, date: '10/30', description: 'shopping', amount: -40, type: 'expense' },
    { id: 3, date: '', description: 'allowance', amount: 40, type: 'income' },
    { id: 4, date: '', description: 'shopping', amount: -40, type: 'expense' },
    { id: 5, date: '', description: 'shopping', amount: -40, type: 'expense' },
  ];

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-normal text-black mb-2">Spending</h1>
      </div>
      
      {/* Main Amount Display */}
      <div className="mb-4">
        <div className="text-7xl font-bold text-black tracking-tight">
          $380<span className="text-5xl">.45</span>
        </div>
      </div>
      
      {/* Earnings */}
      <div className="mb-6">
        <p className="text-base text-black">
          earnings: <span className="font-medium">$914.24</span>
        </p>
      </div>
      
      {/* Income/Expense Buttons */}
      <div className="flex gap-3 mb-8">
        <button className="btn-primary flex-1 py-4 rounded-2xl font-medium text-base">
          Income
        </button>
        <button className="btn-outline flex-1 py-4 rounded-2xl font-medium text-base">
          Expense
        </button>
      </div>
      
      {/* Card Placeholders */}
      <div className="flex gap-3 mb-8">
        <div className="card-placeholder w-28 h-28 flex items-center justify-center"></div>
        <div className="card-placeholder w-28 h-28 flex items-center justify-center"></div>
        <div className="card-placeholder w-28 h-28 flex items-center justify-center"></div>
      </div>
      
      {/* Daily Section */}
      <div className="mb-4">
        <h2 className="text-xl font-medium text-black">Daily</h2>
      </div>
      
      {/* Transaction List */}
      <div className="space-y-1">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="transaction-item flex justify-between items-center py-4 px-2 rounded-lg">
            <div>
              {transaction.date && (
                <p className="text-xs text-black mb-1">{transaction.date}</p>
              )}
              <p className="text-lg text-black">{transaction.description}</p>
            </div>
            <p className={`text-lg font-bold ${transaction.type === 'expense' ? 'amount-red' : 'amount-green'}`}>
              {Math.abs(transaction.amount)}$
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpendingPage;

