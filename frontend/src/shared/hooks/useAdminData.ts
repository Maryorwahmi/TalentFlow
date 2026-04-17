/**
 * Custom hooks for admin data fetching
 * Created by CaptainCode
 */

import { useEffect, useState } from 'react';
import { adminAPI } from '@/shared/api/client';

// Type definitions
export interface AdminDashboardData {
  metrics?: Array<{ value: string; title: string; tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger' }>;
  teams?: Array<{ id?: string; code?: string; name: string; detail?: string }>;
  recentUsers?: Array<{ id?: string; name: string; role?: string; discipline?: string; status?: string }>;
  cohortInfo?: string;
}

export interface AdminAnalyticsData {
  [key: string]: any;
}

/**
 * Hook to fetch admin dashboard data
 */
export function useGetAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getDashboard();
      setData(response.data?.data || response.data || {});
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Failed to fetch dashboard');
      console.error('Error fetching admin dashboard:', err);
      setData({});
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchDashboard };
}

/**
 * Hook to fetch admin analytics
 */
export function useGetAdminAnalytics() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAnalytics();
      setData(response.data?.data || response.data || {});
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Failed to fetch analytics');
      console.error('Error fetching admin analytics:', err);
      setData({});
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchAnalytics };
}
