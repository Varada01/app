import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateChannel from './pages/CreateChannel';
import ChannelDetail from './pages/ChannelDetail';
import MyChannels from './pages/MyChannels';
import MyInvestments from './pages/MyInvestments';
import { Toaster } from './components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const authAxios = axios.create({
  baseURL: API,
});

// Add token to requests
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAxios
        .get('/auth/me')
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing setUser={setUser} />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/" />}
          />
          <Route
            path="/create-channel"
            element={user?.user_type === 'creator' ? <CreateChannel user={user} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/channel/:id"
            element={user ? <ChannelDetail user={user} setUser={setUser} /> : <Navigate to="/" />}
          />
          <Route
            path="/my-channels"
            element={user?.user_type === 'creator' ? <MyChannels user={user} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/my-investments"
            element={user?.user_type === 'investor' ? <MyInvestments user={user} /> : <Navigate to="/dashboard" />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;