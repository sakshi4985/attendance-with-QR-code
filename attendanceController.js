import { validationResult } from "express-validator";
import Session from "../models/Session.js";
import Attendance from "../models/Attendance.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// @desc    Mark attendance using sessionCode
// @route   POST /api/attendance/mark
export const markAttendance = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { sessionCode } = req.body;
  const now = new Date();

  const session = await Session.findOne({ code: sessionCode });
  if (!session)
    return res.status(404).json({ success: false, message: "Invalid session code" });

  if (!session.isActive || now < session.validFrom || now > session.validUntil) {
    return res.status(400).json({
      success: false,
      message: "Session is closed or outside valid window",
    });
  }

  const att = await Attendance.create({
    student: req.user.id,
    session: session._id,
  });

  res.status(201).json({ success: true, data: att });
});

// @desc    Get attendance report
// @route   GET /api/attendance/report?sessionId=...
export const attendanceReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { sessionId } = req.query;
  const session = await Session.findById(sessionId);
  if (!session)
    return res.status(404).json({ success: false, message: "Session not found" });

  if (session.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }

  const list = await Attendance.find({ session: sessionId })
    .populate("student", "name email studentId")
    .sort({ createdAt: 1 });

  res.json({ success: true, data: { session, records: list } });
});
