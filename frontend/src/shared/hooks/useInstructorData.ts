/**
 * Custom hooks for instructor data fetching
 * Created by CaptainCode
 */

import { useEffect, useState } from 'react';
import { instructorAPI } from '@/shared/api/client';

/**
 * Hook to fetch instructor dashboard data
 */
export function useGetInstructorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await instructorAPI.getDashboard();
      setData(response.data?.data || response.data);
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Failed to fetch dashboard');
      console.error('Error fetching instructor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchDashboard };
}

/**
 * Hook to fetch instructor's courses
 */
export function useGetInstructorCourses() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await instructorAPI.getCourses();
      setData(response.data?.data || response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Failed to fetch courses');
      console.error('Error fetching instructor courses:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchCourses };
}

/**
 * Hook to fetch instructor analytics
 */
export function useGetInstructorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await instructorAPI.getAnalytics();
      setData(response.data?.data || response.data);
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Failed to fetch analytics');
      console.error('Error fetching instructor analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchAnalytics };
}
