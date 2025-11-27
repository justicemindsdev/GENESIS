import React, { useState, useMemo, useEffect } from 'react';
import { RAW_CLIPS } from './data';
import { CategoryGroup, ClipData } from './types';
import ClipCard from './components/ClipCard';

const App: React.FC = () => {
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Group clips by category for the sidebar or filter
  const categories = useMemo(() => {
    const cats = new Set(RAW_CLIPS.map(c => c.category));
    return ['All', ...Array.from(cats)];
  }, []);

  // Filter logic
  const filteredClips = useMemo(() => {
    return RAW_CLIPS.filter(clip => {
      const matchesCategory = selectedCategory === 'All' || clip.category === selectedCategory;
      const matchesSearch = clip.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            clip.timestamp.includes(searchTerm);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Handle playing a clip
  const handlePlayClip = (id: string) => {
    setActiveClipId(prev => (prev === id ? null : id));
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shrink-0 z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-white">
            <span className="text-blue-500">GRAIN</span> FORENSICS
          </h1>
          <p className="text-xs text-slate-500 mt-1">Evidence Viewer v1.0</p>
          <div className="mt-4 text-xs font-mono text-slate-600">
            Case: Ciaran Flynn<br/>
            Ref: 2025-11-24
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`
                w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${selectedCategory === cat 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
              `}
            >
              {cat}
              {cat !== 'All' && (
                <span className="float-right opacity-50 text-xs mt-0.5">
                  {RAW_CLIPS.filter(c => c.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              API Status: Connected
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        
        {/* Mobile Header / Search Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="md:hidden font-bold text-white mr-4">GRAIN</div>
          
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search transcripts, timestamps, or descriptions..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden md:flex ml-4 items-center gap-4 text-sm text-slate-400">
             <span>{filteredClips.length} Evidence Clips Found</span>
          </div>
        </header>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            
            {/* Category Headers & Clips */}
            {filteredClips.length === 0 ? (
              <div className="text-center py-20">
                <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-300">No clips found</h3>
                <p className="mt-1 text-sm text-slate-500">Try adjusting your search or category filter.</p>
              </div>
            ) : (
               <>
                 {/* Group by category if "All" is selected to give structure, otherwise just list */}
                 {selectedCategory === 'All' ? (
                    categories.filter(c => c !== 'All').map(cat => {
                       const clipsInCategory = filteredClips.filter(c => c.category === cat);
                       if (clipsInCategory.length === 0) return null;
                       return (
                          <div key={cat} className="mb-10">
                             <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                {cat}
                             </h2>
                             {clipsInCategory.map(clip => (
                                <ClipCard 
                                  key={clip.id} 
                                  clip={clip} 
                                  isActive={activeClipId === clip.id}
                                  onActivate={() => handlePlayClip(clip.id)}
                                />
                             ))}
                          </div>
                       )
                    })
                 ) : (
                    <div>
                       <h2 className="text-xl font-bold text-white mb-6">
                          {selectedCategory} <span className="text-slate-500 font-normal ml-2">({filteredClips.length})</span>
                       </h2>
                       {filteredClips.map(clip => (
                          <ClipCard 
                            key={clip.id} 
                            clip={clip} 
                            isActive={activeClipId === clip.id}
                            onActivate={() => handlePlayClip(clip.id)}
                          />
                       ))}
                    </div>
                 )}
               </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;