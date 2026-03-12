import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from './auth';
import { getProjects, getProject, createProject, updateProject, deleteProject, initDb } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize DB on first request
    await initDb();

    // Verify token for write operations
    if (req.method !== 'GET') {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token || !(await verifyToken(token))) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    if (req.method === 'GET') {
      if (req.query.id) {
        const project = await getProject(req.query.id as string);
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }
        res.status(200).json(project);
      } else {
        const projects = await getProjects();
        res.status(200).json(projects);
      }
    } else if (req.method === 'POST') {
      const project = await createProject({
        id: req.body.id || `proj-${Date.now()}`,
        name: req.body.name,
        description: req.body.description,
        status: req.body.status || 'active',
        github_url: req.body.github_url,
        notion_url: req.body.notion_url,
        cloudflare_url: req.body.cloudflare_url,
      });
      res.status(201).json(project);
    } else if (req.method === 'PATCH') {
      const { id } = req.query;
      const existingProject = await getProject(id as string);
      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      const updated = await updateProject(id as string, req.body);
      res.status(200).json(updated);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      const deleted = await deleteProject(id as string);
      res.status(200).json(deleted);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err: any) {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
