import React from 'react';

interface HeaderProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const Header: React.FC<HeaderProps> = ({ lastUpdated, onRefresh, isRefreshing }) => {
  const formatTime = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString();
  };

  return (
    <header className="bg-flair-dark/90 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
      <div className="w-full px-4 sm:px-6 md:px-8 flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Flair_Airlines_logo_%282019%29.svg/1200px-Flair_Airlines_logo_%282019%29.svg.png" 
            alt="Flair Airlines Logo" 
            className="h-6 invert" 
          />
          <h1 className="text-xl sm:text-2xl font-bold text-text-light tracking-tight hidden sm:block">Cloud Services Health Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-text-muted hidden sm:block">
            Last Updated: <span className="font-semibold text-text-light">{formatTime(lastUpdated)}</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full bg-flair-surface/50 hover:bg-flair-surface/80 text-text-muted hover:text-text-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-flair-dark focus:ring-flair-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh statuses"
          >
            <svg
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l3.181-3.183a8.25 8.25 0 0111.664 0l3.181 3.183" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;