import React, { useEffect } from 'react';

// Royalty-free sound effect "Sci-Fi Logo" by Wdomino on Freesound.org (License: CC0)
// This sound has been encoded to Base64 to be embedded directly in the application.
const SOUND_FX_BASE64 = 'data:audio/mpeg;base64,SUQzBAAAAAAAI V1NTVAAAAAQAAAADSUZGAAAACgAAAABURVhUAAAAFAAACAP/AAD/8AARIAAAAAABJScnJycnJycnJycnJycnJycnJycnJycnJylpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaW-';

export const SplashScreen: React.FC = () => {
  useEffect(() => {
    // Play sound effect on mount
    const audio = new Audio(SOUND_FX_BASE64);
    audio.volume = 0.4;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Autoplay was prevented by the browser, which is common.
        // We will proceed without sound in this case.
        console.warn("Audio autoplay was prevented by the browser.");
      });
    }
  }, []); // Empty dependency array ensures this runs only once

  return (
    <>
      <style>{`
        @keyframes splash-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes splash-scale-up {
          from { transform: scale(0.9); }
          to { transform: scale(1); }
        }
        @keyframes splash-glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(96, 165, 250, 1)); }
        }
        
        @keyframes title-focus-in {
            0% {
                filter: blur(12px);
                opacity: 0;
            }
            100% {
                filter: blur(0px);
                opacity: 1;
            }
        }
        
        @keyframes subtitle-slide-in-up {
            0% {
                opacity: 0;
                transform: translateY(20px);
                letter-spacing: 0.1em;
            }
            100% {
                opacity: 1;
                transform: translateY(0);
                letter-spacing: 0.25em;
            }
        }
        
        @keyframes progress-bar-fill {
            from { width: 0%; }
            to { width: 100%; }
        }

        @keyframes rise-and-fade {
          0% {
            height: 0%;
            opacity: 0;
          }
          25% {
             height: var(--final-height, 50%);
             opacity: 0.7;
          }
          80% {
             height: var(--final-height, 50%);
             opacity: 0.7;
          }
          100% {
             height: 0%;
             opacity: 0;
          }
        }

        .splash-logo-container {
            animation: splash-fade-in 1s ease-out forwards, splash-scale-up 1s ease-out forwards;
        }
        
        .splash-logo-orb-glow {
             animation: splash-glow 2.5s ease-in-out infinite;
             animation-delay: 0.5s;
        }
        
        .splash-title {
            animation: title-focus-in 1.2s cubic-bezier(0.550, 0.085, 0.680, 0.530) 0.5s both;
        }

        .splash-subtitle {
            animation: subtitle-slide-in-up 0.8s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s both;
        }

        .splash-progress-bar-container {
            opacity: 0;
            animation: splash-fade-in 0.5s ease-out 2.2s forwards;
        }
        
        .splash-progress-bar {
            animation: progress-bar-fill 2s ease-out 2.4s forwards;
        }

      `}</style>
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-[100] text-gray-100 antialiased overflow-hidden">
        
        <div 
          className="absolute inset-0 z-0 flex justify-center items-end gap-x-2 sm:gap-x-4" 
          style={{ perspective: '500px' }}
          aria-hidden="true"
        >
          {Array.from({ length: 15 }).map((_, i) => {
              const height = 10 + Math.pow(Math.random(), 2) * 70; // Skew towards shorter towers
              const delay = Math.random() * 0.8;
              return (
                  <div 
                      key={i} 
                      // FIX: Cast style object to React.CSSProperties to allow for CSS custom properties like '--final-height'.
                      style={{ 
                          '--final-height': `${height}%`,
                          animation: `rise-and-fade 4s ease-in-out ${delay}s forwards`,
                          background: 'linear-gradient(to top, rgba(59, 130, 246, 0.3), transparent)',
                          width: 'clamp(10px, 2vw, 30px)',
                          boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
                          borderTopLeftRadius: '2px',
                          borderTopRightRadius: '2px',
                      } as React.CSSProperties}
                  />
              );
          })}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
          <div className="splash-logo-container">
              <svg width="120" height="120" viewBox="0 0 100 100" className="mb-4 text-gray-100">
                  <defs>
                      <mask id="logo-crescent-mask-splash">
                          <rect width="100" height="100" fill="white" />
                          <circle cx="70" cy="50" r="35" fill="black" />
                      </mask>
                      <radialGradient id="splash-glow-gradient">
                          <stop offset="0%" stop-color="rgba(147, 197, 253, 0.7)" />
                          <stop offset="100%" stop-color="rgba(96, 165, 250, 0)" />
                      </radialGradient>
                  </defs>
                  <circle className="splash-logo-orb-glow" cx="35" cy="50" r="15" fill="url(#splash-glow-gradient)" />
                  <circle cx="50" cy="50" r="40" fill="currentColor" mask="url(#logo-crescent-mask-splash)" />
                  <circle cx="35" cy="50" r="8" fill="rgb(96, 165, 250)" />
              </svg>
          </div>
          <h1 className="splash-title text-3xl font-bold tracking-wider text-white mb-3">
              iLumium Studio
          </h1>
          <h2 className="splash-subtitle text-xs font-light text-gray-400 tracking-[0.25em]">
              DESENVOLVIDO POR DAVID WILLIAM
          </h2>

          <div className="splash-progress-bar-container w-[180px] h-1 bg-gray-700 rounded-full mt-10 overflow-hidden">
              <div className="splash-progress-bar h-full bg-blue-500 rounded-full"></div>
          </div>
        </div>

      </div>
    </>
  );
};
