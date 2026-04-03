import { User } from '@/models/user.entity';
import React, { useRef, useState } from 'react';
import { EventsType, PlacesType, Tooltip } from 'react-tooltip';
import { twMerge } from 'tailwind-merge';
import 'react-tooltip/dist/react-tooltip.css'

interface TooltipProps {
    children: React.ReactNode;
    tooltipContent: string;
    placement?: PlacesType;
    trigger?: EventsType;
    user: User;
}

const TooltipComponent: React.FC<TooltipProps> = ({ children, tooltipContent, placement = 'top', trigger = 'hover', user }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<any>(null);

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    //const c = twMerge('flex items-center py-2', user.id % 2 === 0 ? 'bg-gray-100' : 'bg-white'

    type CustomClassNameArray = any & { hidden?: boolean };

    const c: CustomClassNameArray = twMerge('flex items-center py-2', Number.parseInt(user?.documentNumber) % 2 === 0 ? 'bg-gray-100' : 'bg-white', Number.parseInt(user?.documentNumber) % 2 === 0 ? 'hidden' : undefined);

    return (
        <div>
            {children}
            {isVisible && (
                <Tooltip
                    id="my-tooltip"
                    ref={tooltipRef}
                    place={placement}
                    arrowColor="gray"
                    className={c}
                >
                    <div data-tooltip-id="my-tooltip" data-tooltip-content="Hello world!">{tooltipContent}</div>
                </Tooltip>
            )}
        </div>
    );
};

export default TooltipComponent;
