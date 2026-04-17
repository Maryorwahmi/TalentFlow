/**
 * Custom hooks for course operations
 * Created by CaptainCode
 */

import { useState, useEffect } from 'react';
import { coursesAPI } from '@/shared/api/client';

/**
 * Hook for enrolling in a course
 */
export function useEnrollCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enroll = async (courseId: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.enrollCourse(courseId);
      return response.data?.data || response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.meta?.message || err.message || 'Failed to enroll in course';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { enroll, loading, error };
}

/**
 * Hook to fetch course list
 */
export function useListCourses(filters = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.listCourses(filters);
      setData(response.data?.data || response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  return { data, loading, error, refetch: fetchCourses };
}

/**
 * Hook to fetch single course detail
 */
export function useGetCourse(courseId: string | number | null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.getCourseDetail(courseId);
      setData(response.data?.data || response.data);
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Failed to fetch course');
      console.error('Error fetching course detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when courseId changes
  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  return { data, loading, error, refetch: fetchCourse };
}

/**
 * Hook to check enrollment status
 */
export function useCheckEnrollment(courseId: string | number | null) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.checkEnrollment(courseId);
      setIsEnrolled(response.data?.data?.isEnrolled || false);
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Failed to check enrollment');
      setIsEnrolled(false);
    } finally {
      setLoading(false);
    }
  };

  // Check on mount and when courseId changes
  useEffect(() => {
    checkStatus();
  }, [courseId]);

  return { isEnrolled, loading, error, refetch: checkStatus };
}
