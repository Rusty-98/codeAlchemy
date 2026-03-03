// src/App.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Home, LayoutDashboard } from 'lucide-react';
import {
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react';
import { cn } from './lib/utils';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { isSignedIn } = useUser();
  // If signed in, show dashboard by default
  const [page, setPage] = useState(isSignedIn ? 'dashboard' : 'landing');

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-900/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/15 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="w-full border-b border-gray-800/60 backdrop-blur-sm sticky top-0 z-50 bg-[#0d0d12]/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setPage(isSignedIn ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow">
              <img src="/logo.jpg" alt="" className="object-contain" />
              
            </div>
            <span className="font-bold text-white text-base">Code Alchemy</span>
          </button>

          {/* Nav actions */}
          <div className="flex items-center gap-3">
            <SignedIn>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPage('dashboard')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    page === 'dashboard'
                      ? 'bg-violet-600/30 text-violet-300 border border-violet-700/40'
                      : 'text-gray-400 hover:text-gray-200'
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setPage('landing')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    page === 'landing'
                      ? 'bg-gray-700/50 text-gray-200 border border-gray-600/40'
                      : 'text-gray-400 hover:text-gray-200'
                  )}
                >
                  <Home className="w-4 h-4" />
                  Home
                </motion.button>
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-gray-700 flex items-center justify-center overflow-hidden">
                <UserButton />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="px-4 py-1.5 rounded-lg text-gray-300 text-sm font-medium hover:text-white border border-gray-700 hover:border-gray-500 transition-all"
                >
                  Sign In
                </motion.button>
              </SignInButton>
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow"
                >
                  Get Started
                </motion.button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 py-8">
        <SignedOut>
          <LandingPage isSignedIn={false} />
        </SignedOut>
        <SignedIn>
          {page === 'landing' ? <LandingPage isSignedIn={true} onGoToDashboard={() => setPage('dashboard')} /> : <Dashboard />}
        </SignedIn>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-5 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} Code Alchemy — Crafted for developers
      </footer>
    </div>
  );
}