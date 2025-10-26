import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Users, TrendingUp, DollarSign, Share2 } from 'lucide-react';

function ChannelDetail({ user, setUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [team, setTeam] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [profits, setProfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadChannelData();
  }, [id]);

  const loadChannelData = async () => {
    try {
      const [channelRes, teamRes, investorsRes, profitsRes] = await Promise.all([
        authAxios.get(`/channels/${id}`),
        authAxios.get(`/channels/${id}/team`),
        authAxios.get(`/channels/${id}/investors`),
        authAxios.get(`/profits/${id}`),
      ]);

      setChannel(channelRes.data);
      setTeam(teamRes.data);
      setInvestors(investorsRes.data);
      setProfits(profitsRes.data);
    } catch (error) {
      toast.error('Failed to load channel data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const formData = new FormData(e.target);

    try {
      await authAxios.post('/investments', {
        channel_id: id,
        amount: parseFloat(formData.get('amount')),
      });

      // Refresh user data
      const userRes = await authAxios.get('/auth/me');
      setUser(userRes.data);

      toast.success('Investment successful!');
      setShowInvestModal(false);
      loadChannelData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Investment failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const formData = new FormData(e.target);

    try {
      await authAxios.post(`/channels/${id}/team`, {
        user_email: formData.get('user_email'),
        role: formData.get('role'),
        profit_split_percentage: parseFloat(formData.get('profit_split_percentage')),
      });

      toast.success('Team member added!');
      setShowTeamModal(false);
      loadChannelData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add team member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDistributeProfit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const formData = new FormData(e.target);

    try {
      await authAxios.post('/profits/distribute', {
        channel_id: id,
        total_profit: parseFloat(formData.get('total_profit')),
      });

      // Refresh user data
      const userRes = await authAxios.get('/auth/me');
      setUser(userRes.data);

      toast.success('Profits distributed successfully!');
      setShowProfitModal(false);
      loadChannelData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to distribute profits');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isCreator = channel.creator_id === user.id;
  const progressPercentage = Math.min((channel.total_raised / channel.goal_amount) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <nav className="navbar px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button data-testid="back-to-dashboard" variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
              <ArrowLeft size={18} />
              Back
            </Button>
            <span className="text-2xl font-bold gradient-text">Channel Details</span>
          </div>
          <div className="flex items-center gap-4">
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
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Channel Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div
            className="h-64 gradient-bg-primary flex items-center justify-center"
            style={{
              backgroundImage: channel.cover_image ? `url(${channel.cover_image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!channel.cover_image && <span className="text-6xl font-bold text-white">{channel.name[0]}</span>}
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 data-testid="channel-name" className="text-4xl font-bold gradient-text mb-2">{channel.name}</h1>
                <p className="text-gray-600">
                  by <span className="font-semibold">{channel.creator_name}</span> •{' '}
                  <span className="badge badge-creator text-xs">{channel.category}</span>
                </p>
              </div>
              {user.user_type === 'investor' && !isCreator && (
                <Button
                  data-testid="invest-btn"
                  onClick={() => setShowInvestModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <DollarSign size={18} />
                  Invest Now
                </Button>
              )}
              {isCreator && (
                <div className="flex gap-3">
                  <Button
                    data-testid="add-team-member-btn"
                    onClick={() => setShowTeamModal(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Users size={18} />
                    Add Team
                  </Button>
                  <Button
                    data-testid="distribute-profit-btn"
                    onClick={() => setShowProfitModal(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Share2 size={18} />
                    Distribute Profit
                  </Button>
                </div>
              )}
            </div>

            <p data-testid="channel-description" className="text-gray-700 mb-6">{channel.description}</p>

            {/* Funding Progress */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Raised</p>
                  <p data-testid="raised-amount" className="text-3xl font-bold gradient-text">
                    ₹{channel.total_raised.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Goal</p>
                  <p className="text-3xl font-bold">₹{channel.goal_amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="progress-bar mb-2">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p className="text-sm text-gray-600 text-center">{progressPercentage.toFixed(1)}% funded</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="stat-card">
                <p className="text-sm text-gray-600 mb-1">Total Equity Offered</p>
                <p className="text-2xl font-bold gradient-text">{channel.equity_percentage}%</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-gray-600 mb-1">Total Investors</p>
                <p className="text-2xl font-bold">{investors.length}</p>
              </div>
              <div className="stat-card">
                <p className="text-sm text-gray-600 mb-1">Team Members</p>
                <p className="text-2xl font-bold">{team.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="team" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger data-testid="team-tab" value="team">Team ({team.length})</TabsTrigger>
            <TabsTrigger data-testid="investors-tab" value="investors">Investors ({investors.length})</TabsTrigger>
            <TabsTrigger data-testid="profits-tab" value="profits">Profit History ({profits.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            {team.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Users className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">No team members yet.</p>
              </div>
            ) : (
              <div data-testid="team-list" className="grid md:grid-cols-2 gap-6">
                {team.map((member) => (
                  <div key={member.id} className="stat-card hover-lift">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{member.user_name}</h3>
                        <p className="text-sm text-gray-600">{member.user_email}</p>
                      </div>
                      <span className="badge badge-creator">{member.role}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profit Split</span>
                      <span className="font-bold text-purple-600">{member.profit_split_percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="investors">
            {investors.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <TrendingUp className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">No investors yet. Be the first!</p>
              </div>
            ) : (
              <div data-testid="investors-list" className="grid md:grid-cols-2 gap-6">
                {investors.map((investor) => (
                  <div key={investor.id} className="stat-card hover-lift">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{investor.investor_name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(investor.investment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Investment</span>
                      <span className="font-bold text-green-600">₹{investor.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Equity</span>
                      <span className="font-bold text-purple-600">{investor.equity_percentage.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profits">
            {profits.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Share2 className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">No profit distributions yet.</p>
              </div>
            ) : (
              <div data-testid="profits-list" className="space-y-6">
                {profits.map((profit) => (
                  <div key={profit.id} className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl gradient-text">₹{profit.total_profit.toLocaleString()}</h3>
                        <p className="text-sm text-gray-600">
                          Distributed on {new Date(profit.distribution_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {profit.distributions.map((dist, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <span
                              className={`badge text-xs ${
                                dist.type === 'creator'
                                  ? 'badge-creator'
                                  : dist.type === 'investor'
                                  ? 'badge-investor'
                                  : 'bg-green-500 text-white'
                              }`}
                            >
                              {dist.type}
                            </span>
                            <span className="font-medium">{dist.user_name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{dist.amount.toFixed(2)}</p>
                            {dist.percentage > 0 && <p className="text-xs text-gray-500">{dist.percentage}%</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Investment Modal */}
      <Dialog open={showInvestModal} onOpenChange={setShowInvestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text">Invest in {channel.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvest} className="space-y-4" data-testid="invest-form">
            <div>
              <label className="block text-sm font-medium mb-2">Investment Amount (₹)</label>
              <input
                data-testid="invest-amount"
                type="number"
                name="amount"
                required
                min="500"
                step="100"
                className="input-field"
                placeholder="5000"
              />
              <p className="text-sm text-gray-500 mt-1">Minimum investment: ₹500</p>
              <p className="text-sm text-gray-500">Your balance: ₹{user.balance.toLocaleString()}</p>
            </div>
            <Button data-testid="invest-submit-btn" type="submit" disabled={actionLoading} className="btn-primary w-full">
              {actionLoading ? 'Processing...' : 'Invest Now'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Team Modal */}
      <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text">Add Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTeamMember} className="space-y-4" data-testid="add-team-form">
            <div>
              <label className="block text-sm font-medium mb-2">User Email</label>
              <input
                data-testid="team-member-email"
                type="email"
                name="user_email"
                required
                className="input-field"
                placeholder="teammate@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <input
                data-testid="team-member-role"
                type="text"
                name="role"
                required
                className="input-field"
                placeholder="Video Editor, Designer, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Profit Split (%)</label>
              <input
                data-testid="team-member-split"
                type="number"
                name="profit_split_percentage"
                required
                min="0.1"
                max="100"
                step="0.1"
                className="input-field"
                placeholder="15"
              />
            </div>
            <Button data-testid="add-team-submit-btn" type="submit" disabled={actionLoading} className="btn-primary w-full">
              {actionLoading ? 'Adding...' : 'Add Team Member'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Distribute Profit Modal */}
      <Dialog open={showProfitModal} onOpenChange={setShowProfitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text">Distribute Profits</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDistributeProfit} className="space-y-4" data-testid="distribute-profit-form">
            <div>
              <label className="block text-sm font-medium mb-2">Total Profit to Distribute (₹)</label>
              <input
                data-testid="profit-amount"
                type="number"
                name="total_profit"
                required
                min="1"
                step="0.01"
                className="input-field"
                placeholder="10000"
              />
              <p className="text-sm text-gray-500 mt-2">
                Profits will be automatically distributed to team members based on their splits and to investors based
                on their equity.
              </p>
            </div>
            <Button data-testid="distribute-profit-submit-btn" type="submit" disabled={actionLoading} className="btn-primary w-full">
              {actionLoading ? 'Distributing...' : 'Distribute Profits'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChannelDetail;