import React, { useEffect, useRef, useState } from 'react';
import coinImage from '../../image/coin.png';
import keyImage from '../../image/key.png';

function useAnimatedNumber(value) {
  const safeValue = Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
  const [display, setDisplay] = useState(safeValue);
  const [bumped, setBumped] = useState(false);
  const frameRef = useRef(null);
  const timeoutRef = useRef(null);
  const previousRef = useRef(safeValue);

  useEffect(() => {
    const from = previousRef.current;
    previousRef.current = safeValue;
    if (from === safeValue) return;
    setBumped(true);
    timeoutRef.current = window.setTimeout(() => setBumped(false), 300);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(safeValue);
      return;
    }

    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / 420);
      setDisplay(Math.round(from + (safeValue - from) * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [safeValue]);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  return { display, bumped };
}

export function WalletDisplay({ coins = 0, keys = 0, className = '' }) {
  const animatedCoins = useAnimatedNumber(coins);
  const animatedKeys = useAnimatedNumber(keys);

  return (
    <div className={`wallet-display ${className}`} aria-label="Wallet">
      <span className={`wallet-display-item${animatedCoins.bumped ? ' is-bumped' : ''}`} aria-label={`${coins} coins`}>
        <img src={coinImage} alt="" />
        <span className="counter-value" data-counter-value={coins}>{animatedCoins.display}</span>
      </span>
      <span className={`wallet-display-item${animatedKeys.bumped ? ' is-bumped' : ''}`} aria-label={`${keys} keys`}>
        <img src={keyImage} alt="" />
        <span className="counter-value" data-counter-value={keys}>{animatedKeys.display}</span>
      </span>
    </div>
  );
}