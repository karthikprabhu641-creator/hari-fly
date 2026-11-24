import React, { useEffect, useRef, useState } from 'react';

export function ToastViewport() {
  const [queue, setQueue] = useState([]);
  const [active, setActive] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleToast = (event) => {
      const detail = event.detail || {};
      setQueue((current) => [
        ...current,
        {
          id: `${Date.now()}-${Math.random()}`,
          text: detail.text,
          duration: Number.isFinite(detail.duration) ? detail.duration : 2000,
        },
      ]);
    };

    window.addEventListener('hari-fly-toast', handleToast);
    return () => window.removeEventListener('hari-fly-toast', handleToast);
  }, []);

  useEffect(() => {
    if (active || queue.length === 0) return;
    const next = queue[0];
    setActive(next);
    setQueue((current) => current.slice(1));
  }, [active, queue]);

  useEffect(() => {
    if (!active) return;
    timerRef.current = window.setTimeout(() => setActive(null), active.duration);
    return () => window.clearTimeout(timerRef.current);
  }, [active]);

  if (!active) return null;

  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      <div className="toast-pill" key={active.id}>{active.text}</div>
    </div>
  );
}
