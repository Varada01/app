import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, TrendingUp, Shield, Zap } from 'lucide-react';

function Landing({ setUser }) {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    try {
      const res = await axios.post(`${API}/auth/register`, {
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
        user_type: formData.get('user_type'),
      });

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Welcome to CreatorFund!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    try {
      const res = await axios.post(`${API}/auth/login`, {
        email: formData.get('email'),
        password: formData.get('password'),
      });

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Hero Section */}
      <nav className="navbar px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-bg-primary flex items-center justify-center">
              <Zap className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold gradient-text">CreatorFund</span>
          </div>
          <Button data-testid="login-btn" onClick={() => setShowAuth(true)} className="btn-primary">
            Login / Sign Up
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold gradient-text mb-6">
            Invest in Creators.
            <br />
            Build Channels Together.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The equity platform for the creator economy. Team up with collaborators, get funded by fans, and share
            profits automatically—starting at just ₹500.
          </p>
          <Button
            data-testid="get-started-btn"
            onClick={() => setShowAuth(true)}
            className="btn-primary text-lg px-8 py-4"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="stat-card hover-lift text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg-primary flex items-center justify-center">
              <Users className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Team Collaboration</h3>
            <p className="text-gray-600">
              Build channels together with automated profit splits. Everyone gets paid fairly based on contribution.
            </p>
          </div>

          <div className="stat-card hover-lift text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg-secondary flex items-center justify-center">
              <TrendingUp className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Fan Investment</h3>
            <p className="text-gray-600">
              Invest in rising creators starting at ₹500. Earn profit-sharing returns as they grow.
            </p>
          </div>

          <div className="stat-card hover-lift text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full" style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)' }}>
              <Shield className="text-white" size={32} style={{ margin: 'auto', marginTop: '12px' }} />
            </div>
            <h3 className="text-xl font-bold mb-3">Automated Splits</h3>
            <p className="text-gray-600">
              Transparent profit distribution system. All payouts are calculated and distributed automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text text-center">Welcome to CreatorFund</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger data-testid="login-tab" value="login">Login</TabsTrigger>
              <TabsTrigger data-testid="signup-tab" value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    data-testid="login-email"
                    type="email"
                    name="email"
                    required
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    data-testid="login-password"
                    type="password"
                    name="password"
                    required
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
                <Button data-testid="login-submit-btn" type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleRegister} className="space-y-4" data-testid="signup-form">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    data-testid="signup-name"
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    data-testid="signup-email"
                    type="email"
                    name="email"
                    required
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    data-testid="signup-password"
                    type="password"
                    name="password"
                    required
                    minLength="6"
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">I am a...</label>
                  <select data-testid="signup-user-type" name="user_type" required className="input-field">
                    <option value="creator">Creator</option>
                    <option value="investor">Investor</option>
                  </select>
                </div>
                <Button data-testid="signup-submit-btn" type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Landing;