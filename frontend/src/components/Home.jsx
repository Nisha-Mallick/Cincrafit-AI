
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import SignInModal from "./SignInModal";
import Orb from "./Orb";
import MagicBento from "./MagicBento";
import Galaxy from "./Galaxy";
import GridMotion from "./GridMotion";
import CardPopupModal from "./CardPopupModal";
import { useAuth } from "../context/AuthContext";
import logoImage from "../assets/Logo.png";

// Import local assets for GridMotion
import fashionImg from "../assets/Fashion_deals_image.png";
import foodImg from "../assets/Food_deals_image.png";
import movieImg from "../assets/Movie_deals_image.png";

// Array of images to populate GridMotion automatically
const gridImages = [fashionImg, foodImg, movieImg];

const magicCards = [
  { 
    title: "🎬 Movie Offers", 
    description: "Find the best movie tickets deals in across cinemas and OTT platforms in one place. AI agents filter and verify offers so you always see relevant, genuine discounts.",
    popupData: {
      category: "ENTERTAINMENT",
      highlight: "Verified Cinema & OTT Savings",
      details: "Cincrafit AI helps users discover verified movie-ticket discounts, entertainment promotions, and OTT-related savings through a conversational AI experience.\n\nInstead of manually searching across multiple websites and booking platforms, users can simply ask questions naturally and receive relevant recommendations.\n\nThe platform focuses on trust, transparency, and verified information. When offer data is available, the AI provides contextual recommendations. When verified information is unavailable, the system provides intelligent guidance rather than misleading responses.\n\nThis category is designed for users looking to save on cinema bookings, streaming subscriptions, entertainment experiences, and movie-related offers while avoiding fake or expired promotions.",
      keywords: "movies, cinema, entertainment, tickets, pvr, inox, ott, netflix, prime video, disney hotstar, streaming, discounts, cashback, offers"
    }
  },
  { 
    title: "👕 Fashion Deals", 
    description: "Explore fashion discounts from popular brands, seasonal sales, and trending collections. AI-driven curation removes noise and surfaces only relevant, high-value offers.",
    popupData: {
      category: "FASHION",
      highlight: "Premium Brand Discounts",
      details: "Cincrafit AI helps users discover fashion offers, seasonal sales, footwear discounts, clothing promotions, and accessory deals from popular brands and marketplaces.\n\nInstead of browsing multiple shopping websites, users can simply describe what they are looking for and receive AI-guided recommendations.\n\nThe platform focuses on surfacing relevant and trustworthy opportunities while reducing the noise created by misleading promotions and irrelevant offers.\n\nWhether someone is searching for casual wear, office attire, sneakers, accessories, or seasonal collections, this category simplifies fashion deal discovery through intelligent conversational search.",
      keywords: "fashion, clothing, shoes, sneakers, apparel, accessories, menswear, womenswear, myntra, ajio, nike, adidas, zara, seasonal sale"
    }
  },
  { 
    title: "🍔 Food Specials", 
    description: "Discover nearby restaurant deals, dining discounts, and special food offers without searching multiple apps. AI ensures deals are fresh, relevant, and easy to redeem.",
    popupData: {
      category: "FOOD",
      highlight: "Hyperlocal Food Discovery",
      details: "Cincrafit AI enables users to discover nearby restaurant offers, food specials, café promotions, bakery updates, and dining-related savings through conversational search.\n\nThe long-term vision of the platform is hyperlocal offer discovery, helping users find what is new and trending around them while also increasing visibility for local businesses.\n\nUsers can ask natural questions about restaurants, food deals, or local specials and receive relevant recommendations without switching between multiple apps.\n\nThis category is designed to make food discovery easier, faster, and more accessible while supporting both consumers and local businesses.",
      keywords: "food, restaurants, cafes, bakery, dining, specials, discounts, offers, local businesses, hyperlocal discovery, nearby deals"
    }
  },
  { 
    title: "⚡ Real-Time Updates", 
    description: "Deals are continuously refreshed to remove expired or misleading offers. You always see the most accurate and up-to-date discounts available.",
    popupData: {
      category: "SYSTEM",
      highlight: "Fresh & Relevant Recommendations",
      details: "Cincrafit AI is built around continuously improving the quality and relevance of information shown to users.\n\nThe platform prioritizes trustworthy recommendations and focuses on reducing outdated, misleading, and low-value content.\n\nBy intelligently processing user queries and retrieving the most relevant information available, the system helps users discover useful opportunities faster while maintaining transparency and reliability.\n\nThis ensures a better conversational experience and a more dependable deal-discovery platform.",
      keywords: "latest offers, trending deals, updated information, real-time recommendations, current discounts, fresh insights"
    }
  },
  { 
    title: "🤖 AI Curated", 
    description: "Intelligent AI agents analyze, verify, and rank deals based on relevance and value. This ensures higher quality recommendations instead of random listings.",
    popupData: {
      category: "AI ENGINE",
      highlight: "Multi-Agent Intelligence",
      details: "Cincrafit AI uses a lightweight multi-agent architecture to understand user intent, retrieve verified knowledge, and generate helpful responses.\n\nThe system includes intelligent routing, knowledge retrieval, contextual reasoning, and fallback guidance mechanisms.\n\nInstead of displaying random promotions, the AI focuses on delivering relevant recommendations within supported domains such as Movies, Fashion, and Food.\n\nThis AI-first approach improves trust, relevance, transparency, and overall user experience while maintaining a specialized focus.",
      keywords: "artificial intelligence, conversational ai, rag, multi-agent, routing, recommendations, verified knowledge, contextual search"
    }
  },
  { 
    title: "💸 Save Instantly", 
    description: "Stop switching between apps and websites to find good deals. Cinecrafit helps you discover the best savings faster, with less effort.",
    popupData: {
      category: "BENEFIT",
      highlight: "Save Time & Money",
      details: "Cincrafit AI is designed to reduce the effort required to discover useful offers.\n\nInstead of visiting multiple websites, searching through coupon portals, and comparing different platforms manually, users can simply ask one question and receive contextual recommendations.\n\nThe platform combines conversational AI, verified information, and domain-focused intelligence to help users save both time and money.\n\nThis creates a faster, simpler, and more efficient deal-discovery experience for everyday users.",
      keywords: "savings, discounts, offers, affordability, recommendations, smart shopping, save money, quick savings, intelligent discovery"
    }
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleGetStarted = () => {
    if (user) {
      navigate("/movie-offers");
    } else {
      setShowSignIn(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white">

      {/* NAVBAR */}
      <Navbar onSignInClick={() => setShowSignIn(true)} />

      {/* HERO */}
      <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-20">
        {/* BACKGROUND ANIMATION */}
        <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center">
          <div className="w-full h-full pointer-events-auto">
            <Orb
              hoverIntensity={3.5}
              rotateOnHover={true}
              hue={0}
              forceHoverState={false}
              backgroundColor="#000000"
            />
          </div>
        </div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-extrabold leading-tight">
             FIND THE <span className="text-orange-500">BEST DEALS</span> IN ONE PLACE
          </h2>

          <p className="mt-5 max-w-2xl text-neutral-200 text-lg">
            Explore trusted offers across Movies, Fashion, and Food through intelligent conversational search. Cincrafit AI helps you find verified recommendations, avoid misleading discounts, and discover savings faster.
          </p>

          {/* SEARCH BAR */}
          <div className="mt-10 flex w-full max-w-3xl bg-neutral-900/70 border border-neutral-700 rounded-full overflow-hidden shadow-lg">
            <input
              type="text"
              placeholder="Search for deals, offers, coupons..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-6 py-4 bg-transparent outline-none text-sm rounded-l-full sm:rounded-l-full sm:rounded-r-none" />

            <button
              onClick={() => {
                if (!query.trim()) return;
                navigate("/movie-offers", { state: { query } });
              }}
              className="px-6 sm:px-10 py-4 bg-orange-500 hover:bg-orange-600 font-semibold transition rounded-r-full sm:rounded-r-full sm:rounded-l-none"
            >
              Search
            </button>

          </div>
        </div>
      </section>


      {/* MAGIC BENTO CARDS */}
      <section className="relative w-full overflow-hidden px-6 pb-24 pt-12 flex justify-center">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Galaxy transparent={true} />
        </div>
        
        <div className="relative z-20 w-full max-w-7xl mx-auto flex justify-center">
          <MagicBento
            cards={magicCards}
            textAutoHide={false}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            onCardClick={(card) => setSelectedCard(card)}
          />
        </div>
      </section>

      {/* GRID MOTION ANIMATION */}
      <section className="w-full relative z-10 mt-10 mb-16 overflow-hidden">
        <GridMotion items={gridImages} gradientColor="#000000" />
      </section>

      {/* CTA */}
      <section className="text-center pb-32 px-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          FIND VERIFIED DEALS, <span className="text-orange-500">POWERED BY AI</span>
        </h2>
        <p className="mt-4 text-neutral-400 max-w-2xl mx-auto">
          Cincrafit AI helps you discover trusted offers across Movies, Fashion, and Food through intelligent conversational search. Save time, avoid fake discounts, and find what matters faster.
        </p>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-neutral-300 max-w-xl mx-auto">
  <div className="flex flex-wrap justify-center gap-3">
      <span className="trust-badge rounded-full border border-neutral-700 px-3 py-1">
        ✓ Verified Recommendations
      </span>

      <span className="trust-badge rounded-full border border-neutral-700 px-3 py-1">
        ✓ AI-Powered Discovery
      </span>

      <span className="trust-badge rounded-full border border-neutral-700 px-3 py-1">
        ✓ Hyperlocal Insights
      </span>
  </div>
</div>

        <button
          onClick={handleGetStarted}
          className="mt-8 px-8 md:px-12 py-4 rounded-full bg-orange-500 hover:bg-orange-600 font-semibold shadow-lg transition"
        >
          Get Started
        </button>
      </section>

      <footer className="bg-black border-t border-orange-800 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt="Logo" className="h-24 w-24 p-1 object-contain" />
                <div>
                  <p className="text-xl font-bold">CincraFit AI</p>
                  <p className="text-sm text-neutral-400">Smart savings powered by AI.</p>
                </div>
              </div>

              <p className="max-w-md leading-7 text-neutral-300">
                Find the best deals across movies, fashion, and food with one intelligent experience. Our cards bring curated offers, verified discounts, and real-time savings into a single place.
              </p>

              <div className="space-y-3 text-sm text-neutral-300">
                <p className="font-semibold text-white">Featured on this page</p>
                <p>Movie Offers • Fashion Deals • Food Specials</p>
                <p>Real-Time Updates • AI Curation • Instant Savings</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Quick links</h3>
                <ul className="space-y-3 text-neutral-300">
                  <li>
                    <Link to="/" className="inline-block transition duration-200 hover:text-orange-400">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/movie-offers" className="inline-block transition duration-200 hover:text-orange-400">
                      Movie Offers
                    </Link>
                  </li>
                  <li>
                    <Link to="/fashion-deals" className="inline-block transition duration-200 hover:text-orange-400">
                      Fashion Deals
                    </Link>
                  </li>
                  <li>
                    <Link to="/food-specials" className="inline-block transition duration-200 hover:text-orange-400">
                      Food Specials
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Why CincraFit AI</h3>
                <ul className="space-y-3 text-neutral-300">
                  <li className="transition duration-200 hover:text-orange-400">Verified discounts for high-value savings</li>
                  <li className="transition duration-200 hover:text-orange-400">Business intelligence from real-time data</li>
                  <li className="transition duration-200 hover:text-orange-400">One place for deals across categories</li>
                  <li className="transition duration-200 hover:text-orange-400">Clean black, white, and orange experience</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-orange-800 pt-2 text-sm text-neutral-500 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>© 2026 CincraFit AI. All rights reserved.</p>
            <p>Designed for fast, elegant deal discovery in a dark-themed interface.</p>
          </div>
        </div>
      </footer>

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
      />

      <CardPopupModal 
        isOpen={!!selectedCard} 
        onClose={() => setSelectedCard(null)} 
        cardData={selectedCard} 
      />
    </div>
  );
};

export default Home;
