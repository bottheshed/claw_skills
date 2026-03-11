import { NextApiRequest, NextApiResponse } from 'next';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

export async function generateToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, SECRET);
    return verified.payload;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Stub: Verify password (TODO: use proper auth)
    const { password } = req.body;
    if (password === process.env.PORTAL_PASSWORD || password === 'dev-password') {
      const token = await generateToken('mesa');
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
