import { useState } from 'react';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Download } from "lucide-react";

function App() {
  const [text, setText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    console.log('Text being sent:', text);
    setLoading(true);
    setError('');
    setShowSuccess(false);
    try {
      // Sending the chat log text to your backend
      const response = await axios.post(
        'http://localhost:5000/api/files/upload', 
        { text },
        { responseType: 'blob' }
      );
      // Create a URL for the downloaded ZIP file
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
    <div className="min-h-screen bg-[#f5f3ff] dark:bg-gray-900 flex flex-col items-center px-4">
      {/* Header */}
      <div className="mt-16 mb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            <code className="font-mono">&lt;/&gt;</code>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            MERN Code File Generator
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Extract code files from your AI chat logs instantly
        </p>
      </div>

      {/* Main Content */}
      <Card className="w-full max-w-3xl p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
        <div className="relative">
          <CodeMirror
            value={text}
            height="300px"
            extensions={[markdown()]}
            onChange={(value) => setText(value)}
            placeholder="Paste your chat log here..."
          />
          <Badge 
            variant="secondary"
            className="absolute top-3 right-3 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200"
          >
            AI-Powered
          </Badge>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || text.trim() === ''}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 py-6"
        >
          <Zap className="w-5 h-5" />
          {loading ? 'Generating...' : 'Generate Files'}
        </Button>

        {error && (
          <div className="mt-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Optional: Spinner overlay during loading */}
        {loading && (
          <div className="mt-4 text-center">
            <span className="animate-spin inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></span>
          </div>
        )}

        {/* Success Message with Download Link */}
        {showSuccess && downloadUrl && (
          <div className="mt-6 rounded-xl bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 p-px animate-fade-in">
            <div className="rounded-xl bg-white dark:bg-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  <h3 className="text-xl font-semibold">Files Generated Successfully!</h3>
                </div>
                <a href={downloadUrl} download="files.zip">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download ZIP
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-500 dark:text-gray-400">
        © 2023 MERN Code File Generator. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
