import React, { useEffect, useState } from 'react';
import "./animate-icon.css";
import DynamicHeroIcon from './icon-dinamic';

const AnimatedIcon: React.FC<{ icon: string, itemMenuChildProps: any }> = ({ icon, itemMenuChildProps }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    useEffect(() => {
        const animation = isHovered
            ? `animate-neon-glow-slow` // Animation class
            : '';
        const iconElement = document.getElementById(icon);
        if (iconElement) {
            iconElement.setAttribute(
                'class',
                `h-6 w-7 transition duration-500 ease-in-out ${animation}`
            );
        }
    }, [isHovered]);

    return (
        <div
            className="relative flex items-center mr-2.5"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <svg
                id={icon} // Unique ID for the icon
                className="h-8 w-8 transition duration-300 ease-in-out"
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