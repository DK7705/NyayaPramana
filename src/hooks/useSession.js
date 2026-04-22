import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api.js';

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins
const WARNING_AT_MS = 13 * 60 * 1000;      // 13 mins

export function useSession() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_TIMEOUT_MS);
  
  const lastActivityRef = useRef(Date.now());
  const heartbeatIntervalRef = useRef(null);
  const checkIntervalRef = useRef(null);

  // Initialize session on mount
  useEffect(() => {
    const token = localStorage.getItem('nyaya_token');
    if (token) {
      api.getSession()
        .then(data => {
          setUser(data.user);
          setProgress(data.progress || { completedLevels: [], totalScore: 0, pramanaAccuracy: { pratyaksa: 0, anumana: 0, sabda: 0 } });
          startTracking();
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Listen for 401s from the API client
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Track user activity
  const updateActivity = useCallback(() => {
    if (!user) return;
    lastActivityRef.current = Date.now();
    if (showWarning) setShowWarning(false);
  }, [user, showWarning]);

  useEffect(() => {
    if (!user) return;
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }));
    
    return () => events.forEach(e => window.removeEventListener(e, updateActivity));
  }, [user, updateActivity]);

  // Session monitor & heartbeat
  const startTracking = () => {
    lastActivityRef.current = Date.now();
    
    // Heartbeat to server every minute
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    heartbeatIntervalRef.current = setInterval(() => {
      // Only heartbeat if user has been active recently
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime < 5 * 60 * 1000) { // If active in last 5 mins
        api.heartbeat().catch(() => {});
      }
    }, 60 * 1000);

    // Local monitor for timeout
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    checkIntervalRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      const left = SESSION_TIMEOUT_MS - idleTime;
      
      if (left <= 0) {
        logout(); // Session expired
      } else if (left <= (SESSION_TIMEOUT_MS - WARNING_AT_MS)) {
        setShowWarning(true);
        setTimeRemaining(left);
      } else {
        setShowWarning(false);
      }
    }, 1000);
  };

  const stopTracking = () => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    setShowWarning(false);
  };

  const login = async (credentials) => {
    const data = await api.login(credentials);
    localStorage.setItem('nyaya_token', data.token);
    setUser(data.user);
    setProgress(data.progress || { completedLevels: [], totalScore: 0, pramanaAccuracy: { pratyaksa: 0, anumana: 0, sabda: 0 } });
    startTracking();
    return data;
  };

  const register = async (userData) => {
    await api.register(userData);
  };

  const logout = async () => {
    try { if (user) await api.logout(); } catch (e) {}
    localStorage.removeItem('nyaya_token');
    setUser(null);
    setProgress(null);
    stopTracking();
  };

  const reloadProgress = async () => {
    try {
      const data = await api.getProgress();
      setProgress(data);
    } catch (e) {}
  };

  return {
    user,
    progress,
    loading,
    login,
    logout,
    register,
    reloadProgress,
    showWarning,
    timeRemaining,
    extendSession: updateActivity
  };
}
