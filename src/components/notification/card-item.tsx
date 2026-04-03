import React, { useState } from 'react';

interface CardItemProps {
    title: string;
    // ... other card item props
}

const CardItem: React.FC<CardItemProps> = ({ title, ...rest }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleMouseEnter = () => {
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <div
            className="relative flex flex-col rounded-md shadow-md bg-white p-4 cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...rest} // Pass other props to the card item
        >
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {/* ... Other card item content */}

            {showTooltip && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 z-10 bg-white rounded-md shadow-md px-4 py-2">
                    <ul className="space-y-2">
                        <li>
                            <button
                                className="block w-full px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Edit
                            </button>
                        </li>
                        <li>
                            <button
                                className="block w-full px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Delete
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CardItem;