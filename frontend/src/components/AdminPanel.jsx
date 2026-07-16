import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Check, X, Search, ShieldAlert, Building, Mail, MapPin, Globe, CreditCard, ListChecks, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import Navbar from "./Navbar";

const AdminPanel = () => {
  const { userProfile, user } = useAuth();
  const [merchants, setMerchants] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [remarks, setRemarks] = useState({});
  const [processing, setProcessing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-in {
        animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
      }
      .admin-card {
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        background: linear-gradient(145deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%);
      }
      .admin-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 20px 40px -10px rgba(249,115,22,0.15);
        border-color: rgba(249,115,22,0.4);
      }
      .glass-panel {
        background: rgba(15, 15, 15, 0.6);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .admin-scroll::-webkit-scrollbar { width: 6px; }
      .admin-scroll::-webkit-scrollbar-track { background: transparent; }
      .admin-scroll::-webkit-scrollbar-thumb { background-color: #333; border-radius: 10px; }
      .admin-scroll::-webkit-scrollbar-thumb:hover { background-color: #f97316; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .spin { animation: spin 1s linear infinite; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Fetch merchants via secure backend API (bypasses Firestore security rules)
  const fetchMerchants = useCallback(async () => {
    if (!user || !userProfile?.isAdmin) return;

    setLoading(true);
    setFetchError(null);
    try {
      const idToken = await user.getIdToken(/* forceRefresh */ true);
      const res = await fetch("http://localhost:3000/auth/merchants", {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setMerchants(data.merchants || []);
    } catch (err) {
      console.error("Failed to fetch merchants:", err);
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, userProfile?.isAdmin]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const handleAction = async (merchantUid, action) => {
    if (!user) return;
    setProcessing(merchantUid);
    try {
      const idToken = await user.getIdToken();
      const adminRemark = remarks[merchantUid] || "";

      const res = await fetch("http://localhost:3000/auth/manual-verify-merchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, merchantUid, action, remarks: adminRemark }),
      });

      if (!res.ok) throw new Error("Action failed");

      setRemarks((prev) => ({ ...prev, [merchantUid]: "" }));
      // Refresh list after action
      await fetchMerchants();
    } catch (err) {
      console.error(err);
      alert("Error performing action");
    } finally {
      setProcessing(null);
    }
  };

  const getTrustScoreColor = (score) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const renderTrustBar = (score) => {
    const filled = Math.round((score / 100) * 10);
    const empty = 10 - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    return (
      <div className="font-mono mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <span className={getTrustScoreColor(score)}>{bar}</span>
      </div>
    );
  };

  const stats = {
    pending: merchants.filter((m) => m.verificationStatus === "pending").length,
    approved: merchants.filter((m) => m.verificationStatus === "approved").length,
    rejected: merchants.filter((m) => m.verificationStatus === "rejected").length,
    all: merchants.length,
  };

  const filteredMerchants = merchants.filter((m) => {
    if (filter !== "all" && m.verificationStatus !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.businessName?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col overflow-hidden relative selection:bg-orange-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-900/10 blur-[120px] pointer-events-none"></div>

      <Navbar onSignInClick={() => {}} />

      <div className="flex-1 pt-8 px-4 md:px-8 pb-12 overflow-y-auto admin-scroll z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">

          {/* LEFT SIDEBAR */}
          <div className="w-full md:w-1/4 flex flex-col gap-6 animate-slide-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
                  <ShieldAlert className="text-orange-500 w-8 h-8 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  <span className="bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Admin</span>
                </h2>
                <p className="text-sm text-neutral-500 mt-2 ml-1">Manage merchant verifications</p>
              </div>
              <button
                onClick={fetchMerchants}
                disabled={loading}
                title="Refresh"
                className="mt-1 p-2 rounded-lg border border-neutral-800 hover:border-orange-500/50 text-neutral-500 hover:text-orange-400 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "spin" : ""}`} />
              </button>
            </div>

            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search merchant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-neutral-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { id: "pending", label: "Pending", count: stats.pending, activeClass: "bg-orange-500/10 text-orange-400 border border-orange-500/30" },
                  { id: "approved", label: "Approved", count: stats.approved, activeClass: "bg-green-500/10 text-green-400 border border-green-500/30" },
                  { id: "rejected", label: "Rejected", count: stats.rejected, activeClass: "bg-red-500/10 text-red-400 border border-red-500/30" },
                  { id: "all", label: "All", count: stats.all, activeClass: "bg-neutral-700/50 text-white border border-neutral-600" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    className={`flex justify-between items-center py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                      filter === item.id
                        ? item.activeClass
                        : "bg-transparent text-neutral-400 border border-transparent hover:bg-white/5 hover:text-neutral-200"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {filter === item.id && <ArrowRight className="w-4 h-4" />}
                      {item.label}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs ${filter === item.id ? "bg-white/10" : "bg-neutral-800 text-neutral-500"}`}>
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT MAIN PANEL */}
          <div className="w-full md:w-3/4 flex flex-col gap-5">
            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center h-[50vh] glass-panel rounded-2xl animate-slide-in">
                <Loader2 className="w-8 h-8 text-orange-500 spin mb-3" />
                <p className="text-neutral-400 text-sm">Loading merchants...</p>
              </div>
            )}

            {/* Error state */}
            {!loading && fetchError && (
              <div className="flex flex-col items-center justify-center h-[50vh] glass-panel rounded-2xl animate-slide-in border border-red-500/20">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-red-400 text-lg font-medium">Failed to load merchants</p>
                <p className="text-neutral-600 text-sm mt-1 mb-4">{fetchError}</p>
                <button onClick={fetchMerchants} className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm hover:bg-orange-500/20 transition-all">
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !fetchError && filteredMerchants.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[50vh] glass-panel rounded-2xl animate-slide-in" style={{ animationDelay: "0.2s" }}>
                <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-4 border border-neutral-800">
                  <Search className="w-6 h-6 text-neutral-600" />
                </div>
                <p className="text-neutral-400 text-lg font-medium">No merchants found.</p>
                <p className="text-neutral-600 text-sm mt-1">
                  {merchants.length === 0 ? "No merchant registrations yet." : "Try adjusting your filters or search query."}
                </p>
              </div>
            )}

            {/* Merchant cards */}
            {!loading && !fetchError &&
              filteredMerchants.map((merchant, index) => (
                <div
                  key={merchant.id}
                  className="admin-card border border-neutral-800/80 rounded-2xl p-6 relative overflow-hidden group animate-slide-in"
                  style={{ animationDelay: `${0.15 + index * 0.1}s` }}
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-500 ${
                    merchant.verificationStatus === "approved" ? "bg-green-500" :
                    merchant.verificationStatus === "rejected" ? "bg-red-500" : "bg-orange-500"
                  }`}></div>

                  <div className="flex flex-col xl:flex-row justify-between gap-8 pl-2">
                    {/* Info Column */}
                    <div className="flex-1 space-y-5">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-white tracking-tight group-hover:text-orange-400 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:border-orange-500/30 transition-colors">
                            <Building className="w-5 h-5 text-neutral-400 group-hover:text-orange-400 transition-colors" />
                          </div>
                          {merchant.businessName || "Unnamed Business"}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          merchant.verificationStatus === "approved" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          merchant.verificationStatus === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        }`}>
                          {(merchant.verificationStatus || "pending").toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm text-neutral-400 bg-black/40 p-5 rounded-xl border border-neutral-800/50">
                        <p className="flex items-center gap-3"><CreditCard className="w-4 h-4 text-neutral-500 flex-shrink-0" /> <span className="text-neutral-200">{merchant.businessType || "N/A"}</span></p>
                        <p className="flex items-center gap-3"><Mail className="w-4 h-4 text-neutral-500 flex-shrink-0" /> <span className="text-neutral-200 truncate">{merchant.email}</span></p>
                        <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0" /> <span className="text-neutral-200 truncate">{merchant.businessLocation || "N/A"}</span></p>
                        {merchant.website ? (
                          <p className="flex items-center gap-3"><Globe className="w-4 h-4 text-neutral-500 flex-shrink-0" /> <a href={merchant.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline truncate transition-colors">{merchant.website}</a></p>
                        ) : (
                          <p className="flex items-center gap-3"><Globe className="w-4 h-4 text-neutral-500 flex-shrink-0" /> <span className="text-neutral-600">No Website</span></p>
                        )}
                      </div>

                      <div className="p-4 bg-gradient-to-br from-neutral-900 to-black rounded-xl border border-neutral-800 group-hover:border-neutral-700 transition-colors">
                        <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider mb-2">Verification Document</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">{merchant.verificationType || "N/A"}</span>
                          <span className="text-sm font-semibold text-neutral-100">{merchant.verificationValue || "N/A"}</span>
                        </div>
                      </div>

                      {merchant.verificationDetails && merchant.verificationDetails.length > 0 && (
                        <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/80">
                          <p className="text-sm font-bold flex items-center gap-2 mb-3 text-neutral-200">
                            <ListChecks className="w-4 h-4 text-orange-500" /> Verification Breakdown
                          </p>
                          <ul className="space-y-2">
                            {merchant.verificationDetails.map((detail, idx) => (
                              <li key={idx} className="text-xs text-neutral-400 flex items-start gap-2">
                                <span className="mt-0.5">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Actions & Score Column */}
                    <div className="w-full xl:w-[280px] flex flex-col gap-4 shrink-0">
                      <div className="p-5 bg-black/60 rounded-xl border border-neutral-800 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-orange-500/20 transition-colors">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                        <p className="text-[11px] text-neutral-500 font-semibold tracking-wider uppercase mb-2">Trust Score</p>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-black ${getTrustScoreColor(merchant.trustScore || 0)} drop-shadow-md`}>
                            {merchant.trustScore || 0}
                          </span>
                          <span className="text-sm text-neutral-600 font-medium">/100</span>
                        </div>
                        <div className="mt-2 w-full flex justify-center">
                          {renderTrustBar(merchant.trustScore || 0)}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-3 text-center px-2">
                          {merchant.verificationReason || "Auto Verification Result"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 flex-1 justify-end">
                        <textarea
                          placeholder="Admin remarks (optional)"
                          value={remarks[merchant.id] || ""}
                          onChange={(e) => setRemarks({ ...remarks, [merchant.id]: e.target.value })}
                          className="w-full h-24 bg-black/40 border border-neutral-800 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-neutral-600"
                        />

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(merchant.id, "approved")}
                            disabled={processing === merchant.id || merchant.verificationStatus === "approved"}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-black font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {processing === merchant.id ? <Loader2 className="w-4 h-4 spin" /> : <Check className="w-4 h-4" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(merchant.id, "rejected")}
                            disabled={processing === merchant.id || merchant.verificationStatus === "rejected"}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-black font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {processing === merchant.id ? <Loader2 className="w-4 h-4 spin" /> : <X className="w-4 h-4" />}
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
