const { verifyToken } = require("../utils/jwt");

/**
 * protect([...roles]) - verifies the Bearer JWT and, if roles are given,
 * ensures req.user.role is one of them. Attaches { id, role } to req.user.
 */
function protect(allowedRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const decoded = verifyToken(token);
      req.user = { id: decoded.id, role: decoded.role };

      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Not authorized for this resource" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

module.exports = { protect };
