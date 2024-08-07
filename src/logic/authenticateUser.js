const {userData} = require("../mongodb")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()
async function authenticateUser(user,req,res){
    
    try{
        const findUser = await userData.findOne({username:user.username})
        if(!findUser) return {success:false, message:"not a user"}

        const isMatch = await bcrypt.compare(user.password, findUser.password)

        if(!isMatch || user.teamCode!=findUser.teamCode){
            return {success:false,message:"invalid creadentials"}
        }

        const token = jwt.sign({username : user.username, teamCode : user.teamCode},process.env.SECRET_KEY)
        res.cookie('token', token,{httpOnly: true, secure : true, sameSite:'none'})

        return {success:true,message:"valid credentials"}
    }
    catch(error){
        return {success:false,message:"interval server error"}
    }
}   

module.exports={authenticateUser};