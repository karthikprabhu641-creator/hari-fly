import React, { useEffect } from 'react';
import birdImage from '../../image/bird-transparent.png';
import { audioManager } from '../audio/AudioManager';
import { isMobileDevice, isFullscreen, requestFullscreen } from '../utils/device';

const PARTICLES = Array.from({ length: 36 }, (_, index) => {
  const x = (index * 47 + 13) % 100;
  const y = (index * 31 + 9) % 100;
  return {
    left: `${x}%`,
    top: `${y}%`,
    '--drift-x': `${(x - 50) * 1.5}vw`,
    '--drift-y': `${(y - 50) * 1.5}vh`,
    '--delay': `${(index % 9) * -0.37}s`,
    '--duration': `${3.2 + (index % 6) * 0.48}s`,
  };
});

export function LoadingScreen({ onSkip }) {
  useEffect(() => {
    // 5-second audio timeline
    audioManager.playIntroWind(1.05, 0.12);
    const cues = [
      window.setTimeout(() => audioManager.playIntroWhoosh(), 520),
      window.setTimeout(() => audioManager.playIntroWind(1.55, 0.2), 2050),
      window.setTimeout(() => audioManager.playIntroTakeoff(), 3800),
    ];
    return () => cues.forEach((cue) => window.clearTimeout(cue));
  }, []);

  const handleSkip = () => {
    if (isMobileDevice() && !isFullscreen()) {
      requestFullscreen();
    }
    if (typeof onSkip === 'function') onSkip();
  };

  return (
    <main
      className="loading-screen"
      role="status"
      aria-label="Flight initializing"
      onClick={handleSkip}
      style={{ cursor: 'pointer' }}
    >
      <div className="loading-sky" aria-hidden="true">
        <span className="loading-moonlight" />
        <span className="loading-cloud loading-cloud-far" />
        <span className="loading-cloud loading-cloud-near" />
        <span className="loading-mountain loading-mountain-far" />
        <span className="loading-mountain loading-mountain-near" />
        <span className="loading-wind-ring" />
        <span className="loading-wind-ring loading-wind-ring-front" />
        <div className="loading-streaks">
          {Array.from({ length: 16 }, (_, index) => <i key={index} style={{ '--angle': `${index * 22.5}deg` }} />)}
        </div>
        <div className="loading-particles">
          {PARTICLES.map((particle, index) => <i key={index} style={particle} />)}
        </div>
        <span className="loading-flash" />
        <span className="loading-flash-2" />
      </div>

      <span className="loading-eyebrow">FLIGHT INITIALIZING</span>
      <img className="loading-bird" src={birdImage} alt="" />
      <div className="loading-copy" aria-live="polite">
        <p className="loading-message loading-message-prepare">PREPARING FOR TAKEOFF</p>
        <p className="loading-message loading-message-ready">ENGINES ONLINE</p>
        <p className="loading-message loading-message-launch">READY TO FLY</p>
      </div>
      <span className="loading-skip-hint">Tap to skip</span>
    </main>
  );
}