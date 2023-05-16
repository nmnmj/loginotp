import otpModel from "../models/otpModel.js";
import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';

class LoginController {
  static login = async (req, res) => {
    const { email, otp } = req.body;
    const userRec = await userModel.findOne({ email });
    const currentTime = Date.now();

    try {
      if (userRec) {
        if (userRec.attempt === 5) {
          const userTime = userRec.time.getTime();
          const timeDifference = currentTime - userTime;

          if (timeDifference < 3600000) { // 3600000 milliseconds = 1 hour
            const remainingTime = Math.ceil((3600000 - timeDifference) / 1000);
            return res.status(429).send({ "status": "error", "msg": `Please wait ${remainingTime} seconds to Login again. ${userRec.attempt} attempts already done.` });
          } else {
            const chk = await otpModel.findOne({ email, otp });
            if (chk) {
              await otpModel.deleteMany({ email });
              await userModel.findOneAndUpdate({ email }, { attempt: 0, time: currentTime });
              let token = jwt.sign({ userID: userRec._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
              return res.send({ "status": "success", token });
            } else {
              await userModel.findOneAndUpdate({ email }, { attempt: 0, time: currentTime });
              return res.status(401).send({ "status": "failed", "msg": "Invalid OTP. Please try again." });
            }
          }
        } else if (userRec.attempt < 5) {
          const chk = await otpModel.findOne({ email, otp });
          if (chk) {
            await otpModel.deleteMany({ email });
            await userModel.findOneAndUpdate({ email }, { attempt: 0, time: currentTime });
            let token = jwt.sign({ userID: userRec._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
            return res.send({ "status": "success", token });
          } else {
            const up = await userModel.findOneAndUpdate({ email }, { $inc: { attempt: 1 }, time: currentTime });
            const remainingAttempts = 5 - up.attempt;
            return res.status(401).send({ "status": "failed", "msg": `Invalid OTP. You have ${remainingAttempts} attempts left.`, "attempt": up.attempt });
          }
        } else {
          return res.status(401).send({ "status": "failed", "msg": "Your account is temporarily blocked. Please try again after 1 hour." });
        }
      } else {
        return res.status(400).send({ "status": "failed", "msg": "No user found with the provided email." });
      }
    } catch (error) {
      return res.status(500).send({ "status": "error", "msg": "Something went wrong." });
    }
  }
}

export default LoginController;
