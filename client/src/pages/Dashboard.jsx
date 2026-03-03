// src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertCircle, LayoutDashboard, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateFiles, fetchStats } from '../lib/api';
import UsageBar from '../components/UsageBar';
import StatsCards from '../components/StatsCards';
import HistoryPanel from '../components/HistoryPanel';
import FilePreview from '../components/FilePreview';

const MAX_CHARS = 20000;
const DAILY_LIMIT = 10;

export default function Dashboard() {
  const { getToken } = useAuth();
  const [text, setText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [previewFiles, setPreviewFiles] = useState(null); // [{ name, content }]
  const [showPreview, setShowPreview] = useState(false);
  const prevDownloadUrl = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usedToday, setUsedToday] = useState(0);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('generator');
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => { loadStats(); }, []);

  useEffect(() => {
    return () => {
      if (prevDownloadUrl.current) URL.revokeObjectURL(prevDownloadUrl.current);
    };
  }, []);

  async function loadStats() {
    setStatsLoading(true);
    const token = await getToken();
    const { data } = await fetchStats(token);
    if (data) { setStats(data); setUsedToday(data.usedToday); }
    setStatsLoading(false);
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setShowPreview(false);

    if (prevDownloadUrl.current) {
      URL.revokeObjectURL(prevDownloadUrl.current);
      prevDownloadUrl.current = null;
    }

    const token = await getToken();
    const result = await generateFiles(text, token);

    if (result.error) {
      setError(result.error);
    } else {
      prevDownloadUrl.current = result.url;
      setDownloadUrl(result.url);
      setPreviewFiles(result.files);
      setShowPreview(true);
      setUsedToday(result.used ?? usedToday + 1);
      loadStats();
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'generator', label: 'Generator', icon: <Zap className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-800/60 rounded-xl p-1 mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Generator Tab */}
      {activeTab === 'generator' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <UsageBar used={usedToday} limit={DAILY_LIMIT} />

          <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Paste your AI chat below</span>
                <span className={cn(
                  'text-xs font-mono',
                  text.length > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-gray-500'
                )}>
                  {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden">
                <CodeMirror
                  value={text}
                  height="340px"
                  extensions={[markdown()]}
                  onChange={value => { if (value.length <= MAX_CHARS) setText(value); }}
                  className="border border-gray-700 rounded-xl"
                  theme="dark"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 text-xs font-medium bg-gray-900/70 text-gray-400 rounded-full">
                    Markdown
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={loading || text.trim().length < 10 || usedToday >= DAILY_LIMIT}
                className={cn(
                  'mt-5 w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all',
                  'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white',
                  'disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20'
                )}
              >
                <Zap className="w-5 h-5" />
                {loading
                  ? 'Generating...'
                  : usedToday >= DAILY_LIMIT
                  ? 'Daily Limit Reached'
                  : 'Generate Code Files'}
              </motion.button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-4"
                >
                  <div className="flex items-start gap-2.5 text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl p-4">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* File Preview — shown below the editor after generation */}
          <AnimatePresence>
            {showPreview && previewFiles && downloadUrl && (
              <FilePreview
                files={previewFiles}
                downloadUrl={downloadUrl}
                onClose={() => setShowPreview(false)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {statsLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
              Loading stats…
            </div>
          ) : stats ? (
            <>
              <StatsCards stats={stats} />
              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-200">Recent Generations</h3>
                </div>
                <HistoryPanel history={stats.history} />
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">Could not load stats.</p>
          )}
        </motion.div>
      )}
    </div>
  );
}