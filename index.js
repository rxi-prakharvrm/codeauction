// import required modules
require("dotenv").config();
const express = require('express')
const { createServer } = require('http')

// create express app
const app = express()

// create server
const server = createServer(app);

// create socket.io server
const { Server } = require('socket.io')

// create io server
const io = new Server(server)

// Set maximum listeners to unlimited
io.setMaxListeners(0);

// import required modules
const { userData, hostData, questionBank, teamData } = require('./src/mongodb')
const { authenticateUser } = require('./src/logic/authenticateUser')
const { authenticateHost } = require('./src/logic/authenticateHost')
const { validUsername } = require('./src/logic/validUsername')

// set view engine to ejs
app.set('view engine', 'ejs')

// middleware
app.use(express.urlencoded({ extended: false }))

// static files
app.use(express.static('./public'))

var bidData = { index: null, title: "", teamCode: null, amount: 0 };

// socket.io connection
io.on('connection', (socket) => {
    socket.on('host', async (index) => {
        var idx = Number(index)

        bidData.index = idx
        bidData.teamCode = null
        bidData.amount = 0

        var question = await questionBank.findOne({ index: idx })
        var title = 'Waiting for problem...';
        var tag = null
        var desc = "No problem in bid"

        if (question != null) {
            title = question.title
            tag = question.tag
            desc = question.desc
            bidData.title = title
        }     

        io.emit('question', title, desc, tag);
    })

    socket.on('bid', (teamCode, amount) => {        
        if (Number(amount) > bidData.amount) {
            bidData.teamCode = teamCode;
            bidData.amount = amount
          
            io.emit('currBidData', bidData.teamCode, bidData.amount);
        }
    })

    socket.on("abortCurrBid", () => {
        var title = 'Waiting for problem...';
        var points = null
        var desc = "No problem in bid"

        io.emit("abort", title, desc, points);
    })

    socket.on("timeUp", () => {
        io.emit("timeIsUp");
    })

    socket.on('update-user-data', async () => {
        console.log("1");
        await questionBank.updateOne({ index: bidData.index}, { $set: { owner: bidData.teamCode } })
        const list= await questionBank.find({})
     
        try {
            const team_Data=await teamData.findOne({team:bidData.teamCode})
          
            if (team_Data) {               
                const updated = await teamData.updateOne({ team: bidData.teamCode }, {
                    $set: { points: Number(team_Data.points) - Number(bidData.amount)},
                    $push: { questions: bidData.title }
                })
                console.log("3");
                //getting all team vs points        
                io.emit('updateInfo',bidData.title,bidData.teamCode,bidData.amount)
            }
        }
        catch (err) {
            console.log("server side error")
        }
    })
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/rules.html')
})

app.get('/admin', (req, res) => {
    res.render('hostLogin')
})

app.get('/signUp', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html')
})

app.post('/signUp', async (req, res) => {
    const data = {
        teamCode: req.body.teamCode,
        username: req.body.username,
        password: req.body.password,
        institution: req.body.institution
    }

    const check = await validUsername(data)
    if (check.success) {
        await userData.insertMany([data])
        await teamData.insertMany({team:data.teamCode,})
        res.sendFile(__dirname + '/public/login.html');
    }
    else {
        res.send(check.message)
    }
})

app.get('/login',(req,res)=>{
    res.sendFile(__dirname + '/public/login.html');
})

app.post('/login', async (req, res) => {
    const userData = {
        teamCode: req.body.teamCode,
        username: req.body.username,
        password: req.body.password
    }
    const authResult = await authenticateUser(userData);

    if (authResult.success) {
        const loginTeamData = await teamData.findOne({team:userData.teamCode})
        const list= await questionBank.find({})
        const newList=list.filter(question=>question.owner!=null)
        res.render('home', {userData:userData,points:loginTeamData.points,titleOwner:newList})
    }
    else {
        res.send(authResult.message)
    }
})

app.get('/hostLogin', (req, res) => {
    res.render('./hostLogin')
})

app.post('/hostLogin', async (req, res) => {
    const hostData = {
        username: req.body.username,
        password: req.body.password
    }
    const authResult = await authenticateHost(hostData)
    if (authResult.success) {
        res.render('hostHome', { userData: hostData })
    }
    else {
        res.send(authResult.message)
    }
})

server.listen(3000, () => {
    console.log("app started at port 3000");
})