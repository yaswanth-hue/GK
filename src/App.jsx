import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/SignUp";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import AddResource from "./pages/AddResource";
import ManageResources from "./pages/ManageResources";
import InstrumentPage from "./pages/InstrumentPage";
import ResourceListPage from "./pages/ResourceListPage";
import AudioRoom from './components/AudioRoom';
import AudioRoomList from './components/AudioRoomList';

// import Header from "./pages/LogoWithText";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Root route: Landing page for guests, home for logged-in users */}
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/home" />} />

        {/* Public routes */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/signup" />} />

        {/* Protected routes */}
        <Route path="/home" element={user ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/add-resource" element={user ? <AddResource /> : <Navigate to="/login" />} />
        <Route path="/manage-resources" element={user ? <ManageResources /> : <Navigate to="/login" />} />
        <Route path="/instrument/:instrument" element={user ? <InstrumentPage /> : <Navigate to="/login" />} />
        <Route path="/instrument/:instrument/:level" element={user ? <ResourceListPage /> : <Navigate to="/login" />} />
        
        {/* Audio Room routes */}
        <Route path="/audio-rooms" element={user ? <AudioRoomList /> : <Navigate to="/login" />} />
        <Route path="/audio-room/:roomId" element={user ? <AudioRoom /> : <Navigate to="/login" />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
