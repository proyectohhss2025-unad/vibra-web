interface WaveDividerProps {
  color?: string;
}

export default function WaveDivider({ color = '#f0f7fa' }: WaveDividerProps) {
  return (
    <div className="w-full overflow-hidden leading-none">
      <svg
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-[40px] md:h-[60px]"
        preserveAspectRatio="none"
      >
        <path
          d="M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30V60H0V30Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
