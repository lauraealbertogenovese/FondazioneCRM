const axios = require("axios");

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://auth-service:3002";

const permissionMap = {
  "patients.read": "pages.patients.access",
  "patients.write": "pages.patients.create",
  "patients.update": "pages.patients.edit",
  "patients.delete": "pages.patients.delete",
  "clinical.read": "pages.clinical.access",
  "clinical.write": "pages.clinical.create_records",
  "clinical.update": "pages.clinical.edit_own_records",
  "groups.read": "pages.groups.access",
  "groups.write": "pages.groups.create",
  "groups.update": "pages.groups.edit",
  "groups.delete": "pages.groups.delete",
  "billing.read": "pages.billing.access",
  "billing.write": "pages.billing.create",
  "billing.update": "pages.billing.edit",
  "billing.delete": "pages.billing.delete",
  "users.read": "administration.users.access",
  "users.write": "administration.users.create",
  "users.update": "administration.users.edit",
  "users.delete": "administration.users.delete",
  "roles.read": "administration.roles.access",
  "roles.write": "administration.roles.create",
  "roles.update": "administration.roles.edit",
  "roles.delete": "administration.roles.delete",
};

class AuthMiddleware {
  // Helper: handle errors from axios
  static handleAxiosError(res, error, fallbackMsg = "Service unavailable") {
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data.error || fallbackMsg,
      });
    }
    return res.status(503).json({ error: fallbackMsg });
  }

  // Middleware: verify JWT token via Auth Service
  static async verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log(`[Patient Auth] No authorization header found`);
      return res
        .status(401)
        .json({ error: "Authorization header is required" });
    }
    try {
      console.log(
        `[Patient Auth] Verifying token for ${req.method} ${req.url}`
      );
      const response = await axios.get(`${AUTH_SERVICE_URL}/auth/verify`, {
        headers: { Authorization: authHeader },
        timeout: 5000,
      });
      req.user = response.data.user;
      console.log(
        `[Patient Auth] Token verified for user: ${req.user.username}`
      );
      next();
    } catch (error) {
      console.log(`[Patient Auth] Auth verification failed:`, error.message);
      return AuthMiddleware.handleAxiosError(
        res,
        error,
        "Authentication failed"
      );
    }
  }

  // Middleware: check user permissions (accepts array or string)
  static requirePermission(permission) {
    return async (req, res, next) => {
      const permissions = Array.isArray(permission) ? permission : [permission];
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      try {
        const response = await axios.get(`${AUTH_SERVICE_URL}/auth/profile`, {
          headers: { Authorization: req.headers.authorization },
          timeout: 5000,
        });
        const user = response.data.user;
        if (!AuthMiddleware.hasGranularPermission(user, permissions)) {
          console.log(
            `[Patient Permission] Permission denied for '${permissions.join(
              ", "
            )}' - role: '${user.role_name}'`
          );
          return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
      } catch (error) {
        return AuthMiddleware.handleAxiosError(
          res,
          error,
          "Permission check failed"
        );
      }
    };
  }

  // Helper: check granular object permission
  static checkGranularObjectPermission(userPerms, granular) {
    let current = userPerms;
    for (const key of granular.split(".")) {
      if (current[key] === undefined) {
        return false;
      }
      current = current[key];
    }
    return current === true;
  }

  // Check if user has granular permission (accepts array)
  static hasGranularPermission(user, permissions) {
    try {
      const userPerms = user.role?.permissions;
      if (!userPerms) return false;
      if (typeof userPerms === "object" && userPerms.all === true) return true;
      if (Array.isArray(userPerms) && userPerms.includes("*")) return true;

      for (let perm of permissions) {
        const granular = permissionMap[perm] || perm;
        if (Array.isArray(userPerms) && userPerms.includes(perm)) return true;
        if (
          typeof userPerms === "object" &&
          !Array.isArray(userPerms) &&
          AuthMiddleware.checkGranularObjectPermission(userPerms, granular)
        ) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error in hasGranularPermission:", error);
      return false;
    }
  }

  // Legacy: check if role has permission
  static hasPermission(roleName, permission) {
    const rolePermissions = {
      admin: ["*"],
      doctor: ["patients.read", "patients.write", "patients.delete"],
      conductor: ["patients.read", "patients.write"],
      operator: ["patients.read", "patients.write"],
      viewer: ["patients.read"],
    };
    const permissions = rolePermissions[roleName] || [];
    return permissions.includes("*") || permissions.includes(permission);
  }

  // Middleware: check if user has specific role
  static requireRole(roleName) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (req.user.role_name !== roleName) {
        return res
          .status(403)
          .json({ error: `Role '${roleName}' is required` });
      }
      next();
    };
  }

  // Middleware: check if user is admin
  static requireAdmin(req, res, next) {
    return AuthMiddleware.requireRole("admin")(req, res, next);
  }

  // Middleware: check if user is doctor
  static requireDoctor(req, res, next) {
    return AuthMiddleware.requireRole("doctor")(req, res, next);
  }

  // Optional authentication middleware (doesn't fail if no token)
  static optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();
    AuthMiddleware.verifyToken(req, res, (err) => {
      if (err) req.user = null;
      next();
    });
  }
}

module.exports = AuthMiddleware;
