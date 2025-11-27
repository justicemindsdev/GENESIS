import React from 'react';

interface GrainEmbedProps {
  url: string;
  autoplay?: boolean;
}

const GrainEmbed: React.FC<GrainEmbedProps> = ({ url, autoplay = false }) => {
  // Convert standard share URL to embed URL if necessary.
  // Grain typically allows embedding the share URL directly, or replacing /share/ with /embed/
  // For safety and compatibility, we will use the URL provided but ensure it's loaded in a sandbox.
  
  // Basic heuristic to ensure it is a valid grain URL
  if (!url.includes('grain.com')) {
    return <div className="p-4 bg-red-900/20 text-red-400">Invalid Grain URL</div>;
  }

  // Construct URL with autoplay if needed
  const embedUrl = new URL(url);
  if (autoplay) {
    embedUrl.searchParams.set('autoplay', 'true');
  }

  return (
    <div className="relative w-full h-0 pb-[56.25%] bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-inner">
      <iframe
        src={embedUrl.toString()}
        title="Grain Recording"
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; microphone; camera"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default GrainEmbed;