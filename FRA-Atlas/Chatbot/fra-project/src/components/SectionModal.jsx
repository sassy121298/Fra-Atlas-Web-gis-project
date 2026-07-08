import { X, BookOpen } from "lucide-react";
import { SECTIONS } from "../data/fra.js";

export default function SectionModal({ sectionKey, onClose }) {
    const section = SECTIONS[sectionKey];
    if (!section) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative"
                style={{ animation: "slideUp 0.25s ease forwards" }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <BookOpen size={20} className="text-green-700" />
                    </div>
                    <h2 className="font-bold text-gray-900 text-lg leading-tight">
                        {section.title}
                    </h2>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {section.content}
                    </p>
                </div>

                <p className="text-xs text-gray-400 mt-3 text-center">
                    The Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006
                </p>
            </div>
        </div>
    );
}
