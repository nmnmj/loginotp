import express from 'express'
import Logincontroller from '../controller/Logincontroller.js'

const router = express.Router()



router.get("/",(req, res)=>{
    res.send("work")
})

router.post("/login", Logincontroller.login)


export default router