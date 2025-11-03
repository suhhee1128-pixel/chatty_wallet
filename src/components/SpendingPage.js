import React, { useState, useEffect } from 'react';

function SpendingPage({ transactions, setTransactions }) {
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('shopping');
  
  const expenseCategories = ['shopping', 'food', 'transport', 'entertainment'];

  useEffect(() => {
    if (showModal) {
      const phoneContent = document.querySelector('.phone-content');
      if (phoneContent) {
        phoneContent.style.overflow = 'hidden';
      }
    } else {
      const phoneContent = document.querySelector('.phone-content');
      if (phoneContent) {
        phoneContent.style.overflow = 'auto';
      }
    }
  }, [showModal]);

  const handleAddTransaction = () => {
    if (!description.trim() || !amount.trim() || parseFloat(amount) <= 0) return;
    
    const newTransaction = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
      description: description.trim(),
      amount: transactionType === 'income' ? parseFloat(amount) : -parseFloat(amount),
      type: transactionType,
      category: transactionType === 'income' ? 'income' : category
    };
    
    setTransactions([newTransaction, ...transactions]);
    setShowModal(false);
    setDescription('');
    setAmount('');
    setCategory('shopping');
  };

  // Calculate balance and earnings from transactions
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
  const earnings = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const balanceDisplay = Math.abs(balance).toFixed(2);
  const balanceDollars = balanceDisplay.split('.')[0];
  const balanceCents = balanceDisplay.split('.')[1];

  return (
    <div className="relative h-full">
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-normal text-black mb-2">Spending</h1>
        </div>
        
        {/* Main Amount Display */}
        <div className="mb-4">
          <div className="text-7xl font-bold text-black tracking-tight">
            ${balanceDollars}<span className="text-5xl">.{balanceCents}</span>
          </div>
        </div>
        
        {/* Earnings */}
        <div className="mb-6">
          <p className="text-base text-black">
            earnings: <span className="font-medium">${earnings.toFixed(2)}</span>
          </p>
        </div>
        
        {/* Income/Expense Buttons */}
        <div className="flex gap-3 mb-8">
          <button 
            className="btn-primary flex-1 py-4 rounded-2xl font-medium text-base"
            onClick={() => {
              setTransactionType('income');
              setShowModal(true);
            }}
          >
            Income
          </button>
          <button 
            className="btn-outline flex-1 py-4 rounded-2xl font-medium text-base"
            onClick={() => {
              setTransactionType('expense');
              setShowModal(true);
            }}
          >
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
            <div key={transaction.id} className="transaction-item flex justify-between items-center py-4 px-2 rounded-lg group">
              <div className="flex-1">
                {transaction.date && (
                  <p className="text-xs text-black mb-1">{transaction.date}</p>
                )}
                <p className="text-lg text-black">{transaction.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className={`text-lg font-bold ${transaction.type === 'expense' ? 'amount-red' : 'amount-green'}`}>
                  {Math.abs(transaction.amount)}$
                </p>
                <button
                  onClick={() => setTransactions(transactions.filter(t => t.id !== transaction.id))}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <>
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-[100]"
            onClick={() => setShowModal(false)}
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          ></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[101]">
            <h3 className="text-xl font-medium text-black mb-4">Add {transactionType === 'income' ? 'Income' : 'Expense'}</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-100 rounded-2xl px-4 py-4 text-black placeholder-gray-400 border-none outline-none text-base"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-100 rounded-2xl px-4 py-4 text-black placeholder-gray-400 border-none outline-none text-base"
                  min="0"
                  step="0.01"
                />
              </div>
              {transactionType === 'expense' && (
                <div>
                  <label className="text-sm text-black opacity-60 mb-2 block">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {expenseCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`py-3 rounded-2xl font-medium text-base transition ${
                          category === cat
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-black py-4 rounded-2xl font-medium text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTransaction}
                  disabled={!description.trim() || !amount.trim() || parseFloat(amount) <= 0}
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SpendingPage;

