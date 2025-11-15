import jwt from "jsonwebtoken";

const JWT_PASSWORD = process.env.JWT_PASSWORD || "";

export function customerOnly(req: any, res: any, next: any) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const token = header.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_PASSWORD || "");

    // if (decoded.role !== "customer") {
    //   return res.status(403).json({ message: "Customers only" });
    // }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}
