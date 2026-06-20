import React from 'react';

export const StarIcon: React.FC<{ isFilled: boolean }> = ({ isFilled }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-7 w-7 transition-colors duration-200 ${isFilled ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-300'}`}
        viewBox="0 0 24 24" 
        fill={isFilled ? "currentColor" : "none"}
        stroke="currentColor" 
        strokeWidth={isFilled ? 0 : 1.5}
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

export const ResetIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0114.13-5.22M20 15a9 9 0 01-14.13 5.22" />
    </svg>
);

export const UserPlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 8h-4m2 2v-4" />
    </svg>
);

export const BrainCircuitIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 5a3 3 0 1 0-5.993.129"/><path d="M12 5a3 3 0 1 0 5.993.129"/><path d="M15 13a3 3 0 1 0-5.993.129"/><path d="M12 11.5A2.5 2.5 0 0 1 9.5 9"/><path d="M12 11.5A2.5 2.5 0 0 0 14.5 9"/><path d="M12 14.5A2.5 2.5 0 0 1 9.5 17"/><path d="M12 14.5A2.5 2.5 0 0 0 14.5 17"/><path d="M12 8.5A2.5 2.5 0 0 1 9.5 6"/><path d="M12 8.5A2.5 2.5 0 0 0 14.5 6"/><path d="M12 17.5a2.5 2.5 0 0 1-2.5-2.5"/><path d="M12 17.5a2.5 2.5 0 0 0 2.5-2.5"/><path d="M12 19a1 1 0 1 0-2 0 1 1 0 1 0 2 0"/><path d="M12 19a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/><path d="M17 13a1 1 0 1 0-2 0 1 1 0 1 0 2 0"/><path d="M17 13a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/><path d="M7 13a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/><path d="M7 13a1 1 0 1 0-2 0 1 1 0 1 0 2 0"/><path d="M17 8a1 1 0 1 0-2 0 1 1 0 1 0 2 0"/><path d="M17 8a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/><path d="M7 8a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/><path d="M7 8a1 1 0 1 0-2 0 1 1 0 1 0 2 0"/><path d="M12 5a1 1 0 1 0-2 0 1 1 0 1 0 2 0"/><path d="M12 5a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/></svg>
);

export const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
);

export const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-yellow-400"><path d="m12 3-1.9 5.8-5.6.8 4.1 4-1 5.7L12 16l5.3 2.8-1-5.7 4.1-4-5.6-.8z"/></svg>
);

export const HistoryIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);

export const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const XCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const InfoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);