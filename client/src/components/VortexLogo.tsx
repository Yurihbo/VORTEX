interface VortexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VortexLogo({ size = 'md', className = '' }: VortexLogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${sizes[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer spiral circle */}
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      
      {/* Spiral path */}
      <path
        d="M 50 10 Q 75 25 75 50 Q 75 75 50 75 Q 25 75 25 50 Q 25 30 45 25"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Inner spiral */}
      <path
        d="M 50 30 Q 65 40 65 50 Q 65 60 50 65"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      
      {/* Center dragon eye */}
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      <circle cx="50" cy="50" r="2.5" fill="white" opacity="0.8" />
      
      {/* Decorative rune elements */}
      <path
        d="M 50 38 L 50 62"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
      <path
        d="M 38 50 L 62 50"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  );
}
