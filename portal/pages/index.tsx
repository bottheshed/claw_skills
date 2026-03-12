import { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  github_url?: string;
  notion_url?: string;
  cloudflare_url?: string;
  created_at: string;
  updated_at: string;
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

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">🤖 Mesa Portal</h1>
            <p className="text-gray-400 mt-2">Project dashboard & control center</p>
          </div>
          {token && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold transition"
            >
              Logout
            </button>
          )}
        </div>

        {!token ? (
          <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Authenticate</h2>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded mb-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold transition disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                <p>No projects yet. Create one via API.</p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-2xl font-bold">{project.name}</h2>
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        project.status === 'active'
                          ? 'bg-green-900 text-green-200'
                          : 'bg-yellow-900 text-yellow-200'
                      }`}
                    >
                      {project.status.toUpperCase()}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-gray-400 mb-4 text-sm">{project.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-400 hover:text-blue-300 text-sm truncate"
                      >
                        → GitHub
                      </a>
                    )}
                    {project.notion_url && (
                      <a
                        href={project.notion_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-400 hover:text-blue-300 text-sm truncate"
                      >
                        → Notion
                      </a>
                    )}
                    {project.cloudflare_url && (
                      <a
                        href={project.cloudflare_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-400 hover:text-blue-300 text-sm truncate"
                      >
                        → Cloudflare
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
