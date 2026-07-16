import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import { ShieldCheck, Timer, XCircle, RotateCcw, Shield, Settings, LogOut } from "lucide-react";

const Navbar = ({ onSignInClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);

  // Helper to open sign in with retry verification
  const handleRetryVerification = () => {
    // We can call onSignInClick to open the modal, 
    // the user can select merchant and re-submit.
    onSignInClick();
    setProfileOpen(false);
    setMobileProfileOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <nav className="relative z-[10000] flex items-center justify-between px-4 md:px-8 py-5 border-b border-neutral-800 backdrop-blur-none md:backdrop-blur-md">
      {/* LOGO */}
      <h1
        onClick={() => navigate("/")}
        className="text-lg md:text-xl font-bold tracking-wide flex items-center gap-6 cursor-pointer"
      >
        <img
          src={logo}
          alt="Cincrafit logo"
          className="w-8 h-8 object-contain transform md:scale-150 md:origin-left"
        />
        <span className="flex items-center gap-0.5 text-base text-xl md:text-lg font-bold">
          <span className="text-orange-500">CIN</span>
          <span className="text-white">CRA</span>
          <span className="text-orange-500">FIT</span>
          <span className="text-white">AI</span>
        </span>
      </h1>

      {/* DESKTOP MENU */}
      <ul className="hidden md:flex gap-10 text-sm text-neutral-300">
        <li
          onClick={() => navigate("/")}
          className={`cursor-pointer transition ${
            location.pathname === "/"
              ? "text-orange-500"
              : "hover:text-orange-500"
          }`}
        >
          Home
        </li>

        <li
          onClick={() => navigate("/movie-offers")}
          className={`cursor-pointer transition ${
            location.pathname === "/movie-offers"
              ? "text-orange-500"
              : "hover:text-orange-500"
          }`}
        >
          Movie Offers
        </li>

        <li
          onClick={() => navigate("/fashion-deals")}
          className={`cursor-pointer transition ${
            location.pathname === "/fashion-deals"
              ? "text-orange-500"
              : "hover:text-orange-500"
          }`}
        >
          Fashion Deals
        </li>

        <li
          onClick={() => navigate("/food-specials")}
          className={`cursor-pointer transition ${
            location.pathname === "/food-specials"
              ? "text-orange-500"
              : "hover:text-orange-500"
          }`}
        >
          Food Specials
        </li>
      </ul>

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden text-white focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* SIGN IN (DESKTOP ONLY) */}
      <div className="hidden md:flex items-center gap-3 relative">
        {!user ? (
          <button
            onClick={onSignInClick}
            className="px-5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
          >
            Sign In
          </button>
        ) : (
          <>
            {/* AVATAR + CHEVRON */}
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2"
            >
              <img
                src={
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${user.email}`
                }
                alt="avatar"
                className="w-9 h-9 rounded-full border border-neutral-700"
              />
              <svg
                className={`w-4 h-4 transition ${
                  profileOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* DROPDOWN */}
            {profileOpen && (
              <div
                className="absolute right-0 top-16 w-64 rounded-xl 
  bg-black 
  backdrop-blur-md 
  border border-neutral-700 
  shadow-2xl 
  p-4 
  z-[999]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${user.email}`
                    }
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {user.displayName || user.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-neutral-400">{user.email}</p>
                  </div>
                </div>

                <div className="border-t border-white/10 my-2" />

                {/* ADMIN: Always show Test Mode */}
                {userProfile?.isAdmin && (
                  <button
                    onClick={() => {
                      navigate("/test-mode");
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 rounded-lg transition mb-1 flex gap-2 items-center"
                  >
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Test Mode
                  </button>
                )}

                {/* MERCHANT LOGIC (non-admin merchants) */}
                {userProfile?.role === "merchant" && !userProfile?.isAdmin && (
                  <>
                    {userProfile.verificationStatus === "approved" && (
                      <button
                        onClick={() => {
                          navigate("/test-mode");
                          setProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 rounded-lg transition mb-1 flex gap-2 items-center"
                      >
                        <ShieldCheck className="w-4 h-4 text-green-500" /> Test Mode
                      </button>
                    )}
                    {userProfile.verificationStatus === "pending" && (
                      <div className="w-full px-3 py-2 text-sm text-yellow-500 bg-yellow-500/10 rounded-lg mb-1 flex gap-2 items-center cursor-not-allowed">
                        <Timer className="w-4 h-4" /> Verification Pending
                      </div>
                    )}
                    {userProfile.verificationStatus === "rejected" && (
                      <>
                        <div className="w-full px-3 py-2 text-sm text-red-500 bg-red-500/10 rounded-lg mb-1 flex gap-2 items-center cursor-not-allowed">
                          <XCircle className="w-4 h-4" /> Verification Rejected
                        </div>
                        <button
                          onClick={handleRetryVerification}
                          className="w-full text-left px-3 py-2 text-sm text-orange-400 hover:bg-orange-500/10 rounded-lg transition mb-1 flex gap-2 items-center"
                        >
                          <RotateCcw className="w-4 h-4" /> Retry Verification
                        </button>
                      </>
                    )}
                  </>
                )}

                {/* ADMIN LOGIC */}
                {userProfile?.isAdmin && (
                  <button
                    onClick={() => {
                      navigate("/admin/verify");
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 rounded-lg transition mb-1 flex gap-2 items-center"
                  >
                    <Shield className="w-4 h-4 text-purple-500" /> Admin Panel
                  </button>
                )}

                <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 rounded-lg transition mb-1 flex gap-2 items-center">
                  <Settings className="w-4 h-4 text-neutral-400" /> Settings
                </button>

                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm 
    text-red-400 
    hover:bg-red-500/20 
    rounded-lg transition flex gap-2 items-center"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MOBILE OVERLAY */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md backdrop-saturate-150 z-[9998] md:hidden"
          onClick={() => {
            setIsMenuOpen(false);
            setMobileProfileOpen(false);
          }}
        />
      )}

      {/* MOBILE SIDE MENU */}
      <aside
        className={`
    fixed top-0 right-0 h-full w-[70%] max-w-xs
    bg-neutral-950
    z-[10001] md:hidden
    transform transition-transform duration-300 ease-in-out
    ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
    border-l border-neutral-800
  `}
      >
        <div className="px-6 py-10 flex flex-col gap-6 text-neutral-200">
          {/* CLOSE BUTTON */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setMobileProfileOpen(false);
            }}
            className="self-end text-neutral-400 hover:text-white text-xl"
          >
            ✕
          </button>
          {/* MOBILE NAV LINKS */}
          <nav className="flex flex-col gap-5 text-lg font-medium">
            <span
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
              className={`cursor-pointer transition ${
                location.pathname === "/"
                  ? "text-orange-500"
                  : "hover:text-orange-500"
              }`}
            >
              Home
            </span>

            <span
              onClick={() => {
                navigate("/movie-offers");
                setIsMenuOpen(false);
              }}
              className={`cursor-pointer transition ${
                location.pathname === "/movie-offers"
                  ? "text-orange-500"
                  : "hover:text-orange-500"
              }`}
            >
              Movie Offers
            </span>

            <span
              onClick={() => {
                navigate("/fashion-deals");
                setIsMenuOpen(false);
              }}
            >
              Fashion Deals
            </span>

            <span
              onClick={() => {
                navigate("/food-specials");
                setIsMenuOpen(false);
              }}
            >
              Food Specials
            </span>

            {user && (
              <>
                {/* MY PROFILE TOGGLE */}
                <button
                  onClick={() => setMobileProfileOpen((prev) => !prev)}
                  className={`flex items-center justify-between w-full text-left text-lg font-medium transition
    ${mobileProfileOpen ? "text-orange-500" : "text-neutral-200"}
  `}
                >
                  <span>My Profile</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      mobileProfileOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* PROFILE DROPDOWN */}
                {mobileProfileOpen && (
                  <div className="mt-4 w-full bg-neutral-900 border border-neutral-800 rounded-xl p-5 animate-slideDown flex flex-col gap-2">
                    {/* AVATAR */}
                    <div className="flex flex-col items-center text-center mb-4">
                      <img
                        src={
                          user.photoURL ||
                          `https://ui-avatars.com/api/?name=${user.email}`
                        }
                        alt="avatar"
                        className="w-20 h-20 rounded-full border border-neutral-700 mb-3"
                      />

                      {/* NAME */}
                      <p className="text-base font-semibold">
                        {user.displayName || user.email.split("@")[0]}
                      </p>

                      {/* EMAIL */}
                      <p className="text-xs text-neutral-400 mt-1">
                        {user.email}
                      </p>
                    </div>

                    {/* ADMIN: Always show Test Mode */}
                    {userProfile?.isAdmin && (
                      <button
                        onClick={() => {
                          navigate("/test-mode");
                          setMobileProfileOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className="w-full py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 bg-neutral-800 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-green-500" /> Test Mode
                      </button>
                    )}

                    {/* MERCHANT LOGIC (non-admin merchants) */}
                    {userProfile?.role === "merchant" && !userProfile?.isAdmin && (
                      <>
                        {userProfile.verificationStatus === "approved" && (
                          <button
                            onClick={() => {
                              navigate("/test-mode");
                              setMobileProfileOpen(false);
                              setIsMenuOpen(false);
                            }}
                            className="w-full py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 bg-neutral-800 rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4 text-green-500" /> Test Mode
                          </button>
                        )}
                        {userProfile.verificationStatus === "pending" && (
                          <div className="w-full py-2 text-sm font-medium text-yellow-500 bg-yellow-500/10 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
                            <Timer className="w-4 h-4" /> Verification Pending
                          </div>
                        )}
                        {userProfile.verificationStatus === "rejected" && (
                          <>
                            <div className="w-full py-2 text-sm font-medium text-red-500 bg-red-500/10 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed mb-2">
                              <XCircle className="w-4 h-4" /> Verification Rejected
                            </div>
                            <button
                              onClick={handleRetryVerification}
                              className="w-full py-2 text-sm font-medium text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition flex items-center justify-center gap-2"
                            >
                              <RotateCcw className="w-4 h-4" /> Retry Verification
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {/* ADMIN LOGIC */}
                    {userProfile?.isAdmin && (
                      <button
                        onClick={() => {
                          navigate("/admin/verify");
                          setMobileProfileOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className="w-full py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 bg-neutral-800 rounded-lg transition flex items-center justify-center gap-2 mt-2"
                      >
                        <Shield className="w-4 h-4 text-purple-500" /> Admin Panel
                      </button>
                    )}

                    {/* ACTION BUTTONS (HORIZONTAL) */}
                    <div className="mt-2 flex gap-3">
                      <button className="flex flex-1 items-center justify-center gap-2 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition text-sm">
                        <Settings className="w-4 h-4" /> Settings
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setMobileProfileOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className="flex flex-1 items-center justify-center gap-2 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition text-sm"
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {!user && (
              <span
                onClick={() => {
                  onSignInClick();
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer hover:text-orange-500 transition mt-2"
              >
                Sign In
              </span>
            )}
          </nav>
        </div>
      </aside>
    </nav>
  );
};

export default Navbar;
