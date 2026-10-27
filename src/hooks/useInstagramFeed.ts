import { useState, useEffect, useCallback } from 'react';
import { PortfolioItem } from '../types';
import { instagramService } from '../services/instagramService';

export function useInstagramFeed() {
  const [posts, setPosts] = useState<PortfolioItem[]>(() => instagramService.getStoredItems());
  const [loading, setLoading] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isLiveSyncActive, setIsLiveSyncActive] = useState<boolean>(true);

  const fetchFeed = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const data = await instagramService.fetchLatestPosts(forceRefresh);
      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);
      }
      setLastChecked(new Date());
    } catch (err: any) {
      console.warn('Instagram feed sync notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchFeed(false);

    // Subscribe to feed updates
    const unsubscribeFeed = instagramService.subscribe((newPosts) => {
      setPosts(newPosts);
      setLastChecked(new Date());
    });

    // Subscribe to status updates
    const unsubscribeStatus = instagramService.subscribeStatus((status) => {
      setLoading(status.syncing);
      setLastChecked(status.lastChecked);
      setIsLiveSyncActive(true);
    });

    return () => {
      unsubscribeFeed();
      unsubscribeStatus();
    };
  }, [fetchFeed]);

  return {
    posts,
    loading,
    lastChecked,
    isLiveSyncActive,
    refetch: () => fetchFeed(true),
  };
}
