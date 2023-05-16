import mongoose from "mongoose";

const otpSchema =  mongoose.Schema({
    otp: {type: Number, trim: true, required: true},
    email: {type: String, trim: true, required: true},
    time: { type: Date, default: Date.now }
})

const otpModel = mongoose.model("otp", otpSchema)

export default otpModel