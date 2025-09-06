import mongoose from 'mongoose';


const sessionSchema = new mongoose.Schema(
{
code: { type: String, required: true, unique: true }, // e.g., UUID; encoded in QR
title: { type: String, required: true }, // e.g., "Math 101 - Lecture 12"
course: { type: String },
validFrom: { type: Date, required: true },
validUntil: { type: Date, required: true },
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // teacher/admin
isActive: { type: Boolean, default: true }
},
{ timestamps: true }
);


export default mongoose.model('Session', sessionSchema);