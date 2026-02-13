import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import CurrencySelector from './CurrencySelector';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Cost Explorer', icon: '📊' },
    { path: '/create-estimate', label: 'New Estimate', icon: '➕' },
    { path: '/history', label: 'History', icon: '📋' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0F15] border-b border-[#2A313C]">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-white text-lg font-semibold">ProjectCostPro</span>
            <span className="text-gray-400 text-sm hidden sm:inline"></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                  ${location.pathname === item.path
                    ? 'bg-[#1E252E] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1E252E]'
                  }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Section - Currency + User */}
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <CurrencySelector />

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.name?.split(' ')[0] || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
              <div className="w-8 h-8 bg-[#1E252E] rounded-md flex items-center justify-center border border-[#2A313C]">
                <span className="text-indigo-400 font-medium text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-white hover:bg-[#1E252E] rounded-md transition-all duration-200"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-white hover:bg-[#1E252E] rounded-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#2A313C]">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                    ${location.pathname === item.path
                      ? 'bg-[#1E252E] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#1E252E]'
                    }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center gap-3 px-4 py-3 mt-2 border-t border-[#2A313C]">
                <div className="w-8 h-8 bg-[#1E252E] rounded-md flex items-center justify-center border border-[#2A313C]">
                  <span className="text-indigo-400 font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;