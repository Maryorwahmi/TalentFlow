import { Star } from 'lucide-react';
import { getCourseVisual } from '@/shared/utils/courseVisuals';

interface EnhancedCourseCardProps {
  id: string | number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  instructorName: string;
  rating?: number;
  reviewCount?: number;
  enrollmentCount?: number;
  isBestseller?: boolean;
  progress?: number;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  onViewDetails: () => void;
}

export function EnhancedCourseCard({
  title,
  description,
  category,
  level,
  duration,
  instructorName,
  rating = 0,
  reviewCount = 0,
  enrollmentCount = 0,
  isBestseller = false,
  progress = 0,
  isEnrolled = false,
  onEnroll,
  onViewDetails,
}: EnhancedCourseCardProps) {
  const visual = getCourseVisual(category);
  const levelColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-purple-100 text-purple-700',
  };
  const levelColor = levelColors[level?.toLowerCase() as keyof typeof levelColors] || levelColors.beginner;

  return (
    <div className="rounded-xl border border-[#e0e4ec] bg-white overflow-hidden hover:shadow-lg transition-shadow">
      {/* Course Image */}
      <div
        className={`h-40 ${visual.bgColor} flex items-center justify-center text-6xl relative cursor-pointer hover:opacity-90 transition`}
        onClick={onViewDetails}
      >
        {visual.icon}
        {isBestseller && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold">
            ⭐ BESTSELLER
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-4 space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${levelColor}`}>
            {level}
          </span>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#f0f2f7] text-[#1d245d]">
            {duration}h
          </span>
        </div>

        {/* Title */}
        <div>
          <h3
            className="text-[15px] font-bold text-[#001d4c] line-clamp-2 cursor-pointer hover:text-[#2f3d8c]"
            onClick={onViewDetails}
          >
            {title}
          </h3>
        </div>

        {/* Instructor */}
        <p className="text-[11px] text-[#7a80a9] font-medium">by {instructorName}</p>

        {/* Description */}
        <p className="text-[12px] text-[#6a7199] line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Rating & Enrollment */}
        <div className="flex items-center justify-between pt-2 border-t border-[#e0e4ec]">
          <div className="flex items-center gap-1">
            {rating > 0 ? (
              <>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-[#d8dcee]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-[#1d245d]">
                  {rating.toFixed(1)}
                </span>
                <span className="text-[10px] text-[#7a80a9]">
                  ({reviewCount})
                </span>
              </>
            ) : (
              <span className="text-[10px] text-[#7a80a9]">No reviews yet</span>
            )}
          </div>
          <span className="text-[10px] text-[#7a80a9] font-medium">
            {enrollmentCount} students
          </span>
        </div>

        {/* Progress Bar */}
        {isEnrolled && progress > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#1d245d]">
                Progress
              </span>
              <span className="text-[10px] font-semibold text-[#1d245d]">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-[#e0e4ec] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#001d4c] to-[#2f3d8c] h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onViewDetails}
            className="flex-1 rounded-lg border border-[#001d4c] text-[12px] font-bold text-[#001d4c] px-3 py-2 hover:bg-[#f9fafb] transition"
          >
            View Details
          </button>
          {!isEnrolled && (
            <button
              onClick={onEnroll}
              className="flex-1 rounded-lg bg-[#001d4c] text-[12px] font-bold text-white px-3 py-2 hover:bg-[#002058] transition"
            >
              Enroll Now
            </button>
          )}
          {isEnrolled && (
            <button
              onClick={onViewDetails}
              className="flex-1 rounded-lg bg-[#001d4c] text-[12px] font-bold text-white px-3 py-2 hover:bg-[#002058] transition"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
