import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Wallet, TrendingUp, Users, Plus, LogOut, Zap, Sparkles, ArrowRight } from 'lucide-react';

function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const res = await authAxios.get('/channels');
      setChannels(res.data);
    } catch (error) {
      toast.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen animated-bg">
      {/* Navbar */}
      <nav className="navbar px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
              <span
                data-testid="logo"
                className="text-2xl font-bold gradient-text glow-text cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                CreatorFund
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                data-testid="explore-channels-btn"
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="font-medium text-gray-300 hover:text-white animated-underline"
              >
                Explore
              </Button>
              {user.user_type === 'creator' && (
                <Button
                  data-testid="my-channels-btn"
                  variant="ghost"
                  onClick={() => navigate('/my-channels')}
                  className="font-medium text-gray-300 hover:text-white animated-underline"
                >
                  My Channels
                </Button>
              )}
              {user.user_type === 'investor' && (
                <Button
                  data-testid="my-investments-btn"
                  variant="ghost"
                  onClick={() => navigate('/my-investments')}
                  className="font-medium text-gray-300 hover:text-white animated-underline"
                >
                  My Investments
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div data-testid="user-balance" className="glass-effect px-5 py-3 rounded-full flex items-center gap-3">
              <Wallet size={20} className="text-purple-400" />
              <span className="font-bold text-white text-lg">₹{user.balance?.toLocaleString()}</span>
            </div>
            <div className="glass-effect px-4 py-2 rounded-full">
              <span className={`badge ${user.user_type === 'creator' ? 'badge-creator' : 'badge-investor'}`}>
                {user.user_type}
              </span>
            </div>
            {user.user_type === 'creator' && (
              <Button
                data-testid="create-channel-btn"
                onClick={() => navigate('/create-channel')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Create Channel
              </Button>
            )}
            <Button data-testid="logout-btn" variant="ghost" onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
            <Sparkles size={18} className="text-purple-400" />
            <span className="text-sm font-semibold text-gray-300">Welcome back</span>
          </div>
          <h1 data-testid="dashboard-welcome" className="text-5xl font-bold gradient-text glow-text mb-3">
            Hey, {user.name}!
          </h1>
          <p className="text-xl text-gray-300">
            {user.user_type === 'creator'
              ? 'Create channels, collaborate with teams, and grow your creator business.'
              : 'Discover amazing creators and invest in their journey.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="stat-card hover-lift card-3d">
            <div className="flex items-center justify-between mb-6">
              <div className="feature-icon">
                <Wallet className="text-purple-400" size={32} />
              </div>
            </div>
            <h3 className="text-4xl font-bold mb-2 gradient-text">₹{user.balance?.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm font-medium">Available Balance</p>
          </div>

          <div className="stat-card hover-lift card-3d">
            <div className="flex items-center justify-between mb-6">
              <div className="feature-icon">
                <TrendingUp className="text-pink-400" size={32} />
              </div>
            </div>
            <h3 className="text-4xl font-bold mb-2 gradient-text">{channels.length}</h3>
            <p className="text-gray-400 text-sm font-medium">Active Channels</p>
          </div>

          <div className="stat-card hover-lift card-3d">
            <div className="flex items-center justify-between mb-6">
              <div className="feature-icon">
                <Users className="text-cyan-400" size={32} />
              </div>
            </div>
            <h3 className="text-4xl font-bold mb-2 gradient-text">
              ₹{channels.reduce((sum, ch) => sum + (ch.total_raised || 0), 0).toLocaleString()}
            </h3>
            <p className="text-gray-400 text-sm font-medium">Total Raised</p>
          </div>
        </div>

        {/* Channels Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold gradient-text glow-text mb-2">Explore Channels</h2>
              <p className="text-gray-400">Discover and invest in rising creators</p>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading channels...</p>
            </div>
          ) : channels.length === 0 ? (
            <div className="text-center py-20 glass-effect rounded-3xl">
              <Sparkles size={64} className="mx-auto mb-4 text-purple-400" />
              <p className="text-xl text-gray-300">No channels yet. Be the first to create one!</p>
            </div>
          ) : (
            <div data-testid="channels-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {channels.map((channel, index) => (
                <div
                  key={channel.id}
                  data-testid={`channel-card-${channel.id}`}
                  className="channel-card group"
                  onClick={() => navigate(`/channel/${channel.id}`)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className="h-48 gradient-bg-primary flex items-center justify-center relative overflow-hidden"
                    style={{
                      backgroundImage: channel.cover_image ? `url(${channel.cover_image})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!channel.cover_image && (
                      <span className="text-5xl font-bold text-white group-hover:scale-110 transition-transform duration-500">{channel.name[0]}</span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-bold text-white">{channel.name}</h3>
                      <span className="badge badge-creator text-xs">{channel.category}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">{channel.description}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-400">Raised</span>
                        <span className="font-bold text-white">
                          ₹{channel.total_raised?.toLocaleString()} / ₹{channel.goal_amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min((channel.total_raised / channel.goal_amount) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">by {channel.creator_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-400">{channel.equity_percentage}% equity</span>
                        <ArrowRight size={16} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;