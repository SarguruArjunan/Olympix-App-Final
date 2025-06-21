import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  label = 'Back to Sports', 
  className = '',
  showIcon = true 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`
        inline-flex items-center gap-2 px-4 py-2 mb-6
        bg-white text-primary border-2 border-primary
        font-semibold rounded-lg
        hover:bg-primary hover:text-white
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        ${className}
      `}
      aria-label={label}
      type="button"
    >
      {showIcon && (
        <svg
          className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
};

export default BackButton;