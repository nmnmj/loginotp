import otpModel from "../models/otpModel.js";
import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';

class LoginController {
  static login = async (req, res) => {
    const { email, otp } = req.body;
    const userRec = await userModel.findOne({ email });
    const currentTime = Date.now();
    
    let d = null;
    var otpRec = await otpModel.findOne({email})
    if(otpRec){
        var otpOtime = otpRec.otime.getTime()
        var timeDifference = currentTime - otpOtime

    }

    if(timeDifference > 300000){
        d = await otpModel.deleteOne({ email });
        console.log("d", d);
    }

    
    if(d){
        //deleted otp
        res.status(401).send({"status":"failed","msg":"OTP expired"})
    }else{
        try {
          if (userRec) {
            if (userRec.attempt === 5) {
              const block = await userModel.findOneAndUpdate({ email }, { blocked: true });
              const userTime = userRec.time.getTime();
              const timeDifference = currentTime - userTime;
    
              if (timeDifference < 3600000) { // 3600000 milliseconds = 1 hour
                const remainingTime = Math.ceil((3600000 - timeDifference) / 1000);
                return res.status(429).send({ "status": "error", "msg": `Please wait ${remainingTime} seconds to Login again. ${userRec.attempt} attempts already done.` });
              } else {
                await userModel.findOneAndUpdate({ email }, { attempt: 0, time: currentTime, blocked: false });
              }
            }
    
            const chk = await otpModel.findOne({ email, otp });
            if (chk) {
              await otpModel.deleteMany({ email });
              await userModel.findOneAndUpdate({ email }, { attempt: 0, time: currentTime });
              let token = jwt.sign({ userID: userRec._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
              return res.send({ "status": "success", token });
            } else {
              const up = await userModel.findOneAndUpdate({ email }, { $inc: { attempt: 1 }, time: currentTime });
              const remainingAttempts = 5 - up.attempt;
    
              if (up.attempt === 5) {
                await userModel.findOneAndUpdate({ email }, { time: currentTime });
                return res.status(401).send({ "status": "failed", "msg": "Your account is temporarily blocked. Please try again after 1 hour." });
              } else {
                return res.status(401).send({ "status": "failed", "msg": `Invalid OTP. You have ${remainingAttempts-1} attempts left.`, "attempt": up.attempt+1 });
              }
            }
          } else {
            return res.status(400).send({ "status": "failed", "msg": "No user found with the provided email." });
          }
        } catch (error) {
          return res.status(500).send({ "status": "error", "msg": "Something went wrong." });
        }

    }

  }
}

export default LoginController;
