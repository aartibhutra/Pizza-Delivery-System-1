import jwt from "jsonwebtoken";

const JWT_PASSWORD = process.env.JWT_PASSWORD || "";

export function adminOnly(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded: any = jwt.verify(token, process.env.JWT_PASSWORD || "");

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Admins only" });
    }

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
