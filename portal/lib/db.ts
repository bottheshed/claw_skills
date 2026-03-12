import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/mesa_portal',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        github_url TEXT,
        notion_url TEXT,
        cloudflare_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Database init failed:', err);
  } finally {
    client.release();
  }
}

export async function getProjects() {
  const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
  return result.rows;
}

export async function getProject(id: string) {
  const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  return result.rows[0];
}

export async function createProject(project: any) {
  const { id, name, description, status, github_url, notion_url, cloudflare_url } = project;
  const result = await pool.query(
    `INSERT INTO projects (id, name, description, status, github_url, notion_url, cloudflare_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, name, description, status || 'active', github_url, notion_url, cloudflare_url]
  );
  return result.rows[0];
}

export async function updateProject(id: string, updates: any) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  Object.entries(updates).forEach(([key, value]) => {
    fields.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  });

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function deleteProject(id: string) {
  const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}
