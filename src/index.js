const express = require('express')
const {createServer} = require('http')
const app=express()

const server = createServer(app);
const {Server}= require('socket.io')
const io = new Server(server)

io.setMaxListeners(0); // Set maximum listeners to unlimited


const {userData,hostData,questionBank}=require('./mongodb')

var tempUsers=[{name:'vikrant',roll:21},{name:'rahul',roll:22}];
app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(express.static('./public'))


app.get('/',(req,res)=>{
    res.render('login')
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
    res.render('signUp')
})
app.post('/signUp', async (req,res)=>{
    const data={
        teamCode:req.body.teamCode,
        name:req.body.username,
        password:req.body.password,
        institution:req.body.institution
    }

    try{
        const check= await userData.findOne({name:data.name});
        if(check){
            res.send("username taken")
        }
        else{

            await userData.insertMany([data])
            res.send("submitted")
        }
    }
    catch{
        res.send("wrong details")
    }
    
})

app.post('/login', async (req,res)=>{
    const data={
        name:req.body.username,
        password:req.body.password
    }
    try{
        const check=await userData.findOne({name:data.name})
        if(check.password===data.password){
            const usersData=await userData.find()
            io.on('connection',(socket)=>{
                socket.join(`${check.teamCode}`)
            })
            res.render('home',{team:`${check.teamCode}`,users:usersData})
        }
        else{
            res.send("wrong password")
        }
    }
    catch{
        res.send("wrong details")
    }
})

app.get('/hostLogin',(req,res)=>{
    res.render('./hostLogin')
})
app.post('/hostLogin',async(req,res)=>{
    const data = {
        name : req.body.username,
        password : req.body.password
    }
    console.log(data.name,data.password);
    try{
        const check=await hostData.findOne({username:data.name})
        console.log(check)
        if(check.password===data.password){
            io.on('connection',(socket)=>{
                socket.join(`host`)
            })
            res.render('hostHome')
        }
        else{
            res.send("wrong password")
        }
    }
    catch{
        res.send("wrong details")
    }

})


io.on('connection',(socket)=>{
    socket.on('host',async (message)=>{
        var idx=Number(message)
        var question= await questionBank.findOne({index:idx})
        var statement='wait';
        if(question!=null) statement=question.statement
        console.log(statement);
        socket.broadcast.emit('question',statement);
    })
})

server.listen(3000,()=>{
    console.log("app started at port 3000");
})



