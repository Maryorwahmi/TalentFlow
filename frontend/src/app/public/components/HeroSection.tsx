interface HeroSectionProps {
  title: string;
  highlightedWord: string;
  description: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  imageSrc: string;
  imageAlt?: string;
  stats?: Array<{ label: string; value: string }>;
  trustedText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export const HeroSection = ({
  title,
  highlightedWord,
  description,
  ctaPrimaryText,
  ctaSecondaryText,
  imageSrc,
  imageAlt = 'Hero image',
  stats = [
    { label: 'Active Learners', value: '50+' },
    { label: 'Disciplines', value: '6' },
    { label: 'Courses Available', value: '8' },
    { label: 'User Roles', value: '3' },
    { label: 'Certificate on Completion', value: '100%' },
  ],
  trustedText = 'Trusted by Trueminds Innovations',
  onPrimaryClick,
  onSecondaryClick,
}: HeroSectionProps) => {
  const titleParts = title.split(highlightedWord);

  return (
    <section className="min-h-screen w-full bg-white px-4 sm:px-6 py-12 sm:py-20 text-[#0D1442]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center gap-8 sm:gap-12 md:flex-row md:py-16">
        <div className="flex-1 space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight">
            {titleParts[0]}
            <span className="text-orange-500">{highlightedWord}</span>
            {titleParts[1]}
          </h1>

          <p className="max-w-md text-base sm:text-lg leading-relaxed text-gray-600">{description}</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-4">
            <button
              onClick={onPrimaryClick}
              type="button"
              className="w-full sm:w-auto rounded-md bg-[#0D1442] px-5 py-3 sm:py-2 font-semibold text-white text-sm sm:text-base transition-all hover:bg-opacity-90"
            >
              {ctaPrimaryText}
            </button>

            <button
              onClick={onSecondaryClick}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 rounded-md border-2 border-gray-300 px-5 py-3 sm:py-2 font-semibold text-sm sm:text-base text-[#0D1442] transition-all hover:bg-gray-50"
            >
              <span className="text-xs">▶</span> {ctaSecondaryText}
            </button>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="overflow-hidden rounded-3xl shadow-xl">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-[250px] sm:h-[389px] w-full object-cover"
            />
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="mt-12 w-full py-8">
          <div className="mx-auto max-w-7xl px-6 flex flex-nowrap items-center justify-between overflow-x-auto lg:overflow-visible">
            <div className="mr-8 whitespace-nowrap">
              <p className="text-sm font-medium">{trustedText}</p>
            </div>

            <div className="flex items-center">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center px-6 text-center ${
                    index !== 0 ? 'border-l border-gray-200' : ''
                  }`}
                >
                  <span className="text-2xl font-bold leading-none">{stat.value}</span>
                  <span className="mt-2 whitespace-nowrap text-[12px] font-medium tracking-widest">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
