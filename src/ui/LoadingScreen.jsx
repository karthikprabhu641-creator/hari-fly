import React, { useEffect, useState } from 'react';
import birdImage from '../../image/bird-transparent.png';

const LOADING_LINES = [
  'Checking if the bird has a pilot license.',
  'Teaching the pipes to stay in their lane.',
  'Negotiating a reasonable amount of gravity.',
  'The bird asked for one more minute.',
];

export function LoadingScreen({ progress = 0 }) {
  const [lineIndex, setLineIndex] = useState(0);
  const percentage = Math.round(progress * 100);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % LOADING_LINES.length);
    }, 1200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="loading-screen" role="status" aria-live="polite">
      <div className="loading-topbar">
        <span className="loading-wordmark">HRAI <strong>FLY</strong></span>
        <span className="loading-status"><i /> PRE-FLIGHT CHECK</span>
      </div>

      <section className="loading-content">
        <div className="loading-bird-stage">
          <span className="loading-orbit loading-orbit-back" />
          <span className="loading-orbit loading-orbit-front" />
          <img className="loading-bird" src={birdImage} alt="Your very qualified bird pilot" />
          <span className="loading-speech">I meant to do that.</span>
        </div>

        <p className="loading-kicker">PLEASE HOLD YOUR WINGS</p>
        <h1 className="loading-joke" key={lineIndex}>{LOADING_LINES[lineIndex]}</h1>
        <div
          className="loading-progress-track"
          role="progressbar"
          aria-label="Loading game assets"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <span style={{ width: `${percentage}%` }} />
        </div>
        <div className="loading-progress-caption">
          <span>Getting the runway ready</span>
          <strong>{percentage}%</strong>
        </div>
      </section>

      <p className="loading-footnote">No birds were given a map. They seem confident anyway.</p>
    </main>
  );
}