import { neon } from '@neondatabase/serverless'
import { serialize } from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" })
    }

    const sql = neon(process.env.DATABASE_URL)

    const users = await sql`
      SELECT * FROM users WHERE username = ${username}
    `

    if (!users.length) {
      return res.status(401).json({ message: "Invalid username or password" })
    }

    const user = users[0]

    // Plain text comparison (since DB password is not hashed)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid username or password" })
    }

    res.setHeader(
      "Set-Cookie",
      serialize("auth", user.id.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      })
    )

    return res.status(200).json({ message: "Login successful" })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Server error" })
  }
}