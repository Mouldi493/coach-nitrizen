
import React from 'react';

export const MicIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

export const StopCircleIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="12" cy="12" r="10"/>
        <rect width="6" height="6" x="9" y="9"/>
    </svg>
);

export const NutritionIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M8.5 2.18a.5.5 0 0 0-1 0L3.55 6.4a.5.5 0 0 0 .45.7H10Z"/>
        <path d="M15.5 2.18a.5.5 0 0 1 1 0l3.95 4.22a.5.5 0 0 1-.45.7H14Z"/>
        <path d="M11 6.81a.5.5 0 0 0-1 0L5.86 11.4a.5.5 0 0 0 .44.7H11Z"/>
        <path d="m18.14 11.4-.29.3a.5.5 0 0 0 0 .6l.29.3a.5.5 0 0 0 .7 0l.29-.3a.5.5 0 0 0 0-.6l-.29-.3a.5.5 0 0 0-.7 0Z"/>
        <path d="M13 6.81a.5.5 0 0 1 1 0l4.14 4.59a.5.5 0 0 1-.44.7H13Z"/>
        <path d="M12 12.5a.5.5 0 0 0-1 0l-4.14 4.59a.5.5 0 0 0 .44.7H11Z"/>
        <path d="M13 12.5a.5.5 0 0 1 1 0l4.14 4.59a.5.5 0 0 1-.44.7H13Z"/>
        <path d="M10.83 22a.5.5 0 0 0-1 0l-2.9 2.9a.5.5 0 0 0 .35.85H11Z"/>
        <path d="M14.17 22a.5.5 0 0 1 1 0l2.9 2.9a.5.5 0 0 1-.35.85H13Z"/>
    </svg>
);

export const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);

export const AlertTriangleIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
);

export const LightbulbIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
        <path d="M9 18h6"/>
        <path d="M10 22h4"/>
    </svg>
);

export const TrashIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);
