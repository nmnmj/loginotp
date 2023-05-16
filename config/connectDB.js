import mongoose from "mongoose";

const connectDB = async (DATABASE_URL)=>{
    const db_ooptions={
        dbName:"OTP",
    } 

    try {
        await mongoose.connect(DATABASE_URL, db_ooptions)
        console.log("Connected to db")
        
    } catch (error) {
        console.log(error)
    }
}

export default connectDB