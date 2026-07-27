'use client';

import { getAvatarUrl } from '@/utils/avatar';
import { useState } from 'react';

interface Props {
  avatar?: string | null;
  name: string;
  className?: string;
  gradient?: string;
  ringHover?: string;
}

const SafeAvatar: React.FC<Props> = ({
  avatar,
  name,
  className = 'w-8 h-8',
  gradient = 'from-blue-400 to-purple-500',
  ringHover = 'hover:ring-blue-300',
}) => {
  const [imgError, setImgError] = useState(false);

  const imgClasses = [className, 'rounded-full', 'flex-shrink-0', 'object-cover', 'ring-2', 'ring-white', ringHover, 'transition-all'].filter(Boolean).join(' ');
  const fallbackClasses = [className, 'rounded-full', 'bg-gradient-to-br', gradient, 'flex', 'items-center', 'justify-center', 'font-bold', 'text-white', 'flex-shrink-0', 'ring-2', 'ring-white', ringHover, 'transition-all'].filter(Boolean).join(' ');

  if (avatar && !imgError) {
    return (
      <img
        src={getAvatarUrl(avatar)}
        alt=""
        className={imgClasses}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={fallbackClasses}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

export default SafeAvatar;
