import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { ArrowLeft, Zap, Sparkles, Rocket } from 'lucide-react';

function CreateChannel({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    try {
      const res = await authAxios.post('/channels', {
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        goal_amount: parseFloat(formData.get('goal_amount')),
        equity_percentage: parseFloat(formData.get('equity_percentage')),
        cover_image: formData.get('cover_image') || null,
      });

      toast.success('Channel created successfully!');
      navigate(`/channel/${res.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg">
      <nav className="navbar px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button data-testid="back-btn" variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-300 hover:text-white">
            <ArrowLeft size={18} />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold gradient-text glow-text">Create Channel</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="glass-effect rounded-3xl p-10 border border-purple-500/20 shadow-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
              <Sparkles size={18} className="text-purple-400" />
              <span className="text-sm font-semibold text-gray-300">Launch Your Channel</span>
            </div>
            <h1 className="text-4xl font-bold gradient-text glow-text mb-3">Build Something Amazing</h1>
            <p className="text-gray-300 text-lg">
              Create a channel, invite collaborators, and get funded by your fans. Let's build together!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="create-channel-form">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">Channel Name *</label>
              <input
                data-testid="channel-name"
                type="text"
                name="name"
                required
                className="input-field"
                placeholder="Tech Reviews with John"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">Description *</label>
              <textarea
                data-testid="channel-description"
                name="description"
                required
                rows="4"
                className="input-field"
                placeholder="Tell your audience what your channel is about..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">Category *</label>
                <select data-testid="channel-category" name="category" required className="input-field">
                  <option value="">Select category</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Podcast">Podcast</option>
                  <option value="Music">Music</option>
                  <option value="Art">Art</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Education">Education</option>
                  <option value="Technology">Technology</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">Funding Goal (₹) *</label>
                <input
                  data-testid="channel-goal"
                  type="number"
                  name="goal_amount"
                  required
                  min="1000"
                  step="100"
                  className="input-field"
                  placeholder="50000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">Total Equity for Investors (%) *</label>
              <input
                data-testid="channel-equity"
                type="number"
                name="equity_percentage"
                required
                min="1"
                max="100"
                step="0.1"
                className="input-field"
                placeholder="20"
              />
              <p className="text-sm text-gray-400 mt-2">
                This is the total equity percentage you're offering to all investors combined.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">Cover Image URL (optional)</label>
              <input
                data-testid="channel-cover"
                type="url"
                name="cover_image"
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                data-testid="create-channel-submit"
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 py-4 text-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Rocket size={20} />
                    Create Channel
                  </span>
                )}
              </Button>
              <Button
                data-testid="cancel-btn"
                type="button"
                onClick={() => navigate('/dashboard')}
                className="glass-effect text-white flex-1 py-4 text-lg rounded-full font-semibold hover:bg-white/10 transition-all"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateChannel;