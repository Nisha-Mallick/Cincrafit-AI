import React, { useEffect, useState } from "react";
import { X, ShieldCheck, Brain, Globe } from "lucide-react";

const CardPopupModal = ({ isOpen, onClose, cardData }) => {
  const getAIBadge = () => {
    const title = cardData?.title?.toLowerCase() || "";

    if (title.includes("movie")) {
      return {
        title: "AI Powered",
        value: "Entertainment Intelligence",
        reason:
          "AI understands movie-related queries, cinema offers, OTT promotions, and entertainment savings to provide contextual recommendations.",
      };
    }

    if (title.includes("fashion")) {
      return {
        title: "AI Powered",
        value: "Smart Deal Discovery",
        reason:
          "AI filters irrelevant promotions and surfaces high-value fashion opportunities based on user intent.",
      };
    }

    if (title.includes("food")) {
      return {
        title: "AI Powered",
        value: "Hyperlocal Discovery",
        reason:
          "AI helps users discover nearby food specials, local business offers, and dining recommendations.",
      };
    }

    if (title.includes("real-time")) {
      return {
        title: "AI Powered",
        value: "Context-Aware Search",
        reason:
          "AI continuously improves recommendation quality by understanding query context and relevance.",
      };
    }

    if (title.includes("curated")) {
      return {
        title: "AI Powered",
        value: "Multi-Agent Intelligence",
        reason:
          "Queries are analyzed using routing intelligence, retrieval systems, and conversational reasoning.",
      };
    }

    if (title.includes("save")) {
      return {
        title: "AI Powered",
        value: "Smart Savings Engine",
        reason:
          "AI reduces search effort by surfacing relevant recommendations faster and more efficiently.",
      };
    }

    return {
      title: "AI Powered",
      value: "Context-Aware Search",
      reason:
        "AI continuously improves recommendation quality by understanding query context and relevance.",
    };
  };

  const aiBadge = getAIBadge();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to allow the DOM to render before triggering the transition
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = "auto";
      }, 300); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender || !cardData) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "opacity-100 backdrop-blur-sm bg-black/70" : "opacity-0 backdrop-blur-none bg-black/0"
      }`}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className={`relative w-full max-w-xl max-h-[85vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-y-auto transition-all duration-300 transform ${
          isVisible ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-8 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-neutral-400 hover:text-white rounded-full transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col h-full">
          {/* Main Content Area */}
          <div className="w-full p-8 md:p-10 flex flex-col justify-center">
            
            {/* Tags */}
            <div className="flex gap-3 mb-4">
              <span className="px-3 py-1 text-xs font-bold tracking-wider text-orange-500 bg-orange-500/10 rounded">
                {cardData.popupData?.category || "CATEGORY"}
              </span>
              <span className="px-3 py-1 text-xs font-bold tracking-wider text-neutral-500">
                CINECRAFIT AI
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-2 uppercase">
              {cardData.title.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')} {/* Strips emoji */}
            </h2>
            
            {/* Highlights/Subtitle */}
            <p className="text-orange-400 font-mono text-lg mb-8">
              {cardData.popupData?.highlight || "AI-Curated Deals"}
            </p>

            {/* Technical Specifications / Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-3">
                Overview & Guidelines
              </h4>
              <div className="p-4 bg-black/40 border border-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {cardData.popupData?.details || cardData.description}
                </p>
                {(() => {
                  const cat = (cardData.popupData?.category || "").toString().toUpperCase();
                  const showKeywords = ["ENTERTAINMENT", "FASHION", "FOOD"].includes(cat);
                  if (!showKeywords) return null;
                  return (
                    <div className="mt-3 pt-3 border-t border-neutral-800">
                      <p className="text-xs font-bold tracking-wider text-neutral-400 uppercase mb-1">Suggested Search Keywords</p>
                      <p className="text-xs text-neutral-300 mb-2">Use the keywords below to help Cincrafit AI better understand your intent and deliver more accurate, relevant, and personalized recommendations.</p>
                      <div>
                        <span className="text-xs text-orange-400 font-mono">{cardData.popupData?.keywords || "deals, offers, discounts"}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Info Badges */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-neutral-800">
                <ShieldCheck className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Verification</p>
                  <p className="text-xs font-medium text-neutral-200">100% Genuine</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-neutral-800">
                <Brain className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">{aiBadge.title}</p>
                  <p className="text-xs font-medium text-neutral-200">{aiBadge.value}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <button 
                onClick={onClose}
                className="flex-1 py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                Got It
              </button>
              <button className="p-3 bg-neutral-800 hover:bg-neutral-700 text-orange-500 rounded-lg border border-neutral-700 transition flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPopupModal;
