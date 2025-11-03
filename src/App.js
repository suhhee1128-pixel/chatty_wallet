import React, { useState } from 'react';
import SpendingPage from './components/SpendingPage';
import ChatPage from './components/ChatPage';
import AnalyticsPage from './components/AnalyticsPage';
import ProfilePage from './components/ProfilePage';
import NavigationBar from './components/NavigationBar';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('spending');

  const renderPage = () => {
    switch (currentPage) {
      case 'spending':
        return <SpendingPage />;
      case 'chat':
        return <ChatPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <SpendingPage />;
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

