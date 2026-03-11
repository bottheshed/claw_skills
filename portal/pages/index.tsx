import { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  links: Record<string, string>;
  createdAt: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth', { password });
      setToken(res.data.token);
      setPassword('');
    } catch (err) {
      alert('Invalid password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🤖 Mesa Portal</h1>

        {!token ? (
          <form onSubmit={handleLogin} className="mb-8 bg-gray-800 p-6 rounded">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded mb-4 text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setToken(null)}
            className="mb-8 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Logout
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
              <p className="text-gray-400 mb-4">{project.description}</p>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded text-sm ${
                  project.status === 'active' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(project.links).map(([key, url]) => (
                  <a
                    key={key}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-400 hover:text-blue-300 underline text-sm"
                  >
                    → {key}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
