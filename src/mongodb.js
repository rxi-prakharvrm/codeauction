const mongoose= require('mongoose')

// mongoose.connect('mongodb://localhost:27017/CodeAuction')
// mongoose.connect('mongodb+srv://codeauction:hv56wSxzNCK1b8Bl@cluster0.kwir85v.mongodb.net')

const db = process.env.MONGO_URI;

mongoose.connect(db).then(() => {
    mongoose.set('strictQuery', false);
    console.log("Connection successful!")
}).catch((err) => console.log("Error connecting to MongoDB:", err));


const user= new mongoose.Schema({
    teamCode:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    institution:{
        type:String
    },
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
    owner:{
        type:String,
        default:null
    },
    title:{
        type:String
    },
    desc:{
        type:String
    },
    tag:{
        type:String,
        default:""
    }
})

const teamdata=new mongoose.Schema({
    team:{
        type:String
    },
    points:{
        type:Number,
        default:200
    },
    questions:{
        type:[String],
        default:[]
    }
})

const userData=new mongoose.model('userData',user)
const hostData=new mongoose.model('hostData',host)
const questionBank=new mongoose.model('questionBank',questions)
const teamData=new mongoose.model('teamData',teamdata)

module.exports={userData,hostData,questionBank,teamData}
