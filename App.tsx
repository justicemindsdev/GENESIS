import React, { useState, useMemo, useEffect } from 'react';
import { RAW_CLIPS } from './data';
import { CategoryGroup, ClipData } from './types';
import ClipCard from './components/ClipCard';
import UploadModal from './components/UploadModal';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // State for dynamic clips (starting with RAW_CLIPS)
  const [clips, setClips] = useState<ClipData[]>(RAW_CLIPS);
  
  // Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Fetch clips from Supabase on load
  useEffect(() => {
    const fetchClips = async () => {
      try {
        const { data, error } = await supabase
          .from('evidence_clips')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          // Check specifically for missing table error (Postgres code 42P01)
          if (error.code === '42P01') {
            console.warn('Database table "evidence_clips" not found. Running in offline mode with local data only. Please run supabase_schema.sql.');
            return;
          }
          console.error('Error fetching clips:', error.message || error);
          return;
        }

        if (data && Array.isArray(data)) {
          const dbClips: ClipData[] = data.map((d: any) => ({
            id: d.id,
            category: d.category,
            description: d.description,
            timestamp: d.timestamp,
            url: d.url
          }));
          // Combine DB clips with hardcoded RAW_CLIPS
          setClips([...dbClips, ...RAW_CLIPS]);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching clips:', err.message || err);
      }
    };

    fetchClips();
  }, []);

  // Group clips by category for the sidebar or filter
  const categories = useMemo(() => {
    const cats = new Set(clips.map(c => c.category));
    return ['All', ...Array.from(cats)];
  }, [clips]);

  // Filter logic
  const filteredClips = useMemo(() => {
    return clips.filter(clip => {
      const matchesCategory = selectedCategory === 'All' || clip.category === selectedCategory;
      const matchesSearch = clip.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            clip.timestamp.includes(searchTerm);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm, clips]);

  // Handle playing a clip
  const handlePlayClip = (id: string) => {
    setActiveClipId(prev => (prev === id ? null : id));
  };

  const handleShare = () => {
    // Copy current URL to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    });
  };

  const handleNewClip = (newClip: ClipData) => {
    setClips(prev => [newClip, ...prev]);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shrink-0 z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <h1 className="text-lg font-bold tracking-tight text-white flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              JUSTICE MINDS
            </div>
            <span className="text-slate-400 font-medium pl-5">FORENSICS</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 pl-1">Evidence Viewer v2.2</p>
          <div className="mt-4 p-3 bg-slate-800/50 rounded border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Current Case</div>
            <div className="text-xs font-mono text-slate-300">Ciaran Flynn</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Ref: 2025-11-24</div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Recordings
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                const mainEl = document.getElementById('main-content');
                if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`
                w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group
                ${selectedCategory === cat 
                  ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 pl-2.5' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent'}
              `}
            >
              <div className="flex items-center justify-between">
                <span>{cat}</span>
                {cat !== 'All' && (
                  <span className={`text-[10px] py-0.5 px-1.5 rounded-full ${selectedCategory === cat ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                    {clips.filter(c => c.category === cat).length}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
           <button 
             onClick={() => setIsUploadModalOpen(true)}
             className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-2 px-4 rounded border border-slate-700 transition-colors"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
             </svg>
             + Add Evidence
           </button>
           
           <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                Storage: Connected
              </div>
              <span>SECURE</span>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="md:hidden font-bold text-white mr-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> GRAIN
          </div>
          
          <div className="relative flex-1 max-w-2xl mr-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search transcripts, timestamps, or descriptions..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-slate-800/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={handleShare}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded transition-all shadow-lg shadow-blue-900/20 active:scale-95"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden sm:inline">Share Page</span>
             </button>
          </div>
        </header>

        {/* Scrollable List */}
        <div id="main-content" className="flex-1 overflow-y-auto scroll-smooth bg-slate-950 relative">
          
          {/* Hero Image */}
          <div className="w-full bg-slate-950 border-b border-slate-800/50 pb-6 pt-6 px-4 md:px-8">
            <img 
              alt="Justice Minds Forensic Intelligence" 
              className="w-full max-w-7xl mx-auto drop-shadow-2xl" 
              src="https://tvecnfdqakrevzaeifpk.supabase.co/storage/v1/object/public/caseworks/JUSTICE%20MINDS%20FORENSIC%20INTELLIGENCE%20(Website)%20(1).svg"
            />
          </div>

          <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-[50vh]">
            
            {/* Category Headers & Clips */}
            {filteredClips.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-lg border border-slate-800 border-dashed">
                <svg className="mx-auto h-12 w-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-slate-300">No evidence found</h3>
                <p className="mt-2 text-sm text-slate-500">Try adjusting your search or category filter.</p>
              </div>
            ) : (
               <>
                 {selectedCategory === 'All' ? (
                    categories.filter(c => c !== 'All').map(cat => {
                       const clipsInCategory = filteredClips.filter(c => c.category === cat);
                       if (clipsInCategory.length === 0) return null;
                       return (
                          <div key={cat} className="mb-12">
                             <div className="flex items-center gap-3 mb-5 pb-2 border-b border-slate-800">
                                <span className="w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                                <h2 className="text-xl font-bold text-white tracking-wide">{cat}</h2>
                                <span className="ml-auto text-xs font-mono text-slate-600 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                  {clipsInCategory.length} CLIPS
                                </span>
                             </div>
                             <div className="space-y-4">
                               {clipsInCategory.map(clip => (
                                  <ClipCard 
                                    key={clip.id} 
                                    clip={clip} 
                                    isActive={activeClipId === clip.id}
                                    onActivate={() => handlePlayClip(clip.id)}
                                  />
                               ))}
                             </div>
                          </div>
                       )
                    })
                 ) : (
                    <div>
                       <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-800">
                          <span className="w-1 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></span>
                          <h2 className="text-2xl font-bold text-white">
                             {selectedCategory}
                          </h2>
                          <span className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-sm border border-slate-700">
                             {filteredClips.length}
                          </span>
                       </div>
                       <div className="space-y-4">
                          {filteredClips.map(clip => (
                             <ClipCard 
                               key={clip.id} 
                               clip={clip} 
                               isActive={activeClipId === clip.id}
                               onActivate={() => handlePlayClip(clip.id)}
                             />
                          ))}
                       </div>
                    </div>
                 )}
               </>
            )}
          </div>

          {/* Footer Image */}
          <div className="mt-12 bg-slate-900 border-t border-slate-800">
            <img 
              alt="Contact Information" 
              className="w-full max-w-4xl mx-auto opacity-80 hover:opacity-100 transition-opacity duration-300" 
              src="https://tvecnfdqakrevzaeifpk.supabase.co/storage/v1/object/public/caseworks/FOOTER%20EMAIL.png"
            />
          </div>
          
        </div>
      </main>

      {/* Share Toast Notification */}
      <div 
        className={`
          fixed bottom-6 right-6 z-50 transform transition-all duration-300 ease-out
          ${showShareToast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}
      >
        <div className="bg-blue-600 text-white px-4 py-3 rounded shadow-lg shadow-blue-900/50 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Link copied to clipboard!</span>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleNewClip}
      />
    </div>
  );
};

export default App;