import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "../firebase";

const googleProvider = new GoogleAuthProvider();

const SignInModal = ({ isOpen, onClose }) => {
  const [userType, setUserType] = useState("customer");
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Merchant specific fields
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Restaurant / Food Outlet");
  const [businessLocation, setBusinessLocation] = useState("");
  const [verificationType, setVerificationType] = useState("GST Number");
  const [verificationValue, setVerificationValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const buildPayload = (idToken) => {
    const payload = {
      idToken,
      role: userType,
    };
    if (userType === "merchant") {
      payload.merchantData = {
        businessName,
        businessType,
        businessLocation,
        verificationType,
        verificationValue,
        website: verificationType === "Business Website" ? verificationValue : "",
      };
    }
    return payload;
  };

  //EMAIL SIGN IN
  const handleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const idToken = await userCred.user.getIdToken();

      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(idToken)),
      });

      if (!res.ok) throw new Error("Backend verification failed");

      console.log("✅ Email user verified");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  //GOOGLE SIGN IN
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(idToken)),
      });

      if (!res.ok) throw new Error("Backend verification failed");

      console.log("✅ Google user verified");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  //SIGN UP
  const handleSignUp = async () => {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();

      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(idToken)),
      });

      if (!res.ok) throw new Error("Backend verification failed");

      console.log("✅ Account created and verified");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100002]"
      />

      <div className="fixed inset-0 z-[100003] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white"
          >
            ✕
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">
              🔥 <span className="text-orange-500">Cincrafit</span>
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              {mode === "signin" ? "Sign in to continue" : "Create your account"}
            </p>
          </div>

          {/* TOGGLE TABS */}
          <div className="flex bg-black rounded-lg p-1 mb-6 border border-neutral-800">
            <button
              onClick={() => { setUserType("customer"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
                userType === "customer" ? "bg-orange-500 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              Customer / User
            </button>
            <button
              onClick={() => { setUserType("merchant"); setError(""); setMode("signin"); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
                userType === "merchant" ? "bg-orange-500 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              Company / Merchant
            </button>
          </div>

          <div className="space-y-4">
            {userType === "merchant" && (
              <>
                <input
                  type="text"
                  placeholder="Business Name (e.g. Mio Amore)"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-neutral-700 rounded-lg text-sm"
                />
                
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-neutral-700 rounded-lg text-sm appearance-none"
                >
                  <option value="Restaurant / Food Outlet">Restaurant / Food Outlet</option>
                  <option value="Fashion Brand / Clothing">Fashion Brand / Clothing</option>
                  <option value="Cinema / Entertainment">Cinema / Entertainment</option>
                  <option value="Retail Store">Retail Store</option>
                  <option value="Cafe / Bakery">Cafe / Bakery</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Local Shop / MSME">Local Shop / MSME</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="text"
                  placeholder="Business Location (e.g. Salt Lake, Kolkata)"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-neutral-700 rounded-lg text-sm"
                />

                <select
                  value={verificationType}
                  onChange={(e) => setVerificationType(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-neutral-700 rounded-lg text-sm appearance-none"
                >
                  <option value="GST Number">GST Number</option>
                  <option value="Business Website">Business Website</option>
                  <option value="Store License">Store License</option>
                  <option value="Trade License">Trade License</option>
                </select>

                <input
                  type="text"
                  placeholder={
                    verificationType === "Business Website"
                      ? "Website URL (e.g. https://mioamore.in)"
                      : `${verificationType} Value`
                  }
                  value={verificationValue}
                  onChange={(e) => setVerificationValue(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-neutral-700 rounded-lg text-sm"
                />
              </>
            )}

            <input
              type="email"
              placeholder={userType === "merchant" ? "Official Business Email" : "Email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-neutral-700 rounded-lg text-sm"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-neutral-700 rounded-lg text-sm"
            />

            {mode === "signup" && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-neutral-700 rounded-lg text-sm"
              />
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              disabled={loading}
              onClick={mode === "signin" ? handleSignIn : handleSignUp}
              className="w-full py-3 rounded-lg bg-orange-500 font-semibold disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </div>

          {/* GOOGLE SIGN IN */}
          {mode === "signin" && (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-neutral-800" />
                <span className="text-xs text-neutral-500">OR</span>
                <div className="flex-1 h-px bg-neutral-800" />
              </div>

              <button
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-neutral-700 hover:bg-neutral-800 disabled:opacity-60"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="text-sm">Continue with Google</span>
              </button>
            </>
          )}

          <p className="text-xs text-neutral-400 text-center mt-6">
            {mode === "signin" ? (
              <>Don’t have an account? <span onClick={() => setMode("signup")} className="text-orange-500 cursor-pointer">Create one</span></>
            ) : (
              <>Already have an account? <span onClick={() => setMode("signin")} className="text-orange-500 cursor-pointer">Sign in</span></>
            )}
          </p>

        </div>
      </div>
    </>
  );
};

export default SignInModal;
