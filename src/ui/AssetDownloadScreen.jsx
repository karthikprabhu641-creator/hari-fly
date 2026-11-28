import React, { useEffect, useState } from 'react';
import { GAME_ASSETS, preloadGameAssets } from '../services/assetDownloadService';

export function AssetDownloadScreen({ onComplete }) {
  const [progress, setProgress] = useState({ completed: 0, total: GAME_ASSETS.length });
  const [hasFailed, setHasFailed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let isMounted = true;

    preloadGameAssets(setProgress)
      .then(() => {
        if (isMounted) onComplete();
      })
      .catch(() => {
        if (isMounted) {
          setHasFailed(true);
          setIsRetrying(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  const handleRetry = () => {
    setHasFailed(false);
    setIsRetrying(true);

    preloadGameAssets(setProgress)
      .catch(() => {
        setHasFailed(true);
      })
      .finally(() => setIsRetrying(false));
  };

  const percentage = progress.total > 0
    ? Math.floor((progress.completed / progress.total) * 100)
    : 100;

  return (
    <main className="asset-download-screen" role="status" aria-live="polite" aria-busy={!hasFailed}>
      <h1 className="asset-download-title">HARI.FLY</h1>
      <p className="asset-download-message">
        {hasFailed ? 'Game assets could not load. Check your connection and try again.' : 'Game assets are loading. Please wait...'}
      </p>
      <div
        className="asset-download-progress"
        role="progressbar"
        aria-label="Game assets download progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
      <span className="asset-download-percentage">{percentage}%</span>
      {hasFailed && (
        <button type="button" className="asset-download-retry" onClick={handleRetry} disabled={isRetrying}>
          TRY AGAIN
        </button>
      )}
    </main>
  );
}
