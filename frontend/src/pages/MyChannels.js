import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

function MyChannels({ user }) {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const res = await authAxios.get('/channels/my/created');
      setChannels(res.data);
    } catch (error) {
      toast.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <nav className="navbar px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button data-testid="back-btn" variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
              <ArrowLeft size={18} />
              Back
            </Button>
            <span className="text-2xl font-bold gradient-text">My Channels</span>
          </div>
          <Button
            data-testid="create-new-channel-btn"
            onClick={() => navigate('/create-channel')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Create New
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : channels.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <h2 className="text-2xl font-bold gradient-text mb-4">No Channels Yet</h2>
            <p className="text-gray-600 mb-6">Start building your creator business by creating your first channel!</p>
            <Button
              data-testid="create-first-channel-btn"
              onClick={() => navigate('/create-channel')}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Create Your First Channel
            </Button>
          </div>
        ) : (
          <div data-testid="my-channels-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((channel) => (
              <div
                key={channel.id}
                data-testid={`my-channel-card-${channel.id}`}
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
                  {!channel.cover_image && <span className="text-4xl font-bold text-white">{channel.name[0]}</span>}
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
                        ₹{channel.total_raised.toLocaleString()} / ₹{channel.goal_amount.toLocaleString()}
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
                    <span className="text-gray-600">{channel.status}</span>
                    <span className="font-semibold text-purple-600">{channel.equity_percentage}% equity</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyChannels;