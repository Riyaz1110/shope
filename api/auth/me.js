import { parse } from "cookie"

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "")
  const userId = cookies.auth

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  return res.status(200).json({ id: userId })
}