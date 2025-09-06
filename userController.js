import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/user.js";

// @desc    List all users (admin only)
// @route   GET /api/users
export const listUsers = asyncHandler(async (req, res) => {
  const { role, q } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (q)
    filter.$or = [
      { name: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
      { studentId: new RegExp(q, "i") },
    ];

  const users = await User.find(filter).limit(200).sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});
