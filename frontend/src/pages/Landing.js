import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, TrendingUp, Shield, Zap, Sparkles, Rocket, DollarSign } from 'lucide-react';

function Landing({ setUser }) {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Create floating particles
    const createParticles = () => {
      const container = document.querySelector('.hero-section');
      if (!container) return;
      
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 6}s`;
        particle.style.animationDuration = `${4 + Math.random() * 4}s`;
        container.appendChild(particle);
      }
    };
    
    setTimeout(createParticles, 100);
  }, []);

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
    <div className="min-h-screen animated-bg">
      {/* Hero Section */}
      <nav className="navbar px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 fade-in">
            <div className="w-12 h-12 rounded-2xl gradient-bg-primary flex items-center justify-center rotating-border">
              <Zap className="text-white" size={28} />
            </div>
            <span className="text-2xl font-bold gradient-text glow-text">CreatorFund</span>
          </div>
          <Button data-testid="login-btn" onClick={() => setShowAuth(true)} className="btn-primary fade-in-delay-1">
            <Sparkles size={16} className="mr-2" />
            Login / Sign Up
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20 hero-section relative">
        <div className="text-center fade-in">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-effect mb-8 fade-in-delay-1">
            <Rocket size={20} className="text-purple-400" />
            <span className="text-sm font-semibold text-white">The Future of Creator Economy</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold gradient-text glow-text mb-8 leading-tight">
            Invest in Creators.
            <br />
            <span className="float-slow inline-block">Build Channels Together.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed fade-in-delay-1">
            The equity platform for the creator economy. Team up with collaborators, get funded by fans, and share
            profits automatically—starting at just <span className="font-bold text-purple-400">₹500</span>.
          </p>
          
          <div className="flex gap-6 justify-center fade-in-delay-2">
            <Button
              data-testid="get-started-btn"
              onClick={() => setShowAuth(true)}
              className="btn-primary text-lg px-10 py-5 text-lg"
            >
              <Rocket size={20} className="mr-2" />
              Get Started Now
            </Button>
            <Button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="glass-effect text-white px-10 py-5 text-lg rounded-full font-semibold hover:bg-white/10 transition-all"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 fade-in-delay-2">
            <div className="glass-effect rounded-3xl p-8 hover-lift">
              <div className="text-5xl font-bold gradient-text mb-2">₹10K+</div>
              <div className="text-gray-400">Starting Balance</div>
            </div>
            <div className="glass-effect rounded-3xl p-8 hover-lift">
              <div className="text-5xl font-bold gradient-text mb-2">₹500</div>
              <div className="text-gray-400">Min Investment</div>
            </div>
            <div className="glass-effect rounded-3xl p-8 hover-lift">
              <div className="text-5xl font-bold gradient-text mb-2">100%</div>
              <div className="text-gray-400">Automated</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="stat-card hover-lift text-center card-3d fade-in">
            <div className="feature-icon mx-auto mb-6">
              <Users className="text-purple-400" size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Team Collaboration</h3>
            <p className="text-gray-300 leading-relaxed">
              Build channels together with automated profit splits. Everyone gets paid fairly based on contribution.
            </p>
          </div>

          <div className="stat-card hover-lift text-center card-3d fade-in-delay-1">
            <div className="feature-icon mx-auto mb-6">
              <TrendingUp className="text-pink-400" size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Fan Investment</h3>
            <p className="text-gray-300 leading-relaxed">
              Invest in rising creators starting at ₹500. Earn profit-sharing returns as they grow.
            </p>
          </div>

          <div className="stat-card hover-lift text-center card-3d fade-in-delay-2">
            <div className="feature-icon mx-auto mb-6">
              <Shield className="text-cyan-400" size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Automated Splits</h3>
            <p className="text-gray-300 leading-relaxed">
              Transparent profit distribution system. All payouts are calculated and distributed automatically.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="glass-effect rounded-3xl p-16 max-w-4xl mx-auto hover-lift">
            <Sparkles size={48} className="mx-auto mb-6 text-purple-400" />
            <h2 className="text-4xl font-bold gradient-text glow-text mb-6">
              Ready to Transform Your Creator Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of creators and investors building the future together.
            </p>
            <Button
              data-testid="cta-get-started-btn"
              onClick={() => setShowAuth(true)}
              className="btn-primary text-lg px-12 py-5"
            >
              <Rocket size={20} className="mr-2" />
              Start Your Journey
            </Button>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md bg-[#0A0A0F] border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold gradient-text text-center glow-text">Welcome to CreatorFund</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger data-testid="login-tab" value="login" className="data-[state=active]:bg-purple-600">Login</TabsTrigger>
              <TabsTrigger data-testid="signup-tab" value="signup" className="data-[state=active]:bg-purple-600">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
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
                  <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
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
                  <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
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
                  <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
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
                  <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
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
                  <label className="block text-sm font-medium mb-2 text-gray-300">I am a...</label>
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