import { useState, useRef, useEffect } from "react";
import { X, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";
import TreeBot from "./TreeBot.jsx";
import MessageBubble from "./MessageBubble.jsx";
import QuestionBrowser from "./QuestionBrowser.jsx";
import SectionModal from "./SectionModal.jsx";
import { RESPONSES } from "../data/fra.js";

const WELCOME = {
    id: "welcome",
    role: "bot",
    type: "text",
    answer: "Namaste! 🌿 I'm your **Forest Rights Act Assistant**. I can help you understand your rights under the FRA 2006 — eligibility, claim procedures, Gram Sabha, appeals, and more.\n\nSelect a question below to get started.",
    explanation: "",
    sections: [],
    suggestions: []
};

export default function ChatWidget({ onClose }) {
    const [messages, setMessages] = useState([WELCOME]);
    const [activeSection, setActiveSection] = useState(null);
    const [showQuestions, setShowQuestions] = useState(true);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function handleQuestionSelect(question) {
        // Add user message
        const userMsg = { id: Date.now(), role: "user", text: question.text };
        setMessages(prev => [...prev, userMsg]);
        setShowQuestions(false);

        // Add typing indicator
        const typingId = Date.now() + 1;
        setMessages(prev => [...prev, { id: typingId, role: "bot", type: "typing" }]);

        // Simulate response delay
        setTimeout(() => {
            const response = RESPONSES[question.id];
            const botMsg = {
                id: Date.now() + 2,
                role: "bot",
                type: "answer",
                answer: response?.answer || "I don't have specific information on that. Please consult your local Gram Sabha or tribal welfare office.",
                explanation: response?.explanation || "",
                sections: response?.sections || [],
                suggestions: response?.suggestions || []
            };
            setMessages(prev => prev.filter(m => m.id !== typingId).concat(botMsg));
        }, 900);
    }

    function handleReset() {
        setMessages([WELCOME]);
        setShowQuestions(true);
    }

    return (
        <>
            <div
                className="chat-popup flex flex-col bg-gray-50 rounded-2xl shadow-2xl overflow-hidden"
                style={{ width: 380, height: 580 }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 text-white flex-shrink-0" style={{ background: "#15803d" }}>
                    <TreeBot size={38} />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm leading-none">Forest Rights Assistant</p>
                        <p className="text-green-200 text-xs mt-0.5">Forest Rights Act, 2006</p>
                    </div>
                    <button onClick={handleReset} className="text-green-200 hover:text-white transition p-1" title="Reset chat">
                        <RotateCcw size={16} />
                    </button>
                    <button onClick={onClose} className="text-green-200 hover:text-white transition p-1">
                        <X size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
                    {messages.map(msg => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            onSectionClick={setActiveSection}
                            onQuestionClick={handleQuestionSelect}
                        />
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Question browser */}
                <div className="border-t border-gray-200 bg-white flex-shrink-0">
                    <button
                        onClick={() => setShowQuestions(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                    >
                        <span>📋 Browse Questions</span>
                        {showQuestions ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                    {showQuestions && (
                        <div className="px-3 pb-3">
                            <QuestionBrowser onSelect={handleQuestionSelect} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-white border-t border-gray-100 flex-shrink-0">
                    <p className="text-center text-xs text-gray-400">
                        Information based on FRA 2006 & Rules 2008. Verify with official sources.
                    </p>
                </div>
            </div>

            {/* Section modal */}
            {activeSection && (
                <SectionModal
                    sectionKey={activeSection}
                    onClose={() => setActiveSection(null)}
                />
            )}
        </>
    );
}
