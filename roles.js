// Allow only specific roles (e.g. admin, teacher, student)
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient role",
      });
    }
    next();
  };
};
