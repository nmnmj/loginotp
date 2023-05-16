import otpModel from "../models/otpModel.js";
import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'

class Logincontroller {
    static login = async(req, res)=>{
        const {email, otp} = req.body
        const userRec = await userModel.findOne({ email });
        const currentTime = Date.now();
        try {          


            if(userRec){
                if(userRec.attempt == 5){
                    // console.log("in")
                    const userTime = userRec.time.getTime();
                    const timeDifference = currentTime - userTime;
                    if (timeDifference < 80000) {   //3600000     60000
                        const remainingTime = Math.ceil((80000 - timeDifference) / 1000);
                        res.status(429).send({ "status": "error", "msg": `Please wait ${remainingTime} seconds to Login again. ${userRec.attempt} attempts already done.` });
                    }else{
                        const chk = await otpModel.findOne({email, otp})
                        if(chk){
                            const d = await otpModel.deleteMany({email})
                            await userModel.findOneAndUpdate({ email }, { attempt:0, time: currentTime });
                            // console.log(userRec._id)
                            let token = jwt.sign({userID:userRec._id}, process.env.JWT_SECRET_KEY, {expiresIn:"1d"})

                            res.send({"status":"success", token})
                        }else{
                            const up = await userModel.findOneAndUpdate({ email }, { attempt:0, time: currentTime });
                            res.status(401).send({ "status": "failed", "msg": "try getting new otp","attempt":up.attempt });
                        }
                    }
                }else if(userRec.attempt < 5){
                    const chk = await otpModel.findOne({email, otp})
                    if(chk){
                        const d = await otpModel.deleteMany({email})
                        await userModel.findOneAndUpdate({ email }, { attempt:0, time: currentTime });
                        let token = jwt.sign({userID:userRec._id}, process.env.JWT_SECRET_KEY, {expiresIn:"1d"})

                        res.send({"status":"success", token})

                    }else{
                        const up = await userModel.findOneAndUpdate({ email }, { $inc: { attempt: 1 }, time: currentTime });
                        res.status(401).send({ "status": "failed", "msg": "try getting new otp","attempt":up.attempt });
                    }
                }else{
                    res.status(401).send({ "status": "failed", "msg": "try getting new otp ex" });
                }
            }else{
                res.status(400).send({"status":"failed", "msg":"no user found"})
            }


                
        } catch (error) {
            res.status(401).send({ "status": "failed", "msg": "something went wrong" });
        }
    }
}

export default Logincontroller