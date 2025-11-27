import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ClipData } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (newClip: ClipData) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadComplete }) => {
  const [textData, setTextData] = useState('');
  const [category, setCategory] = useState('Recording Clips');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleProcessAndUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textData.trim()) {
      setStatus('Please paste evidence data.');
      return;
    }

    setIsProcessing(true);
    setStatus('Parsing data...');

    const lines = textData.trim().split('\n');
    const clipsToInsert: any[] = [];
    const uiClips: ClipData[] = [];

    // Parse loop
    for (const line of lines) {
      if (!line.trim()) continue;

      // Expected format: ThumbnailURL [TAB] Timestamp [TAB] Title [TAB] Quote [TAB] "more" [TAB] GrainURL
      // We accept flexible parsing if columns are missing, but aiming for this structure.
      const columns = line.split('\t');

      // Basic validation: needs at least a URL or a description
      if (columns.length < 2) continue;

      try {
        // Extract fields based on the specific format provided in prompt
        // Col 0: Thumbnail (skip or unused)
        // Col 1: Timestamp (e.g. "0:17")
        // Col 2: Title / Short Desc
        // Col 3: Quote (often wrapped in """)
        // Col 4: "more" (skip)
        // Col 5: Grain URL
        
        // Fallback logic if pasted data isn't exact tabs but is close
        let timestamp = columns[1] || "0:00";
        let title = columns[2] || "Untitled Clip";
        let quote = columns[3] || "";
        let url = columns[5] || columns[columns.length - 1]; // Grab last column if 5 is empty

        // Clean up quotes
        quote = quote.replace(/^"""|"""$/g, '').trim();
        
        // Clean up URL (remove extra query params if needed, or keep for timestamps)
        if (!url || !url.startsWith('http')) {
             // Try to find a URL in the line if tab split failed
             const urlMatch = line.match(/(https?:\/\/[^\s]+)/g);
             if (urlMatch) {
                 url = urlMatch[urlMatch.length - 1]; // Take the last URL (Grain link)
             } else {
                 continue; // No URL found
             }
        }

        // Combine Title and Quote for the description
        const description = quote ? `${title}: "${quote}"` : title;

        const newId = `upl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        clipsToInsert.push({
          id: newId,
          category,
          description,
          timestamp,
          url,
          created_at: new Date().toISOString()
        });

        uiClips.push({
          id: newId,
          category,
          description,
          timestamp,
          url
        });

      } catch (err) {
        console.warn('Failed to parse line:', line, err);
      }
    }

    if (clipsToInsert.length === 0) {
        setStatus('No valid clips found in text. Check format.');
        setIsProcessing(false);
        return;
    }

    setStatus(`Uploading ${clipsToInsert.length} clips to database...`);

    try {
        const { error } = await supabase
            .from('evidence_clips')
            .insert(clipsToInsert);

        if (error) throw error;

        setStatus('Success!');
        
        // Update UI locally
        uiClips.forEach(clip => onUploadComplete(clip));

        setTimeout(() => {
            setTextData('');
            setStatus('');
            setIsProcessing(false);
            onClose();
        }, 1000);

    } catch (err: any) {
        console.error('Database error:', err);
        // Check for "relation does not exist" error (code 42P01) or standard message
        if (err.code === '42P01' || (err.message && err.message.includes('does not exist'))) {
           setStatus('Error: Database table missing. Please execute the supabase_schema.sql in your Supabase SQL Editor.');
        } else {
           setStatus(`Error: ${err.message}`);
        }
        setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Batch Import Evidence
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleProcessAndUpload} className="p-6 space-y-4 flex-1 flex flex-col min-h-0">
          
          <div className="bg-blue-900/20 border border-blue-900/50 p-3 rounded text-xs text-blue-200">
            <strong>Instructions:</strong> Paste the tab-separated data (e.g., from Excel or the provided text format). 
            The system will automatically extract timestamps, descriptions, quotes, and Grain URLs.
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Target Category</label>
            <select 
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-1 focus:ring-blue-500 focus:outline-none appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Recording Clips</option>
                <option>Story Arc</option>
                <option>Headliners for Press</option>
                <option>Shocker Moments</option>
                <option>Powerful Quotes</option>
                <option>Aha Moments</option>
                <option>Press Story Headlines</option>
              </select>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <label className="block text-sm font-medium text-slate-400 mb-1">Paste Evidence Data</label>
            <textarea 
              required
              className="flex-1 w-full bg-slate-950 border border-slate-700 rounded p-3 text-xs font-mono text-slate-300 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
              placeholder={`Example:\nhttps://thumb... 0:17 Title """Quote""" ... https://grain.com/...`}
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
            />
          </div>

          {status && (
            <div className={`text-sm font-medium ${status.includes('Error') ? 'text-red-400' : 'text-green-400'} animate-pulse`}>
              {status}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isProcessing}
              className={`
                px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-900/50
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isProcessing ? 'Processing...' : 'Process & Import'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UploadModal;