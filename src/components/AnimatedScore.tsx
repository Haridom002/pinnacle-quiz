import { useEffect, useRef, useState } from 'react';

interface AnimatedScoreProps {
  value: number;
  className?: string;
  duration?: number;
}

export default function AnimatedScore({ value, className = '', duration = 600 }: AnimatedScoreProps) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start === end) return;

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
