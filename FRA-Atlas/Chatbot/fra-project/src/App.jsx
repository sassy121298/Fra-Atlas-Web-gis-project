import { useState } from "react";
import ChatWidget from "./components/ChatWidget.jsx";
import ChatFAB from "./components/ChatFAB.jsx";

export default function App() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)" }}>

            {/* Demo landing page — represents the host website the widget sits on */}
            <div className="max-w-4xl mx-auto px-6 py-16 text-center">

                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
                    <span>🌿</span> Government of India Initiative
                </div>

                <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    Forest Rights Act<br />
                    <span style={{ color: "#15803d" }}>Awareness Portal</span>
                </h1>

                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Understanding and claiming your rights under the Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006.
                </p>

                <div className="grid md:grid-cols-3 gap-6 text-left mb-16">
                    {[
                        { icon: "👤", title: "Check Eligibility", desc: "Find out if you or your community qualifies for forest rights under the FRA." },
                        { icon: "📋", title: "Claim Procedure", desc: "Step-by-step guidance on filing your claim through the Gram Sabha." },
                        { icon: "⚖️", title: "Know Your Rights", desc: "Understand Individual, Community, and Forest Resource Rights." },
                    ].map(card => (
                        <div key={card.title} className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
                            <div className="text-3xl mb-3">{card.icon}</div>
                            <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100 text-left max-w-2xl mx-auto">
                    <h2 className="font-bold text-gray-900 text-xl mb-3">🤖 AI Assistant Available</h2>
                    <p className="text-gray-600 mb-4">
                        Have questions about the Forest Rights Act? Click the green tree icon in the bottom-right corner to chat with our AI assistant. Get instant answers about eligibility, claim procedures, and your rights — in simple language.
                    </p>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition hover:opacity-90"
                        style={{ background: "#15803d" }}
                    >
                        Open Assistant →
                    </button>
                </div>
            </div>

            {/* Chat popup + FAB */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
                {isOpen && (
                    <ChatWidget onClose={() => setIsOpen(false)} />
                )}
                {!isOpen && (
                    <ChatFAB onClick={() => setIsOpen(true)} hasUnread={false} />
                )}
            </div>
        </div>
    );
}
