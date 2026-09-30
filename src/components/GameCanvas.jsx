/**
 * GameCanvas Component
 * Mounts the HTML5 Canvas 2D element, binds it to the GameEngine,
 * and observes container resizing for crisp multi-device responsiveness.
 */

import React, { useRef, useEffect } from 'react';

export function GameCanvas({ engine }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engine) return;

    let resizeObserver = null;

    // Initialize Game Engine on Canvas
    engine.init(canvas).then(() => {
      // Setup ResizeObserver on parent container
      const container = canvas.parentElement;
      if (container && window.ResizeObserver) {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            engine.resize(width, height);
          }
        });
        resizeObserver.observe(container);
      }
    });

    // Window fallback resize
    const handleResize = () => {
      const container = canvas.parentElement || document.body;
      engine.resize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      engine.destroy();
    };
  }, [engine]);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      id="game-canvas"
    />
  );
}
