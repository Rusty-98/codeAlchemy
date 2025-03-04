import { useState } from 'react';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Download, Code2, Sparkles, AlertCircle, Crown, Check, LogIn, Home } from 'lucide-react';
import { cn } from './lib/utils';
import { useAuth, useUser, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

function App() {
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const [text, setText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPricing, setShowPricing] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      features: [
        'Generate up to 3 files per day',
        'Basic code organization',
        '1500 less tokkens',
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Pro',
      price: '₹299/month',
      features: [
        'Unlimited file generation',
        '5999 tokkens',
        'Advanced code organization',
        'Priority support',
        'Custom file naming',
      ],
      color: 'from-purple-600 to-indigo-600',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Future me',
      ],
      color: 'from-orange-500 to-pink-500'
    }
  ];

  const handleGenerate = async () => {
    if (!isSignedIn) {
      setError('You must be signed in to generate code.');
      return;
    }

    setLoading(true);
    setError('');
    setShowSuccess(false);
    try {
      // Get Clerk JWT
      const token = await getToken();

      const response = await axios.post(
        'https://codealchemy.onrender.com/api/files/upload',
        { text },
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}` // Include the token
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
      setShowSuccess(true);
    } catch (err) {
      console.error('Error generating files:', err);
      const errorMsg = err.response?.data?.error || 'Failed to generate files. Please try again.';

      // Check if the error status is 403 or error message indicates the limit has been reached
      if (err.response?.status === 403 || errorMsg.toLowerCase().includes('buy a plan')) {
        setShowPricing(true);
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center px-4 py-6">
      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-12 px-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <img
            src="/logo.jpg"
            alt="Code Alchemy Logo"
            className="w-16 h-16 rounded-full"
          />
          <span className="text-xl font-semibold text-purple-300">
            Code Alchemy
          </span>
        </div>
        {/* Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <motion.button
            onClick={() => setShowPricing(!showPricing)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:shadow-xl transition-colors"
          >
            {showPricing ? (
              <>
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </>
            ) : (
              <span>View Plans</span>
            )}
          </motion.button>
          <SignedOut>
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 rounded-lg bg-gray-900 text-indigo-400 font-semibold shadow hover:shadow-xl transition-all"
              >
                Sign In
              </motion.button>
            </SignInButton>
            <SignUpButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:shadow-xl hover:bg-indigo-700 transition-all"
              >
                Register
              </motion.button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <div className="h-12 w-12 flex items-center justify-center border-2 border-white rounded-full">
              <UserButton className="w-full h-full" />
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* Main Content */}
      {!showPricing ? (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gray-800/50 backdrop-blur-sm shadow-lg">
                <Code2 className="w-6 h-6 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">
                  AI-Powered
                </span>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>

              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600">
                Code Alchemy
              </h1>
            </div>

            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Transform your AI chat conversations into organized, production-ready code files instantly
            </p>
          </motion.div>

          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl"
          >
            <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-purple-900">
              <div className="p-6">
                <div className="relative rounded-xl overflow-hidden">
                  <CodeMirror
                    value={text}
                    height="400px"
                    extensions={[markdown()]}
                    onChange={(value) => setText(value)}
                    className="border border-purple-800 rounded-xl"
                    theme="dark"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1.5 text-xs font-medium bg-purple-900/50 text-purple-300 rounded-full">
                      Markdown Supported
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={loading || text.trim() === ''}
                  className={cn(
                    "mt-6 w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 transition-all",
                    "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "shadow-lg shadow-purple-500/20"
                  )}
                >
                  <Zap className="w-5 h-5" />
                  {loading ? 'Generating Files...' : 'Generate Code Files'}
                </motion.button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    <div className="flex items-center gap-2 text-red-500 bg-red-900/20 rounded-lg p-4">
                      <AlertCircle className="w-5 h-5" />
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}

                {showSuccess && downloadUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 border-t border-purple-800 bg-gradient-to-r from-green-900/20 to-emerald-900/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-300">
                            Files Generated Successfully!
                          </h3>
                          <p className="text-sm text-green-400">
                            Your code files are ready for download
                          </p>
                        </div>
                      </div>
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={downloadUrl}
                        download="code-files.zip"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-green-300 font-medium shadow-sm hover:shadow transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download ZIP
                      </motion.a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      ) : (
        /* Pricing Section */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-7xl"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Choose Your Plan
            </h2>
            <p className="text-gray-300">
              Select the perfect plan for your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 px-4">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -5 }}
                className={cn(
                  "relative bg-gray-800 rounded-2xl shadow-xl overflow-hidden",
                  plan.popular && "ring-2 ring-purple-500"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium px-4 py-1 rounded-bl-lg">
                      Popular
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-white">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-gray-400">/month</span>}
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full py-3 px-4 rounded-xl font-medium text-white shadow-lg",
                      `bg-gradient-to-r ${plan.color}`
                    )}
                  >
                    Get Started
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center text-gray-400">
        <p>© {new Date().getFullYear()} Code Alchemy. Crafted with 💜 for developers.</p>
      </footer>
    </div>
  );
}

export default App;
