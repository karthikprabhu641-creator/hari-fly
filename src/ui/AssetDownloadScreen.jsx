import React, { useEffect, useState } from 'react';
import { preloadGameAssets } from '../services/assetDownloadService';

export function AssetDownloadScreen({ onComplete }) {
  const [hasFailed, setHasFailed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let isMounted = true;

    preloadGameAssets()
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

    preloadGameAssets()
      .catch(() => {
        setHasFailed(true);
      })
      .finally(() => setIsRetrying(false));
  };

  return (
    <main className="asset-download-screen" role="status" aria-live="polite" aria-busy={!hasFailed}>
      <h1 className="asset-download-title">HARI.FLY</h1>
      <p className="asset-download-message">
        {hasFailed ? 'Game assets could not load. Check your connection and try again.' : 'Game assets are loading. Please wait...'}
      </p>
      {hasFailed && (
        <button type="button" className="asset-download-retry" onClick={handleRetry} disabled={isRetrying}>
          TRY AGAIN
        </button>
      )}
    </main>
  );
}
