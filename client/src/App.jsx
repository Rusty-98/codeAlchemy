import { useState } from 'react';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Download, Code2, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from './lib/utils';

function App() {
  const [text, setText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setShowSuccess(false);
    try {
      const response = await axios.post(
        'https://codealchemy.onrender.com/api/files/upload',
        { text },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
      setShowSuccess(true);
    } catch (err) {
      console.error('Error generating files:', err);
      setError('Failed to generate files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="flex items-center justify-center gap-8 mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600">
            Code Alchemy
          </h1>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gray-800/50 backdrop-blur-sm shadow-lg">
            <Code2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-300">
              AI-Powered
            </span>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>


        </div>

        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Transform your AI chat conversations into organized, production-ready code files instantly
        </p>
      </motion.div>

      {/* Main Content */}
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
                className="border border-purple-800 rounded-xl p-1"
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
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-green-300 font-medium shadow-sm hover:shadow transition-all"
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

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center text-gray-400">
        <p>© {new Date().getFullYear()} Code Alchemy. Crafted with 💜 for developers.</p>
      </footer>
    </div>
  );
}

export default App;