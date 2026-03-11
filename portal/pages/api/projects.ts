import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from './auth';

// Stub: In-memory storage (TODO: Replace with PostgreSQL)
let projects: any[] = [
  {
    id: 'domain-finder',
    name: 'domain-finder',
    description: 'Find available startup domains',
    status: 'active',
    links: {
      github: 'https://github.com/bottheshed/claw_skills',
      notion: 'https://www.notion.so/ClawBot-Space',
    },
    createdAt: new Date().toISOString(),
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify token for write operations
  if (req.method !== 'GET') {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || !(await verifyToken(token))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (req.method === 'GET') {
    res.status(200).json(projects);
  } else if (req.method === 'POST') {
    const project = {
      id: req.body.id || Date.now().toString(),
      name: req.body.name,
      description: req.body.description,
      status: req.body.status || 'active',
      links: req.body.links || {},
      createdAt: new Date().toISOString(),
    };
    projects.push(project);
    res.status(201).json(project);
  } else if (req.method === 'PATCH') {
    const { id } = req.query;
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    projects[index] = { ...projects[index], ...req.body };
    res.status(200).json(projects[index]);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
