import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "./Navbar";
import SignInModal from "./SignInModal";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMicrophone, faTrash, faCloudArrowUp, faFilePdf, 
  faShieldHalved, faLock, faCheckCircle, faSpinner, faTimes,
  faExclamationTriangle, faInfoCircle, faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";

const TestMode = () => {
  const { user, userProfile, loading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null); // { message, type: "success" | "error" | "warning" | "info" }
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = "info") => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: null,
    isDanger: false
  });
  
  // State for campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // State for upload
  const [uploadStatus, setUploadStatus] = useState(""); // "", "Uploading PDF...", "Parsing PDF...", "Extracting Text...", "Ready"
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef(null);

  // State for chat
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const activeCampaign = campaigns.find(c => c.id === activeUploadId) || null;

  // Security Check & Auth
  useEffect(() => {
    if (!loading) {
      if (!user) {
        setShowSignIn(true);
      } else if (userProfile) {
        const isAdmin = userProfile.isAdmin === true;
        const isApprovedMerchant = userProfile.role === "merchant" && userProfile.merchantVerified === true && userProfile.verificationStatus === "approved";
        
        if (!isAdmin && !isApprovedMerchant) {
          setAccessDenied(true);
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        }
      }
    }
  }, [user, userProfile, loading]);

  // Load Campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3000/testmode/campaigns", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        if (data.campaigns?.length > 0 && !activeUploadId) {
          setActiveUploadId(data.campaigns[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setLoadingCampaigns(false);
    }
  }, [user, activeUploadId]);

  useEffect(() => {
    if (user && userProfile) {
      const isAdmin = userProfile.isAdmin === true;
      const isApprovedMerchant = userProfile.role === "merchant" && userProfile.merchantVerified === true && userProfile.verificationStatus === "approved";
      
      if (isAdmin || isApprovedMerchant) {
        fetchCampaigns();
      } else {
        setLoadingCampaigns(false);
      }
    }
  }, [user, userProfile, fetchCampaigns]);

  // Load Chat when Active Campaign changes
  useEffect(() => {
    const loadChat = async () => {
      if (!activeUploadId || !user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`http://localhost:3000/testmode/chats/${activeUploadId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    };
    loadChat();
  }, [activeUploadId, user]);

  // Mic Logic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + " " + transcript : transcript));
    };

    recognitionRef.current = recognition;
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      showToast("Voice input not supported in this browser", "warning");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Chat Send Logic
  const handleSend = async () => {
    if (!input.trim() || !activeUploadId || !user) return;
    
    const userMessage = input;
    setInput("");
    setIsTyping(true);
    
    const baseMessages = [...messages, { sender: "user", text: userMessage }];
    setMessages(baseMessages);

    try {
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3000/testmode/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          uploadId: activeUploadId,
          query: userMessage,
          chatHistory: messages
        })
      });

      const data = await res.json();
      const aiText = data.answer || "I could not find an answer in your document.";
      
      const finalMessages = [...baseMessages, { sender: "ai", text: aiText }];
      setMessages(finalMessages);

      // Save chat
      await fetch(`http://localhost:3000/testmode/chats/${activeUploadId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ messages: finalMessages })
      });
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: "ai", text: "Something went wrong processing your request." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Upload Logic
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Only PDF files are allowed.", "warning");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File size exceeds 10MB limit.", "error");
      return;
    }

    setUploadProgress(true);
    setUploadStatus("Uploading PDF...");

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      
      const token = await user.getIdToken();
      
      // Simulate intermediate states for UX
      setTimeout(() => setUploadStatus("Parsing PDF..."), 1500);
      setTimeout(() => setUploadStatus("Extracting Text..."), 3000);

      const res = await fetch("http://localhost:3000/testmode/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadStatus("Ready to Test ✅");
      setActiveUploadId(data.uploadId);
      
      await fetchCampaigns();
      
      setTimeout(() => {
        setUploadProgress(false);
        setUploadStatus("");
      }, 2000);
    } catch (err) {
      console.error(err);
      showToast("Failed to upload document.", "error");
      setUploadProgress(false);
      setUploadStatus("");
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Delete Logic
  const handleDelete = (uploadId) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Campaign",
      message: "Are you sure you want to delete this campaign? This action is permanent and cannot be undone.",
      confirmText: "Delete Campaign",
      cancelText: "Cancel",
      isDanger: true,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        try {
          const token = await user.getIdToken();
          const res = await fetch(`http://localhost:3000/testmode/upload/${uploadId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Delete failed");

          setCampaigns(prev => prev.filter(c => c.id !== uploadId));
          if (activeUploadId === uploadId) {
            setActiveUploadId(null);
            setMessages([]);
          }
          showToast("Campaign deleted successfully!", "success");
        } catch (err) {
          console.error(err);
          showToast("Failed to delete campaign.", "error");
        }
      }
    });
  };

  // Approve Logic
  const handleApprove = async () => {
    if (!activeUploadId) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`http://localhost:3000/testmode/approve/${activeUploadId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Approval failed");
      
      setCampaigns(prev => prev.map(c => 
        c.id === activeUploadId ? { ...c, merchantApproved: true, status: "approved" } : c
      ));
      showToast("Dataset approved for consumer usage!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to approve dataset.", "error");
    }
  };

  const handleClearChat = () => {
    if (!activeUploadId) return;
    setConfirmConfig({
      isOpen: true,
      title: "Clear Chat History",
      message: "Are you sure you want to clear the chat history for this campaign?",
      confirmText: "Clear History",
      cancelText: "Cancel",
      isDanger: true,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        setMessages([]);
        try {
          const token = await user.getIdToken();
          const res = await fetch(`http://localhost:3000/testmode/chats/${activeUploadId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ messages: [] })
          });
          if (res.ok) {
            showToast("Chat history cleared successfully!", "success");
          } else {
            showToast("Failed to clear chat history.", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Failed to clear chat history.", "error");
        }
      }
    });
  };

  const suggestedQueries = [
    "What offers are valid this month?",
    "What items are included in this offer?",
    "Where is this offer applicable?",
    "Show all terms & conditions",
    "What is the validity period?",
  ];

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    .chat-scroll::-webkit-scrollbar { width: 8px; }
    .chat-scroll::-webkit-scrollbar-track { background: #000000; }
    .chat-scroll::-webkit-scrollbar-thumb { background-color: #f97316; border-radius: 10px; }
    .chat-scroll::-webkit-scrollbar-thumb:hover { background-color: #ea580c; }
    .chat-scroll { scrollbar-width: thin; scrollbar-color: #f97316 #000000; }
    .typing-dots { display: inline-flex; align-items: center; gap: 0.35rem; }
    .typing-dots span { width: 0.45rem; height: 0.45rem; background: #f97316; border-radius: 9999px; opacity: 0.45; animation: dotPulse 1.2s infinite ease-in-out; }
    .typing-dots span:nth-child(2) { animation-delay: 0.18s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes dotPulse { 0%, 80%, 100% { transform: scale(1); opacity: 0.45; } 40% { transform: scale(1.2); opacity: 1; } }
    
    /* Toast and Modal Animations */
    .animate-slide-in {
      animation: slideInDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out forwards;
    }
    .animate-scale-in {
      animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes slideInDown {
      0% {
        transform: translate(-50%, -20px);
        opacity: 0;
      }
      100% {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes scaleIn {
      0% {
        transform: scale(0.92);
        opacity: 0;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (accessDenied) {
    return (
      <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
        <Navbar onSignInClick={() => setShowSignIn(true)} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <FontAwesomeIcon icon={faShieldHalved} className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
            Only approved merchants or administrators can access Test Mode. Redirecting you to the home page...
          </p>
          <div className="flex items-center gap-2 text-orange-500 text-sm font-semibold animate-pulse">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <Navbar onSignInClick={() => setShowSignIn(true)} />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1600px] mx-auto w-full">

        {/* LEFT PANEL */}
        <aside className="w-full lg:w-[320px] xl:w-[380px] bg-neutral-950 lg:border-r lg:border-neutral-800 p-6 flex flex-col gap-6 overflow-y-auto chat-scroll flex-shrink-0">

          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-orange-500">Test Mode</h1>
              <span className="bg-[#4a2e8c]/30 text-[#a78bfa] text-xs font-semibold px-2 py-0.5 rounded-full border border-[#4a2e8c]/50">
                Merchant Portal
              </span>
            </div>
            <p className="text-sm text-neutral-400">
              Upload your offers PDF and test how Cinecrafit AI responds using your data.
            </p>
          </div>

          {/* Upload Card */}
          <div 
            onClick={!uploadProgress ? handleUploadClick : undefined}
            className={`border-2 ${uploadProgress ? 'border-orange-500 border-solid' : 'border-dashed border-neutral-700 hover:border-orange-500/50 cursor-pointer'} bg-neutral-900/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition group relative overflow-hidden shrink-0`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="application/pdf" 
              className="hidden" 
            />
            {uploadProgress ? (
              <div className="flex flex-col items-center gap-3 z-10">
                <FontAwesomeIcon icon={faSpinner} className="text-3xl text-orange-500 animate-spin" />
                <p className="font-semibold text-orange-500">{uploadStatus}</p>
              </div>
            ) : (
              <>
                <FontAwesomeIcon icon={faCloudArrowUp} className="text-3xl text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-neutral-200 mb-1">Upload Offer PDF</h3>
                <p className="text-xs text-neutral-400 mb-4">Drag & drop your PDF here<br />or</p>
                <button className="bg-orange-500 hover:bg-orange-600 text-black font-semibold text-sm px-6 py-2 rounded-lg transition shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                  Choose PDF File
                </button>
                <p className="text-[10px] text-neutral-500 mt-4">Supports PDF up to 10MB</p>
              </>
            )}
          </div>

          {/* Current Document */}
          {activeCampaign && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-neutral-300">Current Document</h3>
                <span className="bg-green-500/10 text-green-500 text-xs font-medium px-2 py-0.5 rounded-md border border-green-500/20">Ready</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FontAwesomeIcon icon={faFilePdf} className="text-red-500 text-xl" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-neutral-200 truncate">{activeCampaign.fileName}</p>
                    <p className="text-[11px] text-neutral-500">
                      {(activeCampaign.fileSize / (1024 * 1024)).toFixed(2)} MB • Uploaded {new Date(activeCampaign.uploadedAt?._seconds * 1000 || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(activeCampaign.id)}
                  className="text-neutral-500 hover:text-red-500 transition px-2"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>

              {!activeCampaign.merchantApproved ? (
                <button 
                  onClick={handleApprove}
                  className="w-full mt-3 bg-green-500/10 hover:bg-green-500 border border-green-500/30 hover:border-green-500 text-green-500 hover:text-black py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faCheckCircle} /> Approve Dataset for Consumer Use
                </button>
              ) : (
                <div className="w-full mt-3 bg-green-500/5 border border-green-500/20 text-green-500/80 py-2 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} /> Dataset Approved
                </div>
              )}
            </div>
          )}

          {/* Campaign History */}
          <div className="mt-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <h3 className="text-sm font-semibold text-neutral-300">Your Campaigns</h3>
            </div>
            
            {loadingCampaigns ? (
              <p className="text-xs text-neutral-500 text-center">Loading campaigns...</p>
            ) : campaigns.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-4">No campaigns found.</p>
            ) : (
              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {campaigns.map(campaign => (
                  <div 
                    key={campaign.id}
                    onClick={() => setActiveUploadId(campaign.id)}
                    className={`border rounded-xl p-3 flex justify-between items-center cursor-pointer transition ${
                      activeUploadId === campaign.id 
                        ? 'bg-neutral-900/80 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.1)]' 
                        : 'bg-neutral-900/40 border-neutral-800 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="overflow-hidden pr-2">
                      <p className={`text-xs font-medium truncate ${activeUploadId === campaign.id ? 'text-white' : 'text-neutral-400'}`}>
                        {campaign.fileName}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {new Date(campaign.uploadedAt?._seconds * 1000 || Date.now()).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${
                        campaign.merchantApproved 
                          ? 'text-green-500 bg-green-500/10 border-green-500/20' 
                          : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${campaign.merchantApproved ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        {campaign.merchantApproved ? 'Approved' : 'Draft'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Box */}
          <div className="bg-[#4a2e8c]/10 border border-[#4a2e8c]/30 rounded-xl p-4 flex gap-3 mt-auto shrink-0">
            <div className="bg-[#4a2e8c]/40 text-[#a78bfa] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faLock} className="text-sm" />
            </div>
            <p className="text-[11px] text-[#a78bfa] leading-relaxed">
              Only you can see and test your uploaded data. It won't be visible to general users until approved.
            </p>
          </div>

        </aside>

        {/* RIGHT PANEL (CHAT) */}
        <section className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
          
          {!activeUploadId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
              <FontAwesomeIcon icon={faCloudArrowUp} className="text-5xl mb-4 opacity-50" />
              <p>Select or upload a campaign to start testing.</p>
            </div>
          ) : (
            <>
              {/* Top Header */}
              <div className="px-6 py-5 border-b border-neutral-900 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white">Test Your Campaign</h2>
                  <p className="text-sm text-neutral-400 mt-1">Ask questions to see how Cinecrafit AI responds using your uploaded PDF.</p>
                </div>
                <button 
                  onClick={handleClearChat}
                  className="border border-orange-500/50 text-orange-500 hover:bg-orange-500/10 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  Clear Chat
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto px-6 py-8 chat-scroll flex flex-col">
                <div className="max-w-4xl mx-auto w-full space-y-6">
                  
                  {messages.length === 0 && !isTyping && (
                     <div className="text-center mt-10">
                       <p className="text-neutral-400 text-lg">👋 Hello! I'm ready to answer questions about <b>{activeCampaign?.fileName}</b>.</p>
                     </div>
                  )}

                  {messages.map((msg, idx) => 
                    msg.sender === "user" ? (
                      <div key={idx} className="flex justify-end">
                        <div className="bg-orange-500 text-black px-5 py-3 rounded-t-2xl rounded-bl-2xl font-medium text-sm shadow-md">
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      <div key={idx} className="flex gap-4 max-w-[90%]">
                        <div className="w-8 h-8 bg-orange-500 text-black flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-1 shadow-lg">
                          AI
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 px-5 py-4 rounded-t-2xl rounded-br-2xl shadow-xl flex-1 text-sm text-neutral-200 whitespace-pre-line leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    )
                  )}

                  {isTyping && (
                    <div className="flex gap-4 max-w-[90%]">
                      <div className="w-8 h-8 bg-orange-500 text-black flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-1">AI</div>
                      <div className="bg-neutral-900 border border-neutral-800 px-5 py-4 rounded-t-2xl rounded-br-2xl flex items-center gap-2">
                        <span className="text-neutral-400 text-sm italic">Analyzing document</span>
                        <div className="typing-dots"><span></span><span></span><span></span></div>
                      </div>
                    </div>
                  )}

                  {/* Chips */}
                  {messages.length < 2 && !isTyping && (
                    <div className="mt-8 pt-4">
                      <p className="text-xs text-neutral-400 mb-2">Try asking:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedQueries.map((query, idx) => (
                          <button
                            key={idx}
                            onClick={() => setInput(query)}
                            className="bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 hover:bg-neutral-800 text-neutral-300 px-4 py-2 rounded-full text-xs transition whitespace-nowrap"
                          >
                            {query}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Invisible element to auto-scroll */}
                  <div style={{ float:"left", clear: "both" }} />
                </div>
              </div>

              {/* Input Area */}
              <div className="px-6 py-4 bg-[#050505] border-t border-neutral-900 shrink-0">
                <div className="max-w-4xl mx-auto">
                  <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors border ${listening ? "bg-neutral-900 ring-2 ring-orange-500/70 border-orange-500/50 shadow-[0_0_0_12px_rgba(249,115,22,0.20)] animate-pulse" : "bg-neutral-900 border-neutral-800 focus-within:border-orange-500/50"}`}>
                    
                    {listening && (
                      <div className="typing-dots mr-2">
                        <span /><span /><span /><span /><span /><span />
                      </div>
                    )}
                    
                    <input
                      type="text"
                      placeholder="Type your question about this campaign..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      className="flex-1 bg-transparent outline-none text-white text-sm"
                    />

                    <button 
                      onClick={handleMicClick}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${listening ? "bg-orange-500 text-black" : "bg-neutral-800 text-neutral-400 hover:bg-orange-500 hover:text-black"}`}
                    >
                      <FontAwesomeIcon icon={faMicrophone} className="text-lg" />
                    </button>
                    <button 
                      onClick={handleSend}
                      className="px-5 h-10 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-xl text-sm flex items-center gap-2 transition"
                    >
                      <span className="transform rotate-45 text-lg -mt-0.5">➤</span>
                      Send
                    </button>
                  </div>

                  <div className="mt-4 text-center flex items-center justify-center gap-2 text-neutral-500 text-[11px]">
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <span>Test Mode responses are based only on your uploaded document.</span>
                  </div>
                </div>
              </div>
            </>
          )}

        </section>
      </main>

      {!loading && (
        <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in pointer-events-none">
          <div className={`px-5 py-3.5 rounded-xl border backdrop-blur-md flex items-center gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)] pointer-events-auto transition-all ${
            toast.type === "success" 
              ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
              : toast.type === "error" 
              ? "bg-red-950/80 border-red-500/30 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
              : toast.type === "warning"
              ? "bg-amber-950/80 border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              : "bg-neutral-900/90 border-orange-500/30 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
          }`}>
            <FontAwesomeIcon 
              icon={
                toast.type === "success" 
                  ? faCheckCircle 
                  : toast.type === "error" 
                  ? faExclamationCircle 
                  : toast.type === "warning" 
                  ? faExclamationTriangle 
                  : faInfoCircle
              } 
              className="text-lg animate-pulse"
            />
            <span className="text-sm font-medium pr-1">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-current opacity-70 hover:opacity-100 p-0.5 transition"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl max-w-md w-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${
                  confirmConfig.isDanger 
                    ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
                    : "bg-orange-500/10 border-orange-500/20 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                }`}>
                  <FontAwesomeIcon 
                    icon={confirmConfig.isDanger ? faExclamationTriangle : faInfoCircle} 
                    className="text-lg animate-pulse" 
                  />
                </div>
                <h3 className="text-lg font-bold text-white">{confirmConfig.title}</h3>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed pl-1">{confirmConfig.message}</p>
            </div>
            
            <div className="bg-neutral-900/50 border-t border-neutral-800/60 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                {confirmConfig.cancelText}
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition shadow-lg ${
                  confirmConfig.isDanger
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                    : "bg-orange-500 hover:bg-orange-600 text-black shadow-[0_0_15px_rgba(249,115,22,0.25)]"
                }`}
              >
                {confirmConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestMode;
