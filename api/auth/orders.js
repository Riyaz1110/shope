import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL)

  if (req.method === 'GET') {
    const orders = await sql`SELECT * FROM orders`
    return res.status(200).json(orders)
  }

  return res.status(405).end()
}