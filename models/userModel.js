import mongoose from "mongoose";

const userSchema =  mongoose.Schema({
    attempt: {type: Number, trim: true, default:0},
    email: {type: String, trim: true, required: true, unique:true},
    time: { type: Date, default: Date.now }

})

const userModel = mongoose.model("user", userSchema)

export default userModel