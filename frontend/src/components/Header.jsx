import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  LogIn, 
  UserPlus, 
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

          {/* Action Icons & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Role Dashboard Link when signed in */}
            {currentUser ? (
              <Link
                to={currentUser.role === 'Dealer' ? '/dealer' : currentUser.role === 'Plumber' ? '/plumber' : '/customer'}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition active:scale-95"
              >
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <>
                {/* Login Link Button to /login URL */}
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                  <span>Login</span>
                </Link>

                {/* Register Link Button to /register URL */}
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition hover:shadow-blue-600/30 active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </>
            )}

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

        {/* Mobile Dropdown Menu for Auth & Quick Actions */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2 pb-2">
            {currentUser ? (
              <Link
                to={currentUser.role === 'Dealer' ? '/dealer' : currentUser.role === 'Plumber' ? '/plumber' : '/customer'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
