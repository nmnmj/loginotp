import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

let userAuth = async (req, res, next)=>{
    let token
    let { authorization} = req.headers
    if(authorization && authorization.startsWith('Bearer'))
    {
        try {
            token = authorization.split(" ")[1]
            //verify token
            const {userID} = jwt.verify(token, process.env.JWT_SECRET_KEY)
            //get user from user
            req.user = await userModel.findById(userID).select('-password')
            next()
        } catch (error) {
            res.status(401).send({"status":"unauthorized user"})
        }
    }
    if(!token){
        res.status(401).send({"status":"no token"})
    }
}

export default userAuth