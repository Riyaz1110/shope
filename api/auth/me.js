import { neon } from "@neondatabase/serverless";
import { parse } from "cookie";

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const userId = cookies.auth;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    const users = await sql`
      SELECT username FROM users WHERE id = ${userId}
    `;

    if (!users.length) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(200).json({
      username: users[0].username,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}