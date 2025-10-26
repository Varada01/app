import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Wallet, TrendingUp, Users, Plus, LogOut } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Navbar */}
      <nav className="navbar px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span
              data-testid="logo"
              className="text-2xl font-bold gradient-text cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              CreatorFund
            </span>
            <div className="flex gap-4">
              <Button
                data-testid="explore-channels-btn"
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="font-medium"
              >
                Explore
              </Button>
              {user.user_type === 'creator' && (
                <Button
                  data-testid="my-channels-btn"
                  variant="ghost"
                  onClick={() => navigate('/my-channels')}
                  className="font-medium"
                >
                  My Channels
                </Button>
              )}
              {user.user_type === 'investor' && (
                <Button
                  data-testid="my-investments-btn"
                  variant="ghost"
                  onClick={() => navigate('/my-investments')}
                  className="font-medium"
                >
                  My Investments
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div data-testid="user-balance" className="glass-effect px-4 py-2 rounded-full flex items-center gap-2">
              <Wallet size={18} className="text-purple-600" />
              <span className="font-semibold">₹{user.balance?.toLocaleString()}</span>
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
            <Button data-testid="logout-btn" variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 data-testid="dashboard-welcome" className="text-4xl font-bold gradient-text mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600">
            {user.user_type === 'creator'
              ? 'Create channels, collaborate with teams, and grow your creator business.'
              : 'Discover amazing creators and invest in their journey.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full gradient-bg-primary flex items-center justify-center">
                <Wallet className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">₹{user.balance?.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Available Balance</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full gradient-bg-secondary flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{channels.length}</h3>
            <p className="text-gray-600 text-sm">Active Channels</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)' }}
              >
                <Users className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {channels.reduce((sum, ch) => sum + (ch.total_raised || 0), 0).toLocaleString()}
            </h3>
            <p className="text-gray-600 text-sm">Total Raised (₹)</p>
          </div>
        </div>

        {/* Channels Grid */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Explore Channels</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : channels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No channels yet. Be the first to create one!</p>
            </div>
          ) : (
            <div data-testid="channels-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  data-testid={`channel-card-${channel.id}`}
                  className="channel-card"
                  onClick={() => navigate(`/channel/${channel.id}`)}
                >
                  <div
                    className="h-40 gradient-bg-primary flex items-center justify-center"
                    style={{
                      backgroundImage: channel.cover_image ? `url(${channel.cover_image})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!channel.cover_image && (
                      <span className="text-4xl font-bold text-white">{channel.name[0]}</span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold">{channel.name}</h3>
                      <span className="badge badge-creator text-xs">{channel.category}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{channel.description}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Raised</span>
                        <span className="font-semibold">
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
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">by {channel.creator_name}</span>
                      <span className="font-semibold text-purple-600">{channel.equity_percentage}% equity</span>
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