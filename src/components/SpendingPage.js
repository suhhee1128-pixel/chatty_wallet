import React, { useState, useEffect } from 'react';

function SpendingPage({ transactions, setTransactions }) {
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('shopping');
  
  const expenseCategories = ['shopping', 'food', 'transport', 'entertainment'];
  
  const getCategoryIcon = (category) => {
    const icons = {
      shopping: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      ),
      food: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      ),
      transport: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      ),
      entertainment: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="10 8 16 12 10 16 10 8"></polygon>
        </svg>
      )
    };
    return icons[category] || null;
  };

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
    
    const now = new Date();
    const newTransaction = {
      id: Date.now(),
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'short' }),
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
  
  // Calculate total expenses only
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const balanceDisplay = totalExpenses.toFixed(2);
  const balanceDollars = balanceDisplay.split('.')[0];
  const balanceCents = balanceDisplay.split('.')[1];

  return (
    <div className="relative h-full">
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          {/* Icon */}
          <div className="mb-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
          </div>
          <h1 className="text-xl font-normal text-black mb-2">2025/11/04</h1>
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
        <div className="flex gap-3 mb-6">
          <button 
            className="income-button rounded-lg font-bold text-base flex items-center justify-center gap-2"
            style={{ 
              width: '169px', 
              height: '50px',
              background: '#A4F982',
              color: '#000000',
              border: 'none'
            }}
            onClick={() => {
              setTransactionType('income');
              setShowModal(true);
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L12 6M12 18L12 22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12L6 12M18 12L22 12M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" 
                    stroke="#000000" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            INCOME
          </button>
          <button 
            className="expense-button rounded-lg font-bold text-base flex items-center justify-center gap-2"
            style={{ 
              width: '169px', 
              height: '50px',
              background: '#F35DC8',
              color: '#000000',
              border: 'none'
            }}
            onClick={() => {
              setTransactionType('expense');
              setShowModal(true);
            }}
          >
            <span style={{ fontSize: '24px', color: '#000000', fontWeight: 'bold', lineHeight: '1' }}>-</span>
            EXPENSE
          </button>
        </div>
        
        {/* Transaction List */}
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="transaction-card group"
              style={{
                background: '#F8F8F8',
                borderRadius: '16px',
                padding: '16px',
                position: 'relative'
              }}
            >
              {/* Delete button - center right */}
              <button
                onClick={() => setTransactions(transactions.filter(t => t.id !== transaction.id))}
                className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>

              <div className="flex justify-between items-start">
                {/* Left: Title and Category */}
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-base font-semibold text-black mb-1">{transaction.description}</h3>
                  <p className="text-xs text-gray-500">
                    {transaction.type === 'expense' ? 'Expense' : 'Income'} / {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                  </p>
                </div>

                {/* Right: Amount and Date/Time */}
                <div className="flex flex-col items-end">
                  <p className={`text-base font-bold mb-1 ${transaction.type === 'expense' ? 'amount-red' : 'amount-green'}`}>
                    ${Math.abs(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {transaction.time || '00:00'} {transaction.date || 'Jan 1'}
                  </p>
                </div>
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
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg p-6 z-[101]">
            <h3 className="text-xl font-medium text-black mb-4">Add {transactionType === 'income' ? 'Income' : 'Expense'}</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-4 py-4 text-black placeholder-gray-400 border-none outline-none text-base"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-4 py-4 text-black placeholder-gray-400 border-none outline-none text-base"
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
                        className={`py-3 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 ${
                          category === cat
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        {getCategoryIcon(cat)}
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-black py-4 rounded-lg font-medium text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTransaction}
                  disabled={!description.trim() || !amount.trim() || parseFloat(amount) <= 0}
                  className="flex-1 bg-black text-white py-4 rounded-lg font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
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

