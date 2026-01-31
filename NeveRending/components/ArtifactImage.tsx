
import React, { useState } from 'react';
import { getArtUrl } from '../utils';

interface ArtifactImageProps {
  id: string;
  name: string;
  className?: string;
  alt?: string;
}

const ArtifactImage: React.FC<ArtifactImageProps> = ({ id, name, className = "", alt = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const src = getArtUrl(id, name);

  return (
    <div className={`relative bg-slate-950 overflow-hidden flex items-center justify-center ${className}`}>
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent animate-pulse"></div>
          <i className="fa-solid fa-microchip text-slate-800 text-3xl opacity-20 animate-pulse"></i>
          <span className="mt-2 text-[7px] font-black text-slate-700 uppercase tracking-widest">Reading Artifact Data...</span>
        </div>
      )}
      
      <img 
        src={src} 
        alt={alt} 
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
      />
    </div>
  );
};

export default ArtifactImage;
