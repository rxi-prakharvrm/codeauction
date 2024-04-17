const {hostData}=require("../mongodb")
async function authenticateHost(user){
    
    try{

        const findUser = await hostData.findOne({username:user.username})
        if(!findUser || user.password!=findUser.password){
            return {success:false,message:"invalid creadentials"}
        }
        return {success:true,message:"valid credentials"}
    }
    catch(error){
        return {success:fasle,message:"interval server error"}
    }
}   

module.exports={authenticateHost}