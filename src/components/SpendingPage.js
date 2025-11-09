import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadUserSettings, saveUserSettings, migrateSettingsFromLocalStorage } from '../lib/userSettings';
import { supabase } from '../lib/supabase';

const STORAGE_KEY_CATEGORIES = 'chatty_wallet_expense_categories';
const DEFAULT_CATEGORIES = ['shopping', 'food', 'transport', 'entertainment'];

function SpendingPage({ transactions, setTransactions, onDeleteTransaction }) {
  const { user } = useAuth();
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('shopping');
  const [mood, setMood] = useState(null);
  const [summaryPeriod, setSummaryPeriod] = useState('day');
  const [showSummaryMenu, setShowSummaryMenu] = useState(false);
  const summaryMenuRef = useRef(null);
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
    
    // Save to localStorage only if not logged in (fallback)
    if (!user) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categoriesToUse));
    }
    
    // Update selected category if needed
    if (!categoriesToUse.includes(category)) {
      setCategory(categoriesToUse[0] || 'shopping');
    }
  }, [expenseCategories, category, user]);

  // Load categories from Supabase on mount
  useEffect(() => {
    const loadCategories = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_categories')
            .select('category_name')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
            const categories = data.map(c => c.category_name);
            // Merge with default categories, removing duplicates
            const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])];
            setExpenseCategories(allCategories);
          } else {
            // No custom categories, use defaults
            setExpenseCategories(DEFAULT_CATEGORIES);
          }
        } catch (error) {
          console.error('Error loading categories:', error);
          // Fallback to localStorage
          const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setExpenseCategories(parsed);
              }
            } catch (e) {
              setExpenseCategories(DEFAULT_CATEGORIES);
            }
          }
        }
      }
    };
    
    loadCategories();
  }, [user]);

  // Load summaryPeriod from Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        // Migrate from localStorage first
        await migrateSettingsFromLocalStorage(user.id);
        
        // Load from Supabase
        const settings = await loadUserSettings(user.id);
        if (settings && settings.spending_summary_period) {
          setSummaryPeriod(settings.spending_summary_period);
        }
        setLoadingSettings(false);
      } else {
        // Fallback to localStorage if not logged in
        const saved = localStorage.getItem('chatty_wallet_summary_period');
        if (saved) setSummaryPeriod(saved);
        setLoadingSettings(false);
      }
    };
    
    loadSettings();
  }, [user]);

  // Save summaryPeriod to Supabase whenever it changes
  useEffect(() => {
    if (loadingSettings) return; // Don't save during initial load
    
    const saveSettings = async () => {
      if (user) {
        await saveUserSettings(user.id, {
          spending_summary_period: summaryPeriod
        });
      } else {
        // Fallback to localStorage if not logged in
        localStorage.setItem('chatty_wallet_summary_period', summaryPeriod);
      }
    };
    
    saveSettings();
  }, [summaryPeriod, user, loadingSettings]);

  useEffect(() => {
    if (!showSummaryMenu) return;
    const handleClickOutside = (event) => {
      if (summaryMenuRef.current && !summaryMenuRef.current.contains(event.target)) {
        setShowSummaryMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSummaryMenu]);

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
      mood: transactionType === 'expense' ? mood : null,
      notes: notes.trim() || null
    };
    
    // Update local state immediately
    setTransactions([newTransaction, ...transactions]);
    setShowModal(false);
    setDescription('');
    setAmount('');
    setNotes('');
    setCategory(expenseCategories[0] || 'shopping');
    setMood(null);
  };

  const handleAddCategory = async () => {
    const trimmedName = newCategoryName.trim().toLowerCase();
    if (!trimmedName || expenseCategories.includes(trimmedName)) return;
    
    // Update local state
    setExpenseCategories([...expenseCategories, trimmedName]);
    setNewCategoryName('');
    
    // Save to Supabase if logged in
    if (user) {
      try {
        // Check if category already exists (might be a default category)
        const { data: existing } = await supabase
          .from('user_categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('category_name', trimmedName)
          .maybeSingle();
        
        if (!existing) {
          // Only insert if it's not a default category (defaults are not in DB)
          if (!DEFAULT_CATEGORIES.includes(trimmedName)) {
            const { error } = await supabase
              .from('user_categories')
              .insert({
                user_id: user.id,
                category_name: trimmedName
              });
            
            if (error) throw error;
          }
        }
      } catch (error) {
        console.error('Error saving category to Supabase:', error);
        // Fallback to localStorage
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([...expenseCategories, trimmedName]));
      }
    } else {
      // Fallback to localStorage if not logged in
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([...expenseCategories, trimmedName]));
    }
  };

  const handleDeleteCategory = async (catToDelete) => {
    if (expenseCategories.length <= 1) return; // Keep at least one category
    
    // Don't allow deleting default categories
    if (DEFAULT_CATEGORIES.includes(catToDelete)) {
      alert('Default categories cannot be deleted.');
      return;
    }
    
    // Update local state
    const newCategories = expenseCategories.filter(cat => cat !== catToDelete);
    setExpenseCategories(newCategories);
    if (category === catToDelete) {
      setCategory(newCategories[0]);
    }
    
    // Delete from Supabase if logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('user_categories')
          .delete()
          .eq('user_id', user.id)
          .eq('category_name', catToDelete);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting category from Supabase:', error);
        // Fallback to localStorage
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(newCategories));
      }
    } else {
      // Fallback to localStorage if not logged in
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(newCategories));
    }
  };

  const handleEditCategory = async (oldCat, newCat) => {
    const trimmedNew = newCat.trim().toLowerCase();
    if (!trimmedNew || (trimmedNew !== oldCat && expenseCategories.includes(trimmedNew))) return;
    
    // Don't allow editing default categories
    if (DEFAULT_CATEGORIES.includes(oldCat)) {
      alert('Default categories cannot be edited.');
      return;
    }
    
    // Update category in transactions (local state)
    const updatedTransactions = transactions.map(t => 
      t.category === oldCat ? { ...t, category: trimmedNew } : t
    );
    setTransactions(updatedTransactions);
    
    // Update categories list (local state)
    setExpenseCategories(expenseCategories.map(cat => cat === oldCat ? trimmedNew : cat));
    if (category === oldCat) {
      setCategory(trimmedNew);
    }
    setEditingCategory(null);
    
    // Update in Supabase if logged in
    if (user) {
      try {
        // Update transactions with this category
        const transactionsToUpdate = transactions.filter(t => t.category === oldCat && t.id);
        if (transactionsToUpdate.length > 0) {
          for (const txn of transactionsToUpdate) {
            const { error } = await supabase
              .from('transactions')
              .update({ category: trimmedNew })
              .eq('id', txn.id)
              .eq('user_id', user.id);
            
            if (error) throw error;
          }
        }
        
        // Update user_categories: delete old, insert new (if not default)
        if (!DEFAULT_CATEGORIES.includes(trimmedNew)) {
          // Delete old category
          await supabase
            .from('user_categories')
            .delete()
            .eq('user_id', user.id)
            .eq('category_name', oldCat);
          
          // Insert new category
          const { error } = await supabase
            .from('user_categories')
            .insert({
              user_id: user.id,
              category_name: trimmedNew
            });
          
          if (error) throw error;
        } else {
          // If new name is a default category, just delete the old custom one
          await supabase
            .from('user_categories')
            .delete()
            .eq('user_id', user.id)
            .eq('category_name', oldCat);
        }
      } catch (error) {
        console.error('Error updating category in Supabase:', error);
        // Fallback to localStorage
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(expenseCategories.map(cat => cat === oldCat ? trimmedNew : cat)));
      }
    } else {
      // Fallback to localStorage if not logged in
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(expenseCategories.map(cat => cat === oldCat ? trimmedNew : cat)));
    }
  };

  const parseTransactionDate = (dateStr) => {
    if (!dateStr) return null;
    const baseYear = new Date().getFullYear();
    let parsed = new Date(`${dateStr} ${baseYear}`);

    if (isNaN(parsed)) {
      parsed = new Date(dateStr);
    }

    if (isNaN(parsed)) {
      const parts = dateStr.split('/');
      if (parts.length >= 2) {
        const month = parseInt(parts[0], 10) - 1;
        const day = parseInt(parts[1], 10);
        const year = parts.length >= 3 ? parseInt(parts[2], 10) : baseYear;
        if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
          parsed = new Date(year, month, day);
        }
      }
    }

    if (isNaN(parsed)) return null;
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getPeriodRange = () => {
    if (summaryPeriod === 'day') {
      return { start: new Date(today), end: new Date(today) };
    }
    if (summaryPeriod === 'week') {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { start, end: new Date(today) };
    }
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    end.setHours(0, 0, 0, 0);
    return { start, end };
  };

  const { start: periodStart, end: periodEnd } = getPeriodRange();

  const filteredTransactions = transactions.filter(t => {
    const txDate = parseTransactionDate(t.date);
    if (!txDate) return false;
    return txDate >= periodStart && txDate <= periodEnd;
  });

  const handleSelectPeriod = (key) => {
    setSummaryPeriod(key);
    setShowSummaryMenu(false);
  };

  const formatRangeLabel = (date) => {
    if (!(date instanceof Date)) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const periodLabel = (() => {
    if (!periodStart || !periodEnd) return '';
    if (summaryPeriod === 'month') {
      return periodStart.toLocaleDateString('en-US', { month: 'long' });
    }
    const startLabel = formatRangeLabel(periodStart);
    const endLabel = formatRangeLabel(periodEnd);
    if (summaryPeriod === 'day' || startLabel === endLabel) {
      return startLabel;
    }
    return `${startLabel} - ${endLabel}`;
  })();

  // Calculate earnings from transactions
  const earnings = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Calculate total expenses only
  const totalExpenses = filteredTransactions
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
        
        <div className="mb-3 text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2" style={{ marginTop: '-8px' }}>
          <div className="relative" ref={summaryMenuRef}>
            <button
              type="button"
              onClick={() => setShowSummaryMenu(prev => !prev)}
              className="flex items-center gap-1 text-sm font-medium text-black transition"
              style={{ marginTop: '-6px', padding: '4px 0', background: 'transparent', border: 'none' }}
            >
              <span>{periodLabel}</span>
              <svg className="w-3 h-3" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.833496 1L5.00016 5.16667L9.16683 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showSummaryMenu && (
              <div className="absolute z-20 mt-2 w-44 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                {[
                  { key: 'day', label: 'Today' },
                  { key: 'week', label: '7 Days' },
                  { key: 'month', label: 'This Month' }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => handleSelectPeriod(option.key)}
                    className={`w-full text-left px-4 py-2 text-sm ${summaryPeriod === option.key ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
          {filteredTransactions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No transactions in this period.</p>
          ) : (
            filteredTransactions.map((transaction) => (
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
                    {transaction.notes && (
                      <p className="text-xs text-gray-400 mt-1 italic">
                        {transaction.notes}
                      </p>
                    )}
                  </div>

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
            ))
          )}
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
              <div>
                <textarea
                  placeholder="Additional notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-4 py-4 text-black placeholder-gray-400 border-none outline-none text-base resize-none"
                  rows="3"
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

