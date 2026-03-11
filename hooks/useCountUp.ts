'use client';

import { useEffect, useState, useRef } from 'react';

interface UseCountUpProps {
  end: number;
  duration?: number;
  start?: number;
  delay?: number;
  decimal?: number;
  prefix?: string;
  suffix?: string;
  onComplete?: () => void;
}

export function useCountUp({
  end,
  duration = 2000,
  start = 0,
  delay = 0,
  decimal = 0,
  prefix = '',
  suffix = '',
  onComplete,
}: UseCountUpProps) {
  const [count, setCount] = useState(start);
  const [isCounting, setIsCounting] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCounting(true);
      startTimeRef.current = null;
      hasCompletedRef.current = false;
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, end]);

  useEffect(() => {
    if (!isCounting) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = start + (end - start) * easeOutQuart;
      
      setCount(Number(currentCount.toFixed(decimal)));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsCounting(false);
        if (!hasCompletedRef.current && onComplete) {
          hasCompletedRef.current = true;
          onComplete();
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCounting, start, end, duration, decimal, onComplete]);

  const displayValue = `${prefix}${count.toLocaleString()}${suffix}`;

  return {
    count,
    displayValue,
    isCounting,
  };
}
