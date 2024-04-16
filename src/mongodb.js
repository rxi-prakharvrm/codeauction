const mongoose= require('mongoose')

mongoose.connect('mongodb://localhost:27017/CodeAuction')
.then(()=>{
    console.log("connected to database sucessfully");
})
.catch(()=>{
    console.log("error connecting to database");
})

const user= new mongoose.Schema({
    teamCode:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    institution:{
        type:String
    }
})
const host = new mongoose.Schema({
    username:{
        type:String,
    },
    password:{
        type:String
    }
})

const questions = new mongoose.Schema({
    index:{
        type:Number,
    },
    statement:{
        type:String
    }
})

const userData=new mongoose.model('userData',user)
const hostData=new mongoose.model('hostData',host)
const questionBank=new mongoose.model('questionBank',questions)

module.exports={userData,hostData,questionBank}