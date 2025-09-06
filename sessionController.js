import { validationResult } from "express-validator";
import Session from "../models/Session.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

// @desc    Create a new session
// @route   POST /api/sessions
export const createSession = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { title, course, validFrom, validUntil } = req.body;

  if (new Date(validFrom) >= new Date(validUntil)) {
    return res.status(400).json({
      success: false,
      message: "validUntil must be after validFrom",
    });
  }

  const code = uuidv4(); // unique code for QR

  const session = await Session.create({
    code,
    title,
    course,
    validFrom,
    validUntil,
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, data: session });
});

// @desc    Get QR code for session
// @route   GET /api/sessions/:id/qr
export const getSessionQR = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session)
    return res.status(404).json({ success: false, message: "Session not found" });

  if (session.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }

  const payload = { sessionCode: session.code };
  const dataURL = await QRCode.toDataURL(JSON.stringify(payload));

  res.json({
    success: true,
    data: { sessionId: session._id, code: session.code, qrDataURL: dataURL },
  });
});

// @desc    Close session
// @route   PATCH /api/sessions/:id/close
export const closeSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session)
    return res.status(404).json({ success: false, message: "Session not found" });

  if (session.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not allowed" });
  }

  session.isActive = false;
  await session.save();
  res.json({ success: true, data: session });
});

// @desc    List sessions
// @route   GET /api/sessions
export const listSessions = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id };
  const sessions = await Session.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: sessions });
});
