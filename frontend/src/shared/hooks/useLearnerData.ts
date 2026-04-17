/**
 * Custom hooks for learner data fetching
 * Created by CaptainCode
 */

import { useEffect, useState } from 'react';
import { learnerAPI } from '@/shared/api/client';

/**
 * Hook to fetch learner dashboard data
 */
export function useGetLearnerDashboard() {
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
      const response = await learnerAPI.getDashboard();
      setData(response.data?.data || response.data);
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Failed to fetch dashboard');
      console.error('Error fetching learner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchDashboard };
}

/**
 * Hook to fetch learner's enrolled courses
 */
export function useGetLearnerCourses() {
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
      const response = await learnerAPI.getCourses();
      setData(response.data?.data || response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Failed to fetch courses');
      console.error('Error fetching learner courses:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchCourses };
}

/**
 * Hook to fetch learner's progress
 */
export function useGetLearnerProgress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await learnerAPI.getProgress();
      setData(response.data?.data || response.data);
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Failed to fetch progress');
      console.error('Error fetching learner progress:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchProgress };
}
