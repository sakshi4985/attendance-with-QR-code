import mongoose from 'mongoose';


const attendanceSchema = new mongoose.Schema(
{
student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
scannedAt: { type: Date, default: Date.now },
status: { type: String, enum: ['Present'], default: 'Present' }
},
{ timestamps: true }
);


// Prevent duplicate marking by the same student for the same session
attendanceSchema.index({ student: 1, session: 1 }, { unique: true });


export default mongoose.model('Attendance', attendanceSchema);