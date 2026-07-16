import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import SignInModal from "./SignInModal";
import { auth } from "../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

const DOMAIN_CONFIG = {
  movie: {
    title: "🎬 Explore Movie Offers",
    subtitle: "Cinecrafit AI",
    emptyPrompt: "👋 Ask me about movie offers and discounts.",
    inputPlaceholder: "Ask about movie tickets, cinemas, offers...",
    backendDomain: "movie",
  },
  fashion: {
    title: "👕 Explore Fashion Deals",
    subtitle: "Cinecrafit AI",
    emptyPrompt: "👋 Ask me about fashion sales, brands, discounts.",
    inputPlaceholder: "Ask about clothing, shoes, fashion deals...",
    backendDomain: "fashion",
  },
  food: {
    title: "🍔 Explore Food Specials",
    subtitle: "Cinecrafit AI",
    emptyPrompt: "👋 Ask me about food offers, restaurants, discounts.",
    inputPlaceholder: "Ask about food deals, restaurants nearby...",
    backendDomain: "food",
  },
};

const Movie_Offers = ({ domain = "movie" }) => {
  const location = useLocation();

  const initialQuery = location.state?.query || "";

  const [messages, setMessages] = useState(
    initialQuery ? [{ sender: "user", text: initialQuery }] : []
  );
  const { user, loading } = useAuth();
  const [authReady, setAuthReady] = useState(false);
  const [input, setInput] = useState("");
  const [isChatSaved, setIsChatSaved] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [listening, setListening] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const recognitionRef = useRef(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const config = DOMAIN_CONFIG[domain];
  const loadChat = (chat) => {
    setActiveChatId(chat.id);
    setMessages(chat.messages);
  };

  useEffect(() => {
    if (loading) {
      setShowSignIn(false);
    }
  }, [loading]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    /* Cinecrafit Chat Scrollbar */
    .chat-scroll::-webkit-scrollbar {
      width: 8px;
    }

    .chat-scroll::-webkit-scrollbar-track {
      background: #000000;
    }

    .chat-scroll::-webkit-scrollbar-thumb {
      background-color: #f97316;
      border-radius: 10px;
    }

    .chat-scroll::-webkit-scrollbar-thumb:hover {
      background-color: #ea580c;
    }

    /* Firefox */
    .chat-scroll {
      scrollbar-width: thin;
      scrollbar-color: #f97316 #000000;
    }

    .typing-dots {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .typing-dots span {
      width: 0.45rem;
      height: 0.45rem;
      background: #f97316;
      border-radius: 9999px;
      opacity: 0.45;
      animation: dotPulse 1.2s infinite ease-in-out;
    }

    .typing-dots span:nth-child(2) {
      animation-delay: 0.18s;
    }

    .typing-dots span:nth-child(3) {
      animation-delay: 0.36s;
    }

    @keyframes dotPulse {
      0%, 80%, 100% {
        transform: scale(1);
        opacity: 0.45;
      }
      40% {
        transform: scale(1.2);
        opacity: 1;
      }
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if (!activeChatId) return;

    setChatSessions((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages,
              title:
                chat.title === "New Chat" && messages.length > 0
                  ? messages[0].text.slice(0, 30)
                  : chat.title,
            }
          : chat
      )
    );
  }, [messages, activeChatId]);

 useEffect(() => {
  if (!user || loading) return;

  const loadChats = async () => {
    const token = await auth.currentUser.getIdToken();

    const res = await fetch("http://localhost:3000/chat/list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const chats = await res.json();

    const formattedChats = chats.map(chat => ({
      id: chat.id,
      title: chat.title || chat.messages?.[0]?.text?.slice(0, 30) || "New Chat",
      messages: chat.messages || [],
    }));

    setChatSessions(formattedChats);

    if (formattedChats.length > 0) {
      setActiveChatId(formattedChats[0].id);
      setMessages(formattedChats[0].messages);
    }
  };

  loadChats();
}, [user, loading]);

  const saveChatToDB = async (messagesToSave) => {
    const token = await auth.currentUser.getIdToken();

    const res = await fetch("http://localhost:3000/chat/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chatId: activeChatId, 
        domain,
        messages: messagesToSave,
      }),
    });

    const data = await res.json();

    if (!activeChatId && data.chatId) {
      setActiveChatId(data.chatId);
    }
  };

const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = input;
  setInput("");
  setIsTyping(true);

  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    setShowSignIn(true);
    setIsTyping(false);
    return;
  }

  //Add user message
  const baseMessages = [...messages, { sender: "user", text: userMessage }];
  setMessages(baseMessages);

  try {
    //Get AI response
    const res = await fetch("http://localhost:3000/rag/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: userMessage }),
    });

    const data = await res.json();
    const aiText = data.answer || "No verified offer found.";

    const finalMessages = [
      ...baseMessages,
      { sender: "ai", text: aiText },
    ];

    setMessages(finalMessages);

    //Save chat (CREATE or UPDATE)
    const saveRes = await fetch("http://localhost:3000/chat/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chatId: activeChatId,
        domain,
        messages: finalMessages,
      }),
    });

    const saveData = await saveRes.json();

    //If new chat → update sidebar
    if (!activeChatId) {
      setActiveChatId(saveData.chatId);
      setChatSessions(prev => [
        {
          id: saveData.chatId,
          title: finalMessages[0].text.slice(0, 30),
          messages: finalMessages,
        },
        ...prev,
      ]);
    }
  } catch (err) {
    setMessages(prev => [
      ...prev,
      { sender: "ai", text: "Something went wrong." },
    ]);
  } finally {
    setIsTyping(false);
  }
};


  const createNewChat = () => {
  setActiveChatId(null);  
  setMessages([]);
  setIsChatSaved(false);
};

  const handleDeleteChat = async (chatId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      await fetch(`http://localhost:3000/chat/delete/${chatId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      setChatSessions((prev) => prev.filter((chat) => chat.id !== chatId));
      setOpenMenuId(null);
      
      if (renamingChatId === chatId) {
        setRenamingChatId(null);
        setRenameValue("");
      }

      if (activeChatId === chatId) {
        createNewChat();
      }
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  const handleRenameChat = (chatId, currentTitle) => {
    setRenamingChatId(chatId);
    setRenameValue(currentTitle);
    setOpenMenuId(null);
  };

  const handleSaveRename = async (chatId) => {
    const newTitle = renameValue.trim();
    if (!newTitle) {
      setRenamingChatId(null);
      setRenameValue("");
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      await fetch(`http://localhost:3000/chat/rename/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle })
      });

      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, title: newTitle } : chat
        )
      );
    } catch (err) {
      console.error("Failed to rename chat", err);
    } finally {
      setRenamingChatId(null);
      setRenameValue("");
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Voice input not supported in this browser");
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* NAVBAR */}
      <Navbar
        onSignInClick={() => {
          if (!user && !loading) {
            setShowSignIn(true);
            setSidebarOpen(false);
          }
        }}
      />

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        {!showSignIn && (
          <div className="relative flex h-full">
            {/* SIDEBAR */}

            <aside
              className={`
      bg-neutral-900/95 border-r border-neutral-800
      transition-all duration-300 ease-in-out
      ${
        sidebarOpen
          ? "w-72 p-5 md:relative md:block absolute inset-y-0 left-0 z-50"
          : "w-0 p-0 border-none md:w-0"
      }
      flex flex-col
      overflow-hidden
      md:relative
    `}
            >
              {/* Mobile Close Button */}
              <div className="flex justify-end md:hidden">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="
      text-white
      text-2xl
      font-bold
      px-2
      hover:text-orange-500
      transition
    "
                  aria-label="Close sidebar"
                >
                  ×
                </button>
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Cinecrafit AI</h2>
                <p className="text-sm text-neutral-400">
                  Verified Deals Assistant
                </p>
              </div>

              <div className="border-t border-neutral-800 my-4" />

              
              <div className="mb-6">
                <h3 className="text-xs uppercase text-neutral-400 mb-3">
                  Capabilities
                </h3>
                <ul className="space-y-3 text-sm text-neutral-300">
                  <li>🎬 Movie ticket offers</li>
                  <li>👕 Fashion & accessories deals</li>
                  <li>🍔 Food discounts nearby</li>
                </ul>
              </div>

              <div className="border-t border-neutral-800 my-4" />

              {/* CHAT HISTORY */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs uppercase text-neutral-400">
                    Your Chats
                  </h3>

                
                  <button
                    onClick={createNewChat}
                    title="New Chat"
                    className="
        w-7 h-7 flex items-center justify-center
        rounded-md
        text-neutral-300
        hover:bg-neutral-800 hover:text-orange-400
        transition
      "
                  >
                    +
                  </button>
                </div>

                {/* Scrollable Chat List */}
                <div className="space-y-1 overflow-y-auto h-[45vh] pr-1">
                  {chatSessions.length === 0 && (
                    <p className="text-xs text-neutral-500 px-2">
                      No chats yet
                    </p>
                  )}

                  {chatSessions.map((chat) => (
                    <div key={chat.id}>
                      {renamingChatId === chat.id ? (
                        <div className="flex gap-2 px-2 py-2">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(chat.id);
                              if (e.key === "Escape") setRenamingChatId(null);
                            }}
                            className="flex-1 bg-neutral-800 text-white rounded px-2 py-1 text-sm outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(chat.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`
            px-2 py-2 rounded-md cursor-pointer
            text-sm flex items-center justify-between group
            ${
              chat.id === activeChatId
                ? "bg-neutral-800 text-white"
                : "text-neutral-300 hover:bg-neutral-800"
            }
          `}
                        >
                          <div
                            onClick={() => loadChat(chat)}
                            className="flex-1 truncate"
                          >
                            {chat.title}
                          </div>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(
                                  openMenuId === chat.id ? null : chat.id
                                );
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity px-1 text-neutral-400 hover:text-orange-400"
                            >
                              ⋯
                            </button>
                            {openMenuId === chat.id && (
                              <div className="absolute right-0 mt-1 bg-neutral-800 rounded-md shadow-lg z-50 border border-neutral-700">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenameChat(chat.id, chat.title);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-orange-400 transition"
                                >
                                  Rename
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChat(chat.id);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-red-400 transition border-t border-neutral-700"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
        
        {!showSignIn && (
          <div className="w-8 flex items-start justify-center pt-2 pl-6 bg-transparent">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="
        flex items-center justify-center
        bg-orange-500 hover:bg-orange-600
        px-1 py-0.5 md:px-2 md:py-1
        rounded-md
        text-sm font-extrabold
        border border-white
        z-40
      "
            >
              {sidebarOpen ? "<<" : ">>"}
            </button>
          </div>
        )}

        {/* CHAT AREA */}
        <main className="flex-1 flex justify-center relative">
          <div className="w-full max-w-5xl flex flex-col">
           
            {messages.length === 0 && !isTyping && (
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-center text-lg text-neutral-400">
                {config.title}
                <span className="text-white ml-1">{config.subtitle}</span>
              </div>
            )}

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-4 md:px-16 py-8 space-y-6 chat-scroll">
              {messages.length === 0 && !isTyping && (
                <div className="text-center text-xl text-neutral-400 mt-32">
                  {config.emptyPrompt}
                </div>
              )}

              {messages.map((msg, index) =>
                msg.sender === "user" ? (
                  <div key={index} className="flex justify-end">
                    <div className="bg-orange-500 text-black px-5 py-3 rounded-xl max-w-xl">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 bg-orange-500 text-black flex items-center justify-center rounded-full text-xs font-bold">
                      AI
                    </div>
                    <div className="bg-neutral-800 px-5 py-3 rounded-xl max-w-xl text-neutral-200 whitespace-pre-line">
                      {msg.text}
                    </div>
                  </div>
                )
              )}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-black flex items-center justify-center rounded-full text-xs font-bold">
                    AI
                  </div>
                  <div className="text-neutral-400 italic">
                    Cinecrafit AI is thinking
                    <span className="animate-pulse">...</span>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT */}
            <div className="px-4 md:px-16 py-6 border-t border-neutral-800 bg-black">
              <div className={`flex items-center gap-2 md:gap-4 rounded-2xl px-3 md:px-4 py-2 md:py-3 transition-all duration-300 ${listening ? "bg-neutral-900 ring-2 ring-orange-500/70 shadow-[0_0_0_12px_rgba(249,115,22,0.20)] animate-pulse" : "bg-neutral-900"}`}>
                {listening && (
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                )}
                <input
                  type="text"
                  placeholder={config.inputPlaceholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-transparent outline-none text-white text-sm md:text-base"
                />
                <button
                  onClick={handleMicClick}
                  className={`
    px-2 md:px-3 py-1 md:py-2 rounded-lg border text-sm
    ${
      listening
        ? "bg-orange-500 text-black border-orange-500 animate-pulse"
        : "bg-orange-500 border-neutral-700 hover:bg-orange-600"
    }
  `}
                  title="Voice input"
                >
                  <FontAwesomeIcon
                    icon={faMicrophone}
                    size="lg"
                    className="text-sm md:text-lg"
                    style={{ color: "#fffdf5" }}
                  />
                </button>

                <button
                  onClick={handleSend}
                  className="px-3 md:px-4 py-1 md:py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold text-sm md:text-base"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {!loading && (
        <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
      )}
    </div>
  );
};

export default Movie_Offers;
