import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Movie_Offers from "./components/Movie_offers";
import Fashion_Offers from "./components/Fashion_offers";
import Food_Offers from "./components/Food_offers";
import TestMode from "./components/TestMode";
import AdminPanel from "./components/AdminPanel";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./context/AuthContext";

function App() {
  const { userProfile } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Navigate to="/movie-offers" replace />} />
      <Route path="/movie-offers" element={<Movie_Offers />} />
      <Route path="/fashion-deals" element={<Fashion_Offers />} />
      <Route path="/food-specials" element={<Food_Offers />} />
      <Route path="/test-mode" element={<ErrorBoundary><TestMode /></ErrorBoundary>} />
      <Route 
        path="/admin/verify" 
        element={
          userProfile?.isAdmin ? (
            <ErrorBoundary><AdminPanel /></ErrorBoundary>
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
    </Routes>
  );
}

export default App;