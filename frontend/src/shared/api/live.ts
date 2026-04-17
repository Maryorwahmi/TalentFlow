import { useCallback, useEffect, useRef, useState } from 'react';

export function unwrapData<T = any>(response: any): T {
  // If it's not an object or doesn't have a data property, return as is
  if (response && typeof response === 'object' && !('data' in response)) {
    return response as T;
  }

  const data = response?.data?.data;

  if (!data) {
    return response?.data as T;
  }

  // Admin dashboard has users.total, courses.published, enrollments.total, activeUsers.todayActive
  if (data.users?.total !== undefined && data.courses?.published !== undefined && data.enrollments?.total !== undefined) {
    return data as T;
  }

  // Dashboard responses have both courses and pendingAssignments
  if (data.courses && data.pendingAssignments && data.progress && data.certificatesIssued !== undefined) {
    return data as T;
  }

  if (data.dashboard) {
    return data.dashboard as T;
  }

  if (data.announcements) {
    return data.announcements as T;
  }

  if (data.channels) {
    return data.channels as T;
  }

  if (data.channel) {
    return data.channel as T;
  }

  if (data.messages) {
    return data.messages as T;
  }

  if (data.message) {
    return data.message as T;
  }

  if (data.teams) {
    return data.teams as T;
  }

  if (data.team) {
    return data.team as T;
  }

  if (data.members) {
    return data.members as T;
  }

  if (data.notifications) {
    return data.notifications as T;
  }

  // Check for users list before returning entire data
  if (Array.isArray(data.users)) {
    return data.users as T;
  }

  if (data.users && typeof data.users === 'object' && !Array.isArray(data.users)) {
    // This is likely the admin dashboard or user detail
    return data as T;
  }

  if (data.user) {
    return data.user as T;
  }

  if (data.course) {
    return data.course as T;
  }

  if (data.courses) {
    if (data.pagination) {
      return data as T;
    }
    return data.courses as T;
  }

  if (data.modules) {
    return data.modules as T;
  }

  if (data.lessons) {
    return data.lessons as T;
  }

  if (data.quizzes) {
    return data.quizzes as T;
  }

  if (data.metrics) {
    return data.metrics as T;
  }

  // Platform analytics/metrics with totalUsers, totalCourses, totalTeams, totalMessages
  if (data.totalUsers !== undefined && data.totalCourses !== undefined) {
    return data as T;
  }

  if (data.analytics) {
    return data.analytics as T;
  }

  if (data.logs) {
    return data.logs as T;
  }

  if (data.settings) {
    return data.settings as T;
  }

  if (data.preferences) {
    return data.preferences as T;
  }

  if (data.progress) {
    return data.progress as T;
  }

  if (data.assignment) {
    return data.assignment as T;
  }

  if (data.submission) {
    return data.submission as T;
  }

  if (data.certificate) {
    return data.certificate as T;
  }

  return data as T;
}

export function formatDate(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function useAsyncResource<T = any>(loader: () => Promise<any>, initialValue: any) {
  const [data, setData] = useState<any>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await loaderRef.current();
      setData(unwrapData<T>(response));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.meta?.message || err.message || 'Something went wrong';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, setData, loading, error, refetch };
}
