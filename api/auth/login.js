import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcrypt'
import { serialize } from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { username, password } = req.body
  const sql = neon(process.env.DATABASE_URL)

  const users = await sql`
    SELECT * FROM users WHERE username = ${username}
  `

  if (!users.length) {
    return res.status(401).json({ message: "Invalid username or password" })
  }

  const user = users[0]
  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    return res.status(401).json({ message: "Invalid username or password" })
  }

  res.setHeader(
    "Set-Cookie",
    serialize("auth", user.id, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    })
  )

  res.status(200).json({ message: "Login successful" })
}