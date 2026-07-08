import { useState } from "react";
import { CATEGORIES, QUESTIONS } from "../data/fra.js";

export default function QuestionBrowser({ onSelect }) {
    const [activeCategory, setActiveCategory] = useState("eligibility");

    const filtered = QUESTIONS.filter(q => q.category === activeCategory);

    return (
        <div className="flex flex-col gap-3">
            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition whitespace-nowrap ${
                            activeCategory === cat.id
                                ? "bg-green-700 text-white border-green-700"
                                : "bg-white border-gray-200 text-gray-600 hover:border-green-400"
                        }`}
                    >
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>

            {/* Questions list */}
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {filtered.map(q => (
                    <button
                        key={q.id}
                        onClick={() => onSelect(q)}
                        className="text-left text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 text-gray-700 transition"
                    >
                        {q.text}
                    </button>
                ))}
            </div>
        </div>
    );
}
