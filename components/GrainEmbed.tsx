import React, { useState } from 'react';

interface GrainEmbedProps {
  url: string;
  autoplay?: boolean;
}

const GrainEmbed: React.FC<GrainEmbedProps> = ({ url, autoplay = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Construct URL with autoplay if needed
  let embedSrc = url;
  if (url.includes('grain.com')) {
    const embedUrl = new URL(url);
    if (autoplay) {
      embedUrl.searchParams.set('autoplay', 'true');
    }
    embedSrc = embedUrl.toString();
  }

  const brandingImage = "https://tvecnfdqakrevzaeifpk.supabase.co/storage/v1/object/public/caseworks/JUSTICE%20MINDS%20FORENSIC%20INTELLIGENCE%20(Website).png";

  return (
    <div className="flex flex-col gap-1">
      <div className="relative w-full h-0 pb-[56.25%] bg-slate-950 rounded-lg overflow-hidden border border-slate-700 shadow-inner group isolate">
        
        {/* Branding Overlay - PERMANENTLY ON TOP (z-20) 
            pointer-events-none allows clicks to pass through to the iframe below */}
        <img 
          src={brandingImage} 
          alt="Justice Minds Forensic Intelligence" 
          className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none select-none"
        />

        {/* Forensic Watermark Overlay (z-30) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent z-30 pointer-events-none flex justify-between items-end">
             <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                Forensic Evidence
             </div>
        </div>

        {/* Iframe Layer - UNDERNEATH (z-10) but interactive due to pointer-events-none above */}
        <iframe
          src={embedSrc}
          title="Evidence Recording"
          className={`absolute inset-0 w-full h-full z-10`}
          frameBorder="0"
          allow="autoplay; fullscreen; microphone; camera"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
        ></iframe>

        {/* Loading Spinner (Behind image, over iframe during load) */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
            <div className="w-12 h-12 border-4 border-slate-200/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GrainEmbed;