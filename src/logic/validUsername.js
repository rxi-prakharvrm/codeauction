const {userData} = require("../mongodb")

async function validUsername(user){
    
    try{

        const findUser = await userData.findOne({username:user.username})
        if(!findUser){
            return {success:true,message:"valid username"}
        }
        else return {success:false,message:"invalid username"}
    }
    catch(error){
        return {success:false,message:"interval server error"}
    }
}   

module.exports={validUsername};