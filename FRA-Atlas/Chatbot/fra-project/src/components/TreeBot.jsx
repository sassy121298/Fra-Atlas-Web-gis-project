export default function TreeBot({ size = 40, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Background circle */}
            <circle cx="40" cy="40" r="40" fill="#15803d" />

            {/* Tree trunk */}
            <rect x="35" y="52" width="10" height="16" rx="3" fill="#a16207" />

            {/* Bottom layer of tree */}
            <ellipse cx="40" cy="52" rx="18" ry="10" fill="#16a34a" />

            {/* Middle layer */}
            <ellipse cx="40" cy="42" rx="14" ry="9" fill="#22c55e" />

            {/* Top layer */}
            <ellipse cx="40" cy="33" rx="10" ry="8" fill="#4ade80" />

            {/* Tip */}
            <ellipse cx="40" cy="26" rx="6" ry="5" fill="#86efac" />

            {/* Eyes */}
            <circle cx="34" cy="40" r="3" fill="white" />
            <circle cx="46" cy="40" r="3" fill="white" />
            <circle cx="35" cy="40" r="1.5" fill="#14532d" />
            <circle cx="47" cy="40" r="1.5" fill="#14532d" />

            {/* Smile */}
            <path
                d="M34 46 Q40 50 46 46"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}
