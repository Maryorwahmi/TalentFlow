/**
 * Custom hooks for search functionality across different roles
 * Created by CaptainCode
 */

import { useMemo } from 'react';

/**
 * Normalize search string for comparison
 */
const normalizeSearch = (text: string): string => {
  return text.toLowerCase().trim();
};

/**
 * Hook to handle admin search across users, teams, and courses
 */
export function useAdminSearch(
  users: any[] = [],
  teams: any[] = [],
  courses: any[] = [],
  searchQuery: string = ''
) {
  const normalized = normalizeSearch(searchQuery);

  return useMemo(() => {
    if (!normalized) {
      return { users, teams, courses };
    }

    const filteredUsers = users.filter(user =>
      (user.name || '').toLowerCase().includes(normalized) ||
      (user.email || '').toLowerCase().includes(normalized) ||
      (user.role || '').toLowerCase().includes(normalized)
    );

    const filteredTeams = teams.filter(team =>
      (team.name || '').toLowerCase().includes(normalized) ||
      (team.code || '').toLowerCase().includes(normalized) ||
      (team.detail || '').toLowerCase().includes(normalized)
    );

    const filteredCourses = courses.filter(course =>
      (course.title || '').toLowerCase().includes(normalized) ||
      (course.description || '').toLowerCase().includes(normalized) ||
      (course.code || '').toLowerCase().includes(normalized)
    );

    return { users: filteredUsers, teams: filteredTeams, courses: filteredCourses };
  }, [users, teams, courses, normalized]);
}

/**
 * Hook to handle instructor search across courses, lessons, and learners
 */
export function useInstructorSearch(
  courses: any[] = [],
  lessons: any[] = [],
  learners: any[] = [],
  searchQuery: string = ''
) {
  const normalized = normalizeSearch(searchQuery);

  return useMemo(() => {
    if (!normalized) {
      return { courses, lessons, learners };
    }

    const filteredCourses = courses.filter(course =>
      (course.title || '').toLowerCase().includes(normalized) ||
      (course.description || '').toLowerCase().includes(normalized) ||
      (course.category || '').toLowerCase().includes(normalized)
    );

    const filteredLessons = lessons.filter(lesson =>
      (lesson.title || '').toLowerCase().includes(normalized) ||
      (lesson.description || '').toLowerCase().includes(normalized) ||
      (lesson.topic || '').toLowerCase().includes(normalized)
    );

    const filteredLearners = learners.filter(learner =>
      (learner.name || '').toLowerCase().includes(normalized) ||
      (learner.email || '').toLowerCase().includes(normalized)
    );

    return { courses: filteredCourses, lessons: filteredLessons, learners: filteredLearners };
  }, [courses, lessons, learners, normalized]);
}

/**
 * Hook to handle learner search across courses, assignments, and team members
 */
export function useLearnerSearch(
  courses: any[] = [],
  assignments: any[] = [],
  teamMembers: any[] = [],
  searchQuery: string = ''
) {
  const normalized = normalizeSearch(searchQuery);

  return useMemo(() => {
    if (!normalized) {
      return { courses, assignments, teamMembers };
    }

    const filteredCourses = courses.filter(course =>
      (course.title || '').toLowerCase().includes(normalized) ||
      (course.description || '').toLowerCase().includes(normalized) ||
      (course.category || '').toLowerCase().includes(normalized)
    );

    const filteredAssignments = assignments.filter(assignment =>
      (assignment.title || '').toLowerCase().includes(normalized) ||
      (assignment.description || '').toLowerCase().includes(normalized) ||
      (assignment.course || '').toLowerCase().includes(normalized)
    );

    const filteredTeamMembers = teamMembers.filter(member =>
      (member.name || '').toLowerCase().includes(normalized) ||
      (member.email || '').toLowerCase().includes(normalized)
    );

    return { courses: filteredCourses, assignments: filteredAssignments, teamMembers: filteredTeamMembers };
  }, [courses, assignments, teamMembers, normalized]);
}

/**
 * Hook to handle generic array search
 */
export function useArraySearch<T extends { [key: string]: any }>(
  items: T[] = [],
  searchQuery: string = '',
  searchFields: (keyof T)[] = []
): T[] {
  const normalized = normalizeSearch(searchQuery);

  return useMemo(() => {
    if (!normalized || searchFields.length === 0) {
      return items;
    }

    return items.filter(item =>
      searchFields.some(field =>
        String(item[field] || '').toLowerCase().includes(normalized)
      )
    );
  }, [items, normalized, searchFields]);
}
