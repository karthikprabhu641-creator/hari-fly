/**
 * Lucky Wheel Modal Component
 * 12-Hour Daily Lucky Spin with Coins and Keys rewards.
 * Features physics-feeling deceleration animation, ticking sound effects,
 * confetti/sparkle victory celebration, and live 12hr countdown timer.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudio } from '../hooks/useAudio';
import { safeStorage } from '../utils/storage';
import coinImage from '../../image/coin.png';
import keyImage from '../../image/key.png';
import { WalletDisplay } from './WalletDisplay';

export const LUCKY_WHEEL_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours
export const LUCKY_WHEEL_STORAGE_KEY = 'hari_fly_lucky_wheel_last_spin';

export const WHEEL_SEGMENTS = [
  { id: 0, type: 'coin', amount: 50, label: '50', unit: 'COINS', color: '#f59e0b', darkColor: '#d97706', accent: '#fef3c7' },
  { id: 1, type: 'key', amount: 1, label: '1', unit: 'KEY', color: '#06b6d4', darkColor: '#0891b2', accent: '#cffafe' },
  { id: 2, type: 'coin', amount: 100, label: '100', unit: 'COINS', color: '#10b981', darkColor: '#059669', accent: '#d1fae5' },
  { id: 3, type: 'key', amount: 2, label: '2', unit: 'KEYS', color: '#8b5cf6', darkColor: '#7c3aed', accent: '#ede9fe' },
  { id: 4, type: 'coin', amount: 25, label: '25', unit: 'COINS', color: '#ea580c', darkColor: '#c2410c', accent: '#ffedd5' },
  { id: 5, type: 'key', amount: 3, label: '3', unit: 'KEYS', color: '#2563eb', darkColor: '#1d4ed8', accent: '#dbeafe' },
  { id: 6, type: 'coin', amount: 200, label: '200', unit: 'JACKPOT', color: '#e11d48', darkColor: '#be123c', accent: '#ffe4e6' },
  { id: 7, type: 'key', amount: 5, label: '5', unit: 'MEGA KEYS', color: '#9333ea', darkColor: '#7e22ce', accent: '#fae8ff' },
];

export function formatCooldown(ms) {
  if (ms <= 0) return '00:00:00';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function LuckyWheelModal({ onClose, onClaimReward, coins = 0, keys = 0 }) {
  const { playClick, playWheelTick, playRewardChime } = useAudio();

  const [lastSpinTime, setLastSpinTime] = useState(() =>
    safeStorage.getNumber(LUCKY_WHEEL_STORAGE_KEY, 0)
  );
  const [cooldownRemaining, setCooldownRemaining] = useState(() => {
    const elapsed = Date.now() - safeStorage.getNumber(LUCKY_WHEEL_STORAGE_KEY, 0);
    return Math.max(0, LUCKY_WHEEL_COOLDOWN_MS - elapsed);
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const wheelRef = useRef(null);
  const tickIntervalsRef = useRef([]);

  const isAvailable = cooldownRemaining <= 0 && !isSpinning;

  // Live timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      const stored = safeStorage.getNumber(LUCKY_WHEEL_STORAGE_KEY, 0);
      const remaining = Math.max(0, LUCKY_WHEEL_COOLDOWN_MS - (Date.now() - stored));
      setCooldownRemaining(remaining);
      setLastSpinTime(stored);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSpinning) {
        playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSpinning, playClick]);

  // Clean up tick intervals
  useEffect(() => {
    return () => {
      tickIntervalsRef.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  const handleSpin = () => {
    if (!isAvailable || isSpinning) return;
    playClick();

    setIsSpinning(true);
    setWonReward(null);
    setShowCelebration(false);

    // Pick target segment
    // Random selection with good distribution
    const targetIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const targetReward = WHEEL_SEGMENTS[targetIndex];

    // Math: segment angle is 45 deg.
    // 0 deg is at top (12 o'clock).
    // Segment i is centered at i * 45 deg clockwise.
    // To bring segment i to the top (0 deg), rotate clockwise by 360 - (i * 45) deg.
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetAlignment = (360 - (targetIndex * segmentAngle)) % 360;
    const jitter = (Math.random() - 0.5) * 18; // safe jitter within sector

    // Spin at least 6 full revolutions + target alignment
    const fullSpins = 360 * 6;
    const currentBase = rotation - (rotation % 360);
    const finalRotation = currentBase + fullSpins + targetAlignment + jitter;

    setRotation(finalRotation);

    // Schedule audio ticks during deceleration
    tickIntervalsRef.current.forEach((id) => clearTimeout(id));
    tickIntervalsRef.current = [];

    const duration = 4600; // ms
    // Generate tick timestamps that decelerate
    const tickTimes = [
      120, 240, 360, 480, 600, 720, 840, 960, 1100, 1250, 1420, 1610, 1820,
      2050, 2300, 2580, 2890, 3230, 3600, 4000, 4350, 4550
    ];

    tickTimes.forEach((t) => {
      const id = setTimeout(() => {
        playWheelTick?.();
      }, t);
      tickIntervalsRef.current.push(id);
    });

    // Landing finish
    const finishId = setTimeout(() => {
      setIsSpinning(false);
      setWonReward(targetReward);
      setShowCelebration(true);

      // Play victory fanfare
      playRewardChime?.();

      // Record spin timestamp in storage
      const now = Date.now();
      safeStorage.setNumber(LUCKY_WHEEL_STORAGE_KEY, now);
      setLastSpinTime(now);
      setCooldownRemaining(LUCKY_WHEEL_COOLDOWN_MS);

      // Award coins or keys to player
      if (targetReward.type === 'coin') {
        onClaimReward({ coins: targetReward.amount, keys: 0 });
      } else {
        onClaimReward({ coins: 0, keys: targetReward.amount });
      }
    }, duration);

    tickIntervalsRef.current.push(finishId);
  };

  const handleClaimDismiss = (e) => {
    e.stopPropagation();
    playClick();
    setShowCelebration(false);
  };

  const handleBack = (e) => {
    e.stopPropagation();
    if (isSpinning) return;
    playClick();
    onClose();
  };

  // SVG Wedge generator
  const wedges = useMemo(() => {
    const total = WHEEL_SEGMENTS.length;
    const anglePer = 360 / total; // 45 deg
    const radius = 150;
    const center = 160;

    return WHEEL_SEGMENTS.map((seg, i) => {
      const startAngle = i * anglePer - anglePer / 2 - 90; // center 1st segment at top
      const endAngle = startAngle + anglePer;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

      // Text/icon placement
      const midAngle = (startAngle + endAngle) / 2;
      const midRad = (midAngle * Math.PI) / 180;
      const textRadius = radius * 0.65;
      const tx = center + textRadius * Math.cos(midRad);
      const ty = center + textRadius * Math.sin(midRad);
      const textRot = midAngle + 90;

      return {
        ...seg,
        pathData,
        tx,
        ty,
        textRot,
      };
    });
  }, []);

  return (
    <div className="lucky-wheel-backdrop" id="lucky-wheel-overlay" onClick={handleBack}>
      <div className="lucky-wheel-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="lucky-wheel-header">
          <button
            className="lucky-wheel-back-btn"
            onClick={handleBack}
            id="lucky-wheel-back-btn"
            type="button"
            disabled={isSpinning}
            aria-label="Back to main menu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            <span>BACK</span>
          </button>

          <div className="lucky-wheel-header-center">
            <h2 className="lucky-wheel-title">LUCKY WHEEL</h2>
            <span className="lucky-wheel-subtitle">Spin every 12 hours for free Coins & Keys!</span>
          </div>

          <WalletDisplay coins={coins} keys={keys} className="lucky-wheel-wallet" />
        </header>

        {/* Wheel Arena */}
        <div className="lucky-wheel-arena">
          <div className="lucky-wheel-assembly">
            {/* Pointer / Ticker Needle */}
            <div className={`lucky-wheel-ticker${isSpinning ? ' is-ticking' : ''}`} aria-hidden="true">
              <div className="ticker-triangle" />
              <div className="ticker-gem" />
            </div>

            {/* Rotating Wheel */}
            <div
              className="lucky-wheel-disc"
              ref={wheelRef}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? 'transform 4.6s cubic-bezier(0.12, 0.96, 0.24, 1.0)'
                  : 'none',
              }}
            >
              <svg viewBox="0 0 320 320" className="lucky-wheel-svg" aria-label="Lucky wheel disc">
                <defs>
                  <filter id="wheel-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
                  </filter>
                  <radialGradient id="rim-gradient" cx="50%" cy="50%" r="50%">
                    <stop offset="85%" stopColor="#d4af37" />
                    <stop offset="94%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#996515" />
                  </radialGradient>
                  <radialGradient id="hub-gradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="45%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#854d0e" />
                  </radialGradient>
                </defs>

                {/* Outer metallic rim with gold studs */}
                <circle cx="160" cy="160" r="158" fill="url(#rim-gradient)" stroke="#583c07" strokeWidth="3" />
                <circle cx="160" cy="160" r="151" fill="#142123" />

                {/* 16 rim decorative studs */}
                {Array.from({ length: 16 }).map((_, i) => {
                  const angle = (i * (360 / 16) * Math.PI) / 180;
                  const sx = 160 + 154 * Math.cos(angle);
                  const sy = 160 + 154 * Math.sin(angle);
                  return (
                    <circle
                      key={i}
                      cx={sx}
                      cy={sy}
                      r={i % 2 === 0 ? 2.5 : 1.8}
                      fill={i % 2 === 0 ? '#fff' : '#fef08a'}
                      opacity={0.9}
                    />
                  );
                })}

                {/* Wedges */}
                <g filter="url(#wheel-glow)">
                  {wedges.map((w) => (
                    <g key={w.id} className="wheel-wedge-group">
                      <path
                        d={w.pathData}
                        fill={w.color}
                        stroke="#0d1f22"
                        strokeWidth="1.8"
                      />
                      {/* Segment content */}
                      <g transform={`translate(${w.tx}, ${w.ty}) rotate(${w.textRot})`}>
                        <text
                          y="-10"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="15"
                          fontWeight="950"
                          fontFamily="var(--font-display, sans-serif)"
                          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
                        >
                          {w.label}
                        </text>
                        <text
                          y="4"
                          textAnchor="middle"
                          fill={w.accent}
                          fontSize="7.5"
                          fontWeight="900"
                          letterSpacing="0.05em"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
                        >
                          {w.unit}
                        </text>
                      </g>
                    </g>
                  ))}
                </g>

                {/* Center Hub */}
                <circle cx="160" cy="160" r="28" fill="url(#hub-gradient)" stroke="#451a03" strokeWidth="2.5" />
                <circle cx="160" cy="160" r="23" fill="#1b2e2d" stroke="#fef08a" strokeWidth="1" />
                <polygon
                  points="160,143 165,153 176,154 167,162 170,173 160,167 150,173 153,162 144,154 155,153"
                  fill="#facc15"
                />
              </svg>
            </div>
          </div>

          {/* Action / Countdown Controls */}
          <div className="lucky-wheel-controls">
            {isAvailable ? (
              <button
                className="lucky-wheel-spin-btn is-ready"
                onClick={handleSpin}
                disabled={isSpinning}
                id="wheel-spin-btn"
                type="button"
              >
                <span className="spin-btn-glow" />
                <span className="spin-btn-text">{isSpinning ? 'SPINNING...' : 'FREE SPIN!'}</span>
                <span className="spin-btn-sub">Tap to test your luck</span>
              </button>
            ) : (
              <div className="lucky-wheel-cooldown-panel">
                <div className="cooldown-timer-badge">
                  <span className="cooldown-icon">⏳</span>
                  <div className="cooldown-digits-wrap">
                    <span className="cooldown-label">NEXT FREE SPIN IN</span>
                    <strong className="cooldown-timer">{formatCooldown(cooldownRemaining)}</strong>
                  </div>
                </div>
                <button
                  className="lucky-wheel-spin-btn is-locked"
                  disabled
                  type="button"
                >
                  <span className="spin-btn-text">COOLDOWN ACTIVE</span>
                  <span className="spin-btn-sub">Resets every 12 hours</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Celebration Winner Modal Popup */}
        {showCelebration && wonReward && (
          <div className="wheel-celebration-overlay" onClick={handleClaimDismiss}>
            <div className="wheel-celebration-card" onClick={(e) => e.stopPropagation()}>
              <div className="celebration-sparkles" aria-hidden="true">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className={`sparkle-star sparkle-${i}`} />
                ))}
              </div>

              <div className="celebration-badge">YOU WON!</div>
              <h3 className="celebration-title">LUCKY REWARD</h3>

              <div className="celebration-reward-display">
                <img
                  src={wonReward.type === 'coin' ? coinImage : keyImage}
                  alt={wonReward.type}
                  className="celebration-reward-img"
                />
                <span className="celebration-reward-amount">+{wonReward.amount}</span>
                <span className="celebration-reward-type">
                  {wonReward.type === 'coin' ? 'COINS' : wonReward.amount === 1 ? 'KEY' : 'KEYS'}
                </span>
              </div>

              <p className="celebration-note">Added directly to your wallet!</p>

              <button
                className="celebration-claim-btn"
                onClick={handleClaimDismiss}
                id="wheel-claim-btn"
                type="button"
              >
                AWESOME!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
