import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design that detects if a media query matches
 * @param query The media query to test (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Avoid running on server-side
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    
    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Define listener
    const listener = () => {
      setMatches(media.matches);
    };

    // Add listener
    media.addEventListener('change', listener);
    
    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query, matches]);

  return matches;
}
