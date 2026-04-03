import React from 'react';

interface TooltipProps {
    children: React.ReactNode;
    tooltipText: string;
    placement?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
    arrowSize?: number;
    arrowColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    boxShadow?: string;
    padding?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
    children,
    tooltipText,
    placement = 'top',
    className = '',
    arrowSize = 10,
    arrowColor = 'rgba(0, 0, 0, 0.2)',
    backgroundColor = 'rgba(0, 0, 0, 0.8)',
    textColor = '#fff',
    borderRadius = 4,
    boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)',
    padding = '10px',
}) => {
    return (
        <div>
            <span
                data-tip={tooltipText}
                data-for="custom-tooltip"
                data-place={placement}
                className={`tooltip-container ${className}`}
                style={{
                    backgroundColor,
                    color: textColor,
                    padding,
                    borderRadius,
                    boxShadow,
                }}
            >
                {children}
            </span>
            {/*<ReactTooltip
                id="custom-tooltip"
                effect="solid"
                className={`tooltip-content ${className}`}
                arrowSize={arrowSize}
                arrowColor={arrowColor}
                backgroundColor={backgroundColor}
                textColor={textColor}
                borderRadius={borderRadius}
                boxShadow={boxShadow}
            />*/}
        </div>
    );
};

export default Tooltip;