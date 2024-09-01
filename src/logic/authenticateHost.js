const {hostData}=require("../mongodb")
async function authenticateHost(user){
    
    try{
        const findUser = await hostData.findOne({username:user.username})
        if(!findUser || user.password!=findUser.password){
            return {success:true,message:"valid credentials"}
        }
        return {success:false,message:"invalid creadentials"}
    }
    catch(error){
        return {success:fasle,message:"interval server error"}
    }
}   

module.exports={authenticateHost}