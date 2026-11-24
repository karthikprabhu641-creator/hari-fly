import React from 'react';
import coinImage from '../../image/coin.png';
import keyImage from '../../image/key.png';

export function WalletDisplay({ coins = 0, keys = 0, className = '' }) {
  return (
    <div className={`wallet-display ${className}`} aria-label="Wallet">
      <span className="wallet-display-item" aria-label={`${coins} coins`}>
        <img src={coinImage} alt="" />
        <span>{coins}</span>
      </span>
      <span className="wallet-display-item" aria-label={`${keys} keys`}>
        <img src={keyImage} alt="" />
        <span>{keys}</span>
      </span>
    </div>
  );
}