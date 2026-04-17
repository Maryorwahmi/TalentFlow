import { useNavigate } from 'react-router-dom';
import { useAsyncResource } from '@/shared/api/live';
import { coursesAPI } from '@/shared/api/client';
import { useState } from 'react';

export const CourseCatalog = ({ featured = true }: { featured?: boolean }) => {
  const navigate = useNavigate();
  const { data } = useAsyncResource(() => coursesAPI.listCourses(), []);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  
  // Ensure data is always an array
  const courses = (() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.courses)) return data.courses;
    if (Array.isArray(data.data)) return data.data;
    return [];
  })();
  
  const list = featured ? courses.slice(0, 3) : courses;

  // Get course image based on index
  const getCourseImageUrl = (index: number, course: any) => {
    // First, check if course has an image property
    if (course.image) return course.image;
    if (course.imageUrl) return course.imageUrl;
    if (course.courseThumbnail) return course.courseThumbnail;
    
    // Otherwise, use numbered image based on position
    return `/images/courses/course-${(index % 3) + 1}.jpg`;
  };

  const handleImageError = (courseId: string) => {
    setImageErrors(prev => ({ ...prev, [courseId]: true }));
  };

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">Featured Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {list.map((c: any, index: number) => {
            const hasImageError = imageErrors[c.id];
            const imageUrl = getCourseImageUrl(index, c);
            
            return (
              <div 
                key={c.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1"
              >
                {/* Course Image Container */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-[#07107b] via-[#18308f] to-[#f08a2c]">
                  {!hasImageError ? (
                    <img
                      src={imageUrl}
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      onError={() => handleImageError(c.id)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#07107b] via-[#18308f] to-[#f08a2c]">
                      <div className="text-center text-white">
                        <div className="text-4xl mb-2">📚</div>
                        <p className="text-sm">{c.title}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Course Badge */}
                  {c.level && (
                    <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-3 py-1 rounded-full text-xs font-semibold text-[#000066]">
                      {c.level}
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {c.description}
                  </p>
                  
                  {/* Course Meta */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    {c.instructor && (
                      <span>👨‍🏫 {c.instructor}</span>
                    )}
                    {c.enrollmentCount && (
                      <span>👥 {c.enrollmentCount} students</span>
                    )}
                  </div>

                  {/* Explore Button */}
                  <button
                    onClick={() => navigate(`/catalog/${c.id}`)}
                    className="w-full bg-[#000066] text-white px-4 py-2 rounded-lg hover:bg-[#000044] transition-colors duration-200 font-semibold"
                  >
                    Explore Course
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CourseCatalog;
