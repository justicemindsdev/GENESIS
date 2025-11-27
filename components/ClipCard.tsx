import React, { useState } from 'react';
import { ClipData } from '../types';
import GrainEmbed from './GrainEmbed';

interface ClipCardProps {
  clip: ClipData;
  isActive: boolean;
  onActivate: () => void;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip, isActive, onActivate }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`
        border-l-4 transition-all duration-300 ease-in-out mb-4 rounded-r-lg
        ${isActive ? 'border-blue-500 bg-slate-800/80 shadow-lg shadow-blue-900/20' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={onActivate}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`
                text-xs font-mono px-2 py-0.5 rounded
                ${isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-400'}
              `}>
                {clip.timestamp}
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {clip.category}
              </span>
            </div>
            
            <p className={`font-medium leading-relaxed ${isActive ? 'text-white' : 'text-slate-300'}`}>
              {clip.description}
            </p>
          </div>

          <div className="flex items-center self-center">
            <button 
              className={`
                flex items-center justify-center w-10 h-10 rounded-full border transition-all
                ${isActive 
                  ? 'bg-blue-500 border-blue-400 text-white' 
                  : 'bg-transparent border-slate-600 text-slate-400 group-hover:border-slate-400'}
              `}
              aria-label={isActive ? "Playing" : "Play Clip"}
            >
              {isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Accordion for Media Player */}
      <div 
        className={`
          overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out
          ${isActive ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        {isActive && (
          <div className="p-4 pt-0">
             <div className="mt-2">
                <GrainEmbed url={clip.url} autoplay={true} />
             </div>
             <div className="mt-2 text-xs text-center text-slate-500">
                Source: Grain Evidence API &bull; ID: {clip.id}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClipCard;