import React, { useState } from 'react';
import * as SolidIcons from '@heroicons/react/solid';
import * as OutlineIcons from '@heroicons/react/outline';
import { twMerge } from 'tailwind-merge';

enum IconType {
  outline = 'outline',
  solid = 'solid',
}

interface DynamicHeroIconProps {
  icon: string;
  type?: IconType;
  className?: string;
  color?: string;
  handler?: () => {};
  name?: string;
  style?: any;
}

const DynamicHeroIcon: React.FC<DynamicHeroIconProps> = ({ icon, type = 'outline', className, color = "#FFFFFF", handler, name, style }) => {
  const [IconComponent, setIconComponent] = useState<React.FC<React.SVGAttributes<SVGElement>>>(() => {
    const icons = type === 'outline' ? OutlineIcons : SolidIcons;
    return icons[icon];
  });

  const c = twMerge('h-6 w-6 text-black', className);

  return <IconComponent className={c} aria-hidden="true" style={style} name={name} color={color} onClick={handler} />;
};

export default DynamicHeroIcon;