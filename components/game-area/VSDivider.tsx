import type { FC } from 'react';

const VSDivider: FC = () => {
  return (
    <div className="flex justify-center relative">
      <div className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 text-transparent bg-clip-text animate-pulse">
        VS
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-red-400/20 to-pink-400/20 rounded-full blur-xl scale-150 animate-pulse" />
    </div>
  );
};

export default VSDivider;
