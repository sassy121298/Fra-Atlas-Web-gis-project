import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TreeBot from "./TreeBot.jsx";
import { QUESTIONS } from "../data/fra.js";

export default function MessageBubble({ message, onSectionClick, onQuestionClick }) {
    const isBot = message.role === "bot";

    if (!isBot) {
        return (
            <div className="flex justify-end mb-3">
                <div
                    className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white max-w-[85%]"
                    style={{ background: "#15803d" }}
                >
                    {message.text}
                </div>
            </div>
        );
    }

    if (message.type === "typing") {
        return (
            <div className="flex items-end gap-2 mb-3">
                <TreeBot size={32} />
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
                    <span className="typing-dot w-2 h-2 rounded-full bg-green-600 block" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-green-600 block" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-green-600 block" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-2 mb-4">
            <div className="flex-shrink-0 mt-1">
                <TreeBot size={34} />
            </div>
            <div className="flex-1 min-w-0">
                {/* Answer */}
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-sm text-gray-800 leading-relaxed">
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.answer}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Explanation */}
                {message.explanation && (
                    <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.explanation}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* Section badges */}
                {message.sections && message.sections.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {message.sections.map(s => (
                            <button
                                key={s}
                                onClick={() => onSectionClick(s)}
                                className="section-badge text-xs px-2.5 py-1 rounded-full border border-green-300 text-green-800 bg-green-50 transition font-medium"
                            >
                                📖 {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Suggested follow-up questions */}
                {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-1.5 ml-1">Related questions:</p>
                        <div className="flex flex-col gap-1.5">
                            {message.suggestions.map(qid => {
                                const q = QUESTIONS.find(x => x.id === qid);
                                if (!q) return null;
                                return (
                                    <button
                                        key={qid}
                                        onClick={() => onQuestionClick(q)}
                                        className="text-left text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 text-gray-700 transition"
                                    >
                                        {q.text}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
