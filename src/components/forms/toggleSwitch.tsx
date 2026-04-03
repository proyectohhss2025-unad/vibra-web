import React, { useEffect, useState } from 'react';

interface ToggleSwitchProps<T> {
    label: string;
    className?: string;
    initialValue: boolean;
    handleChange: (value: T) => void;
    locked?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps<any>> = ({ label, initialValue, handleChange, className, locked = false }) => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        setEnabled(initialValue);
    }, [initialValue, enabled]);

    return (
        <div className={`flex items-center ${className}`} >
            {label && <label htmlFor="flex-checkbox" className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-300 mr-2">
                {label}
            </label>
            }
            <div className="flex items-center justify-center">
                <div
                    className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer ${enabled ? 'bg-green-600' : 'bg-gray-400'
                        }`}
                    onClick={(e) => {
                        if (!locked) {
                            handleChange(!enabled);
                        }
                    }}
                >
                    {/* Circle */}
                    <div
                        className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${enabled ? 'translate-x-8' : 'translate-x-0'
                            }`}
                    ></div>
                </div>
            </div>
        </div >
    );
};

export default ToggleSwitch;