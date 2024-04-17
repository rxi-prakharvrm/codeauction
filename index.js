const express = require('express')
const {createServer} = require('http')
const app=express()

const server = createServer(app);
const {Server}= require('socket.io')
const io = new Server(server)

io.setMaxListeners(0); // Set maximum listeners to unlimited


const {userData,hostData,questionBank}=require('./src/mongodb')
const {authenticateUser} = require('./src/logic/authenticateUser')
const {authenticateHost} = require('./src/logic/authenticateHost')
const {validUsername} = require('./src/logic/validUsername')

app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(express.static('./public'))

var bidData={username:null,amount:0};

io.on('connection',(socket)=>{
    socket.on('host',async (message)=>{
        bidData.username=null
        bidData.amount=0
        var idx=Number(message)
        var question= await questionBank.findOne({index:idx})
        var statement='wait';
        if(question!=null) statement=question.statement
        console.log(statement);

        socket.broadcast.emit('question',statement);
    })

    socket.on('bid',(username,amount)=>{
        if(Number(amount)>bidData.amount){
            bidData.username=username;
            bidData.amount=amount
            console.log(bidData)
            io.emit('currBidData',bidData.username,bidData.amount);
        }
    })
})



app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/public/login.html')
})

app.get('/admin',(req,res)=>{
    res.render('hostLogin')
})

app.get('/homenew', (req, res) => {
    let teamId = "Abc1023";
    let remainingTime = 59;
    let currBidAmount = 6;
    let problemPoints = 4;
    let problemTitle = "Find minimum in rotated sorted array";
    let problemDesc = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets  Aldus PageMaker including versions of Lorem Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets  Aldus PageMaker including versions of Lorem Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets  Aldus PageMaker including versions of Lorem Ipsum."
    res.render('homenew', {
        teamId,
        remainingTime,
        currBidAmount,
        problemPoints,
        problemTitle,
        problemDesc
    });
})

app.get('/signUp',(req,res)=>{
    res.sendFile(__dirname+'/public/signUp.html')
})
app.post('/signUp', async (req,res)=>{
    const data={
        teamCode:req.body.teamCode,
        username:req.body.username,
        password:req.body.password,
        institution:req.body.institution
    }

    const check = await validUsername(data)
    if(check.success){
        await userData.insertMany([data])
        res.send('<h2>Data Submitted</h2>')
    }
    else{
        res.send(check.message)
    }
    
})

app.post('/login', async (req,res)=>{
    const userData={
        teamCode:req.body.teamCode,
        username:req.body.username,
        password:req.body.password
    }
    const authResult= await authenticateUser(userData);

    if(authResult.success){
        res.render('home',{userData:userData})
    }
    else{
        res.send(authResult.message)
    }
})

app.get('/hostLogin',(req,res)=>{
    res.render('./hostLogin')
})
app.post('/hostLogin',async(req,res)=>{
    const hostData = {
        username : req.body.username,
        password : req.body.password
    }
    const authResult=await authenticateHost(hostData)
    if(authResult.success){
        res.render('hostHome',{userData:hostData})
    }
    else{
        res.send(authResult.message)
    }
    

})




server.listen(3000,()=>{
    
    console.log("app started at port 3000");
})