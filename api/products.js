import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL)
  const products = await sql`SELECT * FROM products`
  res.status(200).json(products)
}