const mongoose= require('mongoose')

const db = "mongodb+srv://codeauction:hv56wSxzNCK1b8Bl@cluster0.kwir85v.mongodb.net/codeauction"

mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    mongoose.set('strictQuery', false);
    console.log("Connection successful!")
}).catch((err) => console.log("No Connection!"))

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
    statement:{
        type:String
    },
    desc:{
        type:String
    },
    points:{
        type:Number
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