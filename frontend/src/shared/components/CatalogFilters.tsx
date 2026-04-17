import { useState } from 'react';
import { X } from 'lucide-react';

export interface CatalogFiltersState {
  searchQuery: string;
  categories: string[];
  levels: string[];
  duration: { min: number; max: number } | null;
  minRating: number;
}

interface CatalogFiltersProps {
  filters: CatalogFiltersState;
  onFiltersChange: (filters: CatalogFiltersState) => void;
  courseCategories: string[];
}

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const DURATION_RANGES = [
  { label: 'Under 10 hours', min: 0, max: 10 },
  { label: '10-20 hours', min: 10, max: 20 },
  { label: '20-40 hours', min: 20, max: 40 },
  { label: '40+ hours', min: 40, max: 999 },
];
const RATING_OPTIONS = [5, 4, 3];

export function CatalogFilters({
  filters,
  onFiltersChange,
  courseCategories,
}: CatalogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryToggle = (category: string) => {
    const updated = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: updated });
  };

  const handleLevelToggle = (level: string) => {
    const updated = filters.levels.includes(level)
      ? filters.levels.filter((l) => l !== level)
      : [...filters.levels, level];
    onFiltersChange({ ...filters, levels: updated });
  };

  const handleDurationChange = (range: { min: number; max: number } | null) => {
    onFiltersChange({ ...filters, duration: range });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ ...filters, minRating: filters.minRating === rating ? 0 : rating });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      categories: [],
      levels: [],
      duration: null,
      minRating: 0,
    });
  };

  const activeFiltersCount = [
    ...filters.categories,
    ...filters.levels,
    ...(filters.duration ? ['duration'] : []),
    ...(filters.minRating > 0 ? ['rating'] : []),
  ].length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search courses..."
          value={filters.searchQuery}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              searchQuery: e.target.value,
            })
          }
          className="w-full rounded-lg border border-[#d8dcee] bg-white px-4 py-3 text-sm outline-none focus:border-[#001d4c] focus:ring-2 focus:ring-[#001d4c] focus:ring-opacity-20 transition"
        />
        <span className="absolute right-3 top-3 text-[#7a80a9]">🔍</span>
      </div>

      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full rounded-lg border border-[#d8dcee] bg-white px-4 py-2 text-sm font-semibold text-[#1d245d] flex items-center justify-between hover:bg-[#f9fafb]"
      >
        <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Filters Panel */}
      <div
        className={`space-y-6 md:space-y-6 md:block ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        {/* Categories */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#1d245d] uppercase tracking-wide">
            Category
          </h3>
          <div className="space-y-2">
            {courseCategories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="w-4 h-4 rounded border-[#d8dcee] cursor-pointer accent-[#001d4c]"
                />
                <span className="text-sm text-[#4f5b93] group-hover:text-[#1d245d]">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Levels */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#1d245d] uppercase tracking-wide">
            Level
          </h3>
          <div className="space-y-2">
            {LEVEL_OPTIONS.map((level) => (
              <label
                key={level}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.levels.includes(level)}
                  onChange={() => handleLevelToggle(level)}
                  className="w-4 h-4 rounded border-[#d8dcee] cursor-pointer accent-[#001d4c]"
                />
                <span className="text-sm text-[#4f5b93] group-hover:text-[#1d245d]">
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#1d245d] uppercase tracking-wide">
            Duration
          </h3>
          <div className="space-y-2">
            {DURATION_RANGES.map((range) => (
              <label
                key={range.label}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="duration"
                  checked={
                    filters.duration?.min === range.min &&
                    filters.duration?.max === range.max
                  }
                  onChange={() => handleDurationChange(range)}
                  className="w-4 h-4 rounded-full border-[#d8dcee] cursor-pointer accent-[#001d4c]"
                />
                <span className="text-sm text-[#4f5b93] group-hover:text-[#1d245d]">
                  {range.label}
                </span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="duration"
                checked={filters.duration === null}
                onChange={() => handleDurationChange(null)}
                className="w-4 h-4 rounded-full border-[#d8dcee] cursor-pointer accent-[#001d4c]"
              />
              <span className="text-sm text-[#4f5b93] group-hover:text-[#1d245d]">
                Any duration
              </span>
            </label>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#1d245d] uppercase tracking-wide">
            Rating
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === 0}
                onChange={() => handleRatingChange(0)}
                className="w-4 h-4 rounded-full border-[#d8dcee] cursor-pointer accent-[#001d4c]"
              />
              <span className="text-sm text-[#4f5b93] group-hover:text-[#1d245d]">
                All ratings
              </span>
            </label>
            {RATING_OPTIONS.map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="w-4 h-4 rounded-full border-[#d8dcee] cursor-pointer accent-[#001d4c]"
                />
                <span className="text-sm text-[#4f5b93] group-hover:text-[#1d245d]">
                  {rating}⭐ & up
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="w-full rounded-lg border border-[#d8dcee] px-3 py-2 text-sm font-semibold text-[#001d4c] hover:bg-[#f9fafb] transition flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
