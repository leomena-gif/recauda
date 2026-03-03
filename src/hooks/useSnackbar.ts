/**
 * Custom hook for managing snackbar notifications.
 *
 * Cleanup: All setTimeout references are stored and cleared
 * on re-call and on component unmount to prevent memory leaks.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SNACKBAR_DURATION } from '@/constants';

interface UseSnackbarReturn {
  isVisible: boolean;
  isClosing: boolean;
  showSnackbar: () => void;
  hideSnackbar: () => void;
}

export const useSnackbar = (duration: number = SNACKBAR_DURATION.SUCCESS): UseSnackbarReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Clean up all timers when the component using this hook unmounts.
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const showSnackbar = useCallback(() => {
    clearTimers();

    setIsVisible(true);
    setIsClosing(false);

    const closeAnimationDelay = duration - SNACKBAR_DURATION.CLOSE_ANIMATION;

    animationTimerRef.current = setTimeout(() => {
      setIsClosing(true);
    }, closeAnimationDelay);

    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, duration);
  }, [duration, clearTimers]);

  const hideSnackbar = useCallback(() => {
    clearTimers();
    setIsClosing(true);
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, SNACKBAR_DURATION.CLOSE_ANIMATION);
  }, [clearTimers]);

  return { isVisible, isClosing, showSnackbar, hideSnackbar };
};
