import React, { useState } from 'react';

interface TooltipProps {
  text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className="flex items-center justify-center w-4 h-4 bg-gray-600 rounded-full text-white text-xs font-bold cursor-help">
        ?
      </div>
      {isVisible && (
        <div className="absolute bottom-full mb-2 w-64 p-2 bg-black text-white text-xs rounded-md shadow-lg z-10">
          {text}
        </div>
      )}
    </div>
  );
};
