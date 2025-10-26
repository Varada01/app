import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { ArrowLeft, TrendingUp } from 'lucide-react';

function MyInvestments({ user }) {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      const res = await authAxios.get('/investments/my');
      setInvestments(res.data);
    } catch (error) {
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEquity = investments.reduce((sum, inv) => sum + inv.equity_percentage, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <nav className="navbar px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button data-testid="back-btn" variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Dashboard
          </Button>
          <span className="text-2xl font-bold gradient-text">My Investments</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="stat-card">
            <p className="text-sm text-gray-600 mb-2">Total Invested</p>
            <p data-testid="total-invested" className="text-3xl font-bold gradient-text">₹{totalInvested.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-gray-600 mb-2">Active Investments</p>
            <p className="text-3xl font-bold">{investments.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-gray-600 mb-2">Total Equity Held</p>
            <p className="text-3xl font-bold text-purple-600">{totalEquity.toFixed(2)}%</p>
          </div>
        </div>

        {/* Investments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : investments.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <TrendingUp className="mx-auto mb-4 text-gray-400" size={64} />
            <h2 className="text-2xl font-bold gradient-text mb-4">No Investments Yet</h2>
            <p className="text-gray-600 mb-6">Start investing in amazing creators and earn profit-sharing returns!</p>
            <Button
              data-testid="explore-channels-btn"
              onClick={() => navigate('/dashboard')}
              className="btn-primary mx-auto"
            >
              Explore Channels
            </Button>
          </div>
        ) : (
          <div data-testid="investments-list" className="space-y-6">
            {investments.map((investment) => (
              <div
                key={investment.id}
                data-testid={`investment-card-${investment.id}`}
                className="bg-white rounded-2xl p-6 shadow-lg hover-lift cursor-pointer"
                onClick={() => navigate(`/channel/${investment.channel_id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold gradient-text mb-2">{investment.channel_name}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Invested on {new Date(investment.investment_date).toLocaleDateString()}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Investment Amount</p>
                        <p className="text-2xl font-bold text-green-600">₹{investment.amount.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Equity Percentage</p>
                        <p className="text-2xl font-bold text-purple-600">{investment.equity_percentage.toFixed(2)}%</p>
                      </div>
                    </div>
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

export default MyInvestments;