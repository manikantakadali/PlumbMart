import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  Search, 
  LogIn, 
  UserPlus, 
  User, 
  Menu, 
  X
} from 'lucide-react';

export function BucketIcon({ className = "w-6 h-6" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 11l-1.5 9.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 11" />
      <path d="M4 11h16" />
      <path d="M7 11V6a5 5 0 0 1 10 0v5" />
    </svg>
  );
}

export default function Header({
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenCart,
  onOpenProfile,
  currentUser
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 transition-all shadow-sm">
      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Logo Section linking to '/' */}
          <Link 
            to="/" 
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20 ring-2 ring-blue-500/10 group-hover:scale-105 transition-transform">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Plumb<span className="text-blue-600">Mart</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  STORE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block tracking-wide">Plumbing &amp; Sanitary Supplies</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pipes, brass fittings, taps, pumps, valves..."
              className="w-full pl-10 pr-12 py-2 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Icons & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Bucket (Cart) Icon */}
            <button
              onClick={onOpenCart}
              title="Open Bucket / Cart"
              aria-label="Bucket / Cart"
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-600 transition group flex items-center gap-1.5 shadow-sm"
            >
              <BucketIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="hidden lg:inline text-xs font-semibold text-slate-700 group-hover:text-blue-700">Bucket</span>
              {cartCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              ) : (
                <span className="hidden sm:flex text-[11px] text-slate-500 bg-white px-1.5 py-0.5 rounded-full border border-slate-200">
                  0
                </span>
              )}
            </button>

            {/* Login Link Button to /login URL */}
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span>Login</span>
            </Link>

            {/* Register Link Button to /register URL */}
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition hover:shadow-blue-600/30"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </Link>

            {/* Quick Role Dashboard Link when signed in */}
            {currentUser && (
              <Link
                to={currentUser.role === 'Dealer' ? '/dealer' : currentUser.role === 'Plumber' ? '/plumber' : '/customer'}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
              >
                <span>Dashboard</span>
              </Link>
            )}

            {/* Profile Icon */}
            <button
              onClick={onOpenProfile}
              title={currentUser ? `Profile: ${currentUser.name}` : "User Profile"}
              aria-label="User Profile"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition group relative"
            >
              <User className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
              {currentUser && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input bar */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pipes, fittings, taps, valves..."
              className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Mobile Dropdown Menu for Auth & Quick Actions */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2 pb-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              <LogIn className="w-4 h-4 text-blue-600" />
              <span>Login to Account</span>
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Account</span>
            </Link>
            <button
              onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 text-left"
            >
              <User className="w-4 h-4 text-indigo-600" />
              <span>View Profile</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
