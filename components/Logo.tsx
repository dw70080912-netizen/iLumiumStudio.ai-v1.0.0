
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
        <svg aria-hidden="true" width="32" height="32" viewBox="0 0 100 100" className="text-gray-100 flex-shrink-0">
            <defs>
                <mask id="logo-crescent-mask">
                    <rect width="100" height="100" fill="white" />
                    <circle cx="70" cy="50" r="35" fill="black" />
                </mask>
            </defs>
            <circle cx="50" cy="50" r="40" fill="currentColor" mask="url(#logo-crescent-mask)" />
            <circle cx="35" cy="50" r="8" fill="rgb(96, 165, 250)" />
        </svg>
        <div>
            <h1 className="text-xl font-bold text-white">iLumium Studio</h1>
            <p className="text-xs text-gray-500 -mt-1">Desenvolvido por David William</p>
        </div>
    </div>
  );
};
