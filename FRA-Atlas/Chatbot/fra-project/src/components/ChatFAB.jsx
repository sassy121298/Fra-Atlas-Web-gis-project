import TreeBot from "./TreeBot.jsx";

export default function ChatFAB({ onClick, hasUnread }) {
    return (
        <button
            onClick={onClick}
            className="fab-enter relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{ background: "#15803d" }}
            title="Open Forest Rights Assistant"
        >
            {/* Pulse ring */}
            <span className="pulse-ring" />

            <TreeBot size={44} />

            {/* Unread dot */}
            {hasUnread && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
        </button>
    );
}
