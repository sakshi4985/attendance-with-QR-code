import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema(
{
name: { type: String, required: true, trim: true },
email: { type: String, required: true, unique: true, lowercase: true },
password: { type: String, required: true, select: false }, // select:false to omit by default
role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
studentId: { type: String, index: true }, // optional for teacher/admin
active: { type: Boolean, default: true }
},
{ timestamps: true }
);


// Hash password before save
userSchema.pre('save', async function (next) {
if (!this.isModified('password')) return next();
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);
next();
});


// Method: compare password
userSchema.methods.matchPassword = async function (candidate) {
return bcrypt.compare(candidate, this.password);
};


export default mongoose.model('User', userSchema);