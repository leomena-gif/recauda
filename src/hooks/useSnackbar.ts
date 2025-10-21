/**
 * Custom hook for managing snackbar notifications
 */

import { useState, useCallback } from 'react';
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

  const showSnackbar = useCallback(() => {
    setIsVisible(true);
    setIsClosing(false);

    const closeAnimationDelay = duration - SNACKBAR_DURATION.CLOSE_ANIMATION;
    
    setTimeout(() => {
      setIsClosing(true);
    }, closeAnimationDelay);

    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, duration);
  }, [duration]);

  const hideSnackbar = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, SNACKBAR_DURATION.CLOSE_ANIMATION);
  }, []);

  return { isVisible, isClosing, showSnackbar, hideSnackbar };
};

