import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// Automatically scrolls the window to the top whenever the route changes.
// Useful for ensuring users start at the top of a new page in single-page applications.
const ScrollToTop = () => {
  const { pathname } = useLocation();// Get current route path

  useEffect(() => {
    window.scrollTo(0, 0);// Scroll to top whenever the pathname changes
  }, [pathname]);

  return null;
};

export default ScrollToTop;