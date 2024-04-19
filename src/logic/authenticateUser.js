const {userData} = require("../mongodb")

async function authenticateUser(user){
    
    try{
        const findUser = await userData.findOne({username:user.username})
        if(!findUser || user.password!=findUser.password || user.teamCode!=findUser.teamCode){
            return {success:false,message:"invalid creadentials"}
        }
        return {success:true,message:"valid credentials"}
    }
    catch(error){
        return {success:false,message:"interval server error"}
    }
}   

module.exports={authenticateUser};