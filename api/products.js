import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL)
  const products = await sql`SELECT * FROM products`

  const formatted = products.map(p => ({
    ...p,
    imageUrl: p.image_url
  }))

  res.status(200).json(formatted)
}