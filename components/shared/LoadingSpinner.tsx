
import React from 'react';

const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={`animate-spin rounded-full h-12 w-12 border-b-2 border-primary ${className}`}
    ></div>
  );
};

export default LoadingSpinner;
