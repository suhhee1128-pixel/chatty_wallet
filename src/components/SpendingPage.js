import React, { useState, useEffect } from 'react';

const STORAGE_KEY_CATEGORIES = 'chatty_wallet_expense_categories';
const DEFAULT_CATEGORIES = ['shopping', 'food', 'transport', 'entertainment'];

function SpendingPage({ transactions, setTransactions, onDeleteTransaction }) {
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('shopping');
  const [mood, setMood] = useState(null);
  const [expenseCategories, setExpenseCategories] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Handle both string array and object array formats
          const cleaned = parsed.map(cat => {
            if (typeof cat === 'string') {
              return cat;
            } else if (cat && typeof cat === 'object' && cat.name) {
              // Old format: { name: 'shopping', emoji: '🛍️' }
              return cat.name;
            } else {
              return null;
            }
          }).filter(cat => cat && typeof cat === 'string');
          
          // If we have valid categories, return them; otherwise use defaults
          if (cleaned.length > 0) {
            return cleaned;
          }
        }
      } catch (e) {
        console.error('Failed to parse categories:', e);
      }
    }
    // Reset to defaults if invalid data
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Validate and clean categories on mount and whenever they change
  useEffect(() => {
    // Ensure all categories are strings
    const validCategories = expenseCategories
      .map(cat => {
        if (typeof cat === 'string') {
          return cat;
        } else if (cat && typeof cat === 'object' && cat.name && typeof cat.name === 'string') {
          return cat.name;
        }
        return null;
      })
      .filter(cat => cat && typeof cat === 'string' && cat !== '[object Object]');
    
    // If we have valid categories, use them; otherwise use defaults
    const categoriesToUse = validCategories.length > 0 ? validCategories : DEFAULT_CATEGORIES;
    
    // Only update if categories changed
    if (JSON.stringify(categoriesToUse) !== JSON.stringify(expenseCategories)) {
      setExpenseCategories(categoriesToUse);
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categoriesToUse));
    
    // Update selected category if needed
    if (!categoriesToUse.includes(category)) {
      setCategory(categoriesToUse[0] || 'shopping');
    }
  }, [expenseCategories, category]);
  
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

  const handleAddTransaction = async () => {
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
      category: transactionType === 'income' ? 'income' : category,
      mood: transactionType === 'expense' ? mood : null
    };
    
    // Update local state immediately
    setTransactions([newTransaction, ...transactions]);
    setShowModal(false);
    setDescription('');
    setAmount('');
    setCategory(expenseCategories[0] || 'shopping');
    setMood(null);
  };

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim().toLowerCase();
    if (!trimmedName || expenseCategories.includes(trimmedName)) return;
    setExpenseCategories([...expenseCategories, trimmedName]);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (catToDelete) => {
    if (expenseCategories.length <= 1) return; // Keep at least one category
    setExpenseCategories(expenseCategories.filter(cat => cat !== catToDelete));
    if (category === catToDelete) {
      setCategory(expenseCategories.filter(cat => cat !== catToDelete)[0]);
    }
  };

  const handleEditCategory = (oldCat, newCat) => {
    const trimmedNew = newCat.trim().toLowerCase();
    if (!trimmedNew || (trimmedNew !== oldCat && expenseCategories.includes(trimmedNew))) return;
    
    // Update category in transactions
    const updatedTransactions = transactions.map(t => 
      t.category === oldCat ? { ...t, category: trimmedNew } : t
    );
    setTransactions(updatedTransactions);
    
    // Update categories list
    setExpenseCategories(expenseCategories.map(cat => cat === oldCat ? trimmedNew : cat));
    if (category === oldCat) {
      setCategory(trimmedNew);
    }
    setEditingCategory(null);
  };

  // Calculate earnings from transactions
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
          <h1 className="text-xl font-normal text-black mb-2">
            {(() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              return `${year}/${month}/${day}`;
            })()}
          </h1>
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
                onClick={() => {
                  if (onDeleteTransaction) {
                    onDeleteTransaction(transaction.id);
                  } else {
                    setTransactions(transactions.filter(t => t.id !== transaction.id));
                  }
                }}
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
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-black">{transaction.description}</h3>
                    {transaction.mood && (
                      <span className="text-lg">{transaction.mood === 'happy' ? '🙂' : transaction.mood === 'neutral' ? '😐' : '🫠'}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {transaction.type === 'expense' ? 'Expense' : 'Income'} / {String(transaction.category).charAt(0).toUpperCase() + String(transaction.category).slice(1)}
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
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-black opacity-60 block">Category</label>
                      <button
                        onClick={() => setShowCategoryModal(true)}
                        className="text-xs text-black opacity-60 hover:opacity-100 underline"
                      >
                        Manage Categories
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(Array.isArray(expenseCategories) && expenseCategories.length > 0 
                        ? expenseCategories 
                        : DEFAULT_CATEGORIES)
                        .filter(cat => {
                          // Filter out invalid categories
                          if (!cat) return false;
                          if (typeof cat === 'string') return true;
                          if (cat && typeof cat === 'object' && cat.name) return true;
                          return false;
                        })
                        .map((cat) => {
                          // Extract string name from category
                          let catName = 'shopping';
                          if (typeof cat === 'string') {
                            catName = cat;
                          } else if (cat && typeof cat === 'object' && cat.name && typeof cat.name === 'string') {
                            catName = cat.name;
                          } else {
                            catName = String(cat);
                          }
                          
                          // Skip if invalid
                          if (!catName || catName === '[object Object]' || catName === 'null' || catName === 'undefined') {
                            return null;
                          }
                          
                          return (
                            <button
                              key={catName}
                              onClick={() => setCategory(catName)}
                              className={`py-3 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 ${
                                category === catName
                                  ? 'bg-black text-white'
                                  : 'bg-gray-100 text-black hover:bg-gray-200'
                              }`}
                            >
                              {getCategoryIcon(catName)}
                              {catName.charAt(0).toUpperCase() + catName.slice(1)}
                            </button>
                          );
                        })
                        .filter(Boolean)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-black opacity-60 mb-2 block">How do you feel?</label>
                    <div className="flex gap-3">
                      {[
                        { emoji: '🙂', value: 'happy' },
                        { emoji: '😐', value: 'neutral' },
                        { emoji: '🫠', value: 'sad' }
                      ].map((m) => (
                        <button
                          key={m.value}
                          onClick={() => setMood(m.value)}
                          className={`flex-1 py-4 rounded-lg font-medium text-2xl transition ${
                            mood === m.value
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-black hover:bg-gray-200'
                          }`}
                        >
                          {m.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
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

      {/* Category Management Modal */}
      {showCategoryModal && (
        <>
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-[100]"
            onClick={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
              setNewCategoryName('');
            }}
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          ></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg p-6 z-[101] max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-medium text-black mb-4">Manage Categories</h3>
            <div className="space-y-4">
              {/* Add New Category */}
              <div>
                <label className="text-sm text-black opacity-60 mb-2 block">Add New Category</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-black placeholder-gray-400 border-none outline-none text-base"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim() || expenseCategories.includes(newCategoryName.trim().toLowerCase())}
                    className="bg-black text-white px-6 py-3 rounded-lg font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Category List */}
              <div>
                <label className="text-sm text-black opacity-60 mb-2 block">Categories</label>
                <div className="space-y-2">
                  {expenseCategories
                    .filter(cat => cat && typeof cat === 'string')
                    .map((cat) => {
                      const catName = typeof cat === 'string' ? cat : (cat?.name || 'shopping');
                      return (
                        <div key={catName} className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                          {editingCategory === catName ? (
                            <>
                              <input
                                type="text"
                                defaultValue={catName}
                                onBlur={(e) => handleEditCategory(catName, e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleEditCategory(catName, e.target.value);
                                  } else if (e.key === 'Escape') {
                                    setEditingCategory(null);
                                  }
                                }}
                                autoFocus
                                className="flex-1 bg-white rounded px-3 py-2 text-black outline-none text-sm"
                              />
                              <button
                                onClick={() => setEditingCategory(null)}
                                className="text-gray-500 hover:text-black px-2"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1 flex items-center gap-2">
                                {getCategoryIcon(catName)}
                                <span className="text-base text-black">{catName.charAt(0).toUpperCase() + catName.slice(1)}</span>
                              </div>
                              <button
                                onClick={() => setEditingCategory(catName)}
                                className="text-gray-500 hover:text-black px-2"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(catName)}
                                disabled={expenseCategories.filter(c => c && typeof c === 'string').length <= 1}
                                className="text-gray-500 hover:text-red-500 px-2 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setNewCategoryName('');
                }}
                className="w-full bg-gray-200 text-black py-4 rounded-lg font-medium text-base"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SpendingPage;

