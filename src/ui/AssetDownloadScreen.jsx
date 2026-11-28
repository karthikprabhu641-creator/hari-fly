import React, { useEffect, useState } from 'react';
import { GAME_ASSETS, preloadGameAssets } from '../services/assetDownloadService';

export function AssetDownloadScreen({ onComplete }) {
  const [progress, setProgress] = useState({ completed: 0, total: GAME_ASSETS.length });
  const [failedAssets, setFailedAssets] = useState([]);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const updateProgress = (nextProgress) => {
      if (isMounted) setProgress(nextProgress);
    };

    preloadGameAssets(updateProgress)
      .then(() => {
        if (isMounted) onComplete();
      })
      .catch((error) => {
        if (isMounted) {
          setFailedAssets(error.failedAssets || []);
          setIsRetrying(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  const handleRetry = () => {
    setFailedAssets([]);
    setProgress({ completed: 0, total: GAME_ASSETS.length });
    setIsRetrying(true);

    preloadGameAssets((nextProgress) => setProgress(nextProgress))
      .catch((error) => {
        setFailedAssets(error.failedAssets || []);
      })
      .finally(() => setIsRetrying(false));
  };

  const percentage = progress.total > 0
    ? Math.floor((progress.completed / progress.total) * 100)
    : 100;

  return (
    <main className="asset-download-screen" role="status" aria-live="polite">
      <div className="asset-download-card">
        <span className="asset-download-eyebrow">HARI.FLY</span>
        <h1>{failedAssets.length > 0 ? 'DOWNLOAD PAUSED' : 'GETTING THINGS READY'}</h1>
        <p>
          {failedAssets.length > 0
            ? 'Some game assets could not be downloaded. Check your connection and try again.'
            : 'Downloading game assets before takeoff…'}
        </p>

        <div
          className="asset-download-progress"
          role="progressbar"
          aria-label="Game asset download progress"
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.completed}
        >
          <span style={{ width: `${percentage}%` }} />
        </div>
        <div className="asset-download-progress-label">
          <span>{progress.completed} / {progress.total} assets</span>
          <strong>{percentage}%</strong>
        </div>

        {failedAssets.length > 0 && (
          <>
            <ul className="asset-download-errors">
              {failedAssets.slice(0, 3).map((asset) => (
                <li key={asset.src}>{decodeURIComponent(asset.src.split('/').pop().split('?')[0])}</li>
              ))}
              {failedAssets.length > 3 && <li>and {failedAssets.length - 3} more</li>}
            </ul>
            <button type="button" className="asset-download-retry" onClick={handleRetry} disabled={isRetrying}>
              {isRetrying ? 'RETRYING…' : 'RETRY DOWNLOAD'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
