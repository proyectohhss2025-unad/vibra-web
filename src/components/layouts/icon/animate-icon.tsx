import React from 'react';
import "./animate-icon.css";
import DynamicHeroIcon from './icon-dinamic';

const AnimatedIcon: React.FC<{ icon: string, itemMenuChildProps: any }> = ({ icon, itemMenuChildProps }) => {
    return (
        <div className="relative flex items-center mr-2.5">
            <svg
                id={icon}
                className="h-8 w-8"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <DynamicHeroIcon {...itemMenuChildProps} />
            </svg>
        </div>
    );
};

export default AnimatedIcon;