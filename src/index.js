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



