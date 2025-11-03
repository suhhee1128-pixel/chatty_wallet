import React, { useState, useEffect } from 'react';
import SpendingPage from './components/SpendingPage';
import ChatPage from './components/ChatPage';
import AnalyticsPage from './components/AnalyticsPage';
import ProfilePage from './components/ProfilePage';
import NavigationBar from './components/NavigationBar';
import './App.css';

function App() {
  // Load transactions from localStorage on mount
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('chatty_wallet_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatty_wallet_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const [currentPage, setCurrentPage] = useState('spending');

  const renderPage = () => {
    switch (currentPage) {
      case 'spending':
        return <SpendingPage transactions={transactions} setTransactions={setTransactions} />;
      case 'chat':
        return <ChatPage transactions={transactions} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <SpendingPage transactions={transactions} setTransactions={setTransactions} />;
    }
  };

  return (
    <div className="app-container">
      <div className="phone-frame">
        <div className="phone-content">
          {renderPage()}
        </div>
        <NavigationBar currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    </div>
  );
}

export default App;

