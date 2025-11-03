import React from 'react';

function ProfilePage() {
  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-normal text-black mb-2">Profile</h1>
      </div>
      
      {/* Profile Card */}
      <div className="mb-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
          <span className="text-5xl">😺</span>
        </div>
        <h2 className="text-2xl font-medium text-black mb-1">Catty User</h2>
        <p className="text-base text-black opacity-60">Member since Oct 2024</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-black mb-1">24</p>
          <p className="text-sm text-black opacity-60">Days Active</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-black mb-1">156</p>
          <p className="text-sm text-black opacity-60">Transactions</p>
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="space-y-2">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
          <span className="text-lg text-black">Notifications</span>
          <div className="w-12 h-6 bg-gray-300 rounded-full relative">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
          <span className="text-lg text-black">Currency</span>
          <span className="text-base text-black opacity-60">USD $</span>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
          <span className="text-lg text-black">Language</span>
          <span className="text-base text-black opacity-60">English</span>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
          <span className="text-lg text-black">Privacy</span>
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
          <span className="text-lg text-black">Help & Support</span>
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
          <span className="text-lg text-black">About</span>
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
      
      {/* Logout Button */}
      <div className="mt-8">
        <button className="w-full bg-red-500 text-white py-4 rounded-2xl font-medium text-base">
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;

