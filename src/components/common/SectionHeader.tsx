import React from 'react';

interface SectionHeaderProps {
  heading: string;
  quote: string;
  description: string;
  actionRight?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  heading,
  quote,
  description,
  actionRight,
  className = '',
}) => {
  return (
    <div className={`mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${className}`}>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight flex flex-wrap items-center gap-2">
          <span>{heading}</span>
          <span className="text-gray-400 font-normal">—</span>
          <span className="italic text-gray-500 font-normal font-serif">"{quote}"</span>
        </h2>
        <p className="mt-1 text-sm text-gray-500 font-normal">
          {description}
        </p>
      </div>
      {actionRight && (
        <div className="shrink-0">
          {actionRight}
        </div>
      )}
    </div>
  );
};
