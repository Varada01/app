import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <nav className="navbar px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button data-testid="back-btn" variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Back
          </Button>
          <span className="text-2xl font-bold gradient-text">Create Channel</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold gradient-text mb-6">Launch Your Channel</h1>
          <p className="text-gray-600 mb-8">
            Create a channel, invite collaborators, and get funded by your fans. Let's build something amazing together!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="create-channel-form">
            <div>
              <label className="block text-sm font-medium mb-2">Channel Name *</label>
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
              <label className="block text-sm font-medium mb-2">Description *</label>
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
                <label className="block text-sm font-medium mb-2">Category *</label>
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
                <label className="block text-sm font-medium mb-2">Funding Goal (₹) *</label>
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
              <label className="block text-sm font-medium mb-2">Total Equity for Investors (%) *</label>
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
              <p className="text-sm text-gray-500 mt-1">
                This is the total equity percentage you're offering to all investors combined.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cover Image URL (optional)</label>
              <input
                data-testid="channel-cover"
                type="url"
                name="cover_image"
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                data-testid="create-channel-submit"
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Creating...' : 'Create Channel'}
              </Button>
              <Button
                data-testid="cancel-btn"
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
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