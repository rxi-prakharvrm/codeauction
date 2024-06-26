require("dotenv").config();
const express = require('express')
const { createServer } = require('http')
const app = express()

const server = createServer(app);
const { Server } = require('socket.io')
const io = new Server(server)

io.setMaxListeners(0); // Set maximum listeners to unlimited


const { userData, hostData, questionBank, teamData } = require('./src/mongodb')
const { authenticateUser } = require('./src/logic/authenticateUser')
const { authenticateHost } = require('./src/logic/authenticateHost')
const { validUsername } = require('./src/logic/validUsername')

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static('./public'))

var bidData = { index: null, title: "", teamCode: null, amount: 0 };

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
        // const newList=list.filter(question=>question.owner!=null)
     
        try {
            console.log("2");
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

let teamCode;

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
        //console.log(loginTeamData);
        const list= await questionBank.find({})
        const newList=list.filter(question=>question.owner!=null)
        res.render('home', {userData:userData,points:loginTeamData.points,titleOwner:newList})
    }
    else {
        res.send(authResult.message)
    }
})

// app.get('/home', async (req, res) => {
//     const teamData = {
//         totalPoints: 20,
//         purse: 12,
//         remainingTime: 59,
//         currBidAmount: 6,
//         problemPoints: 4,
//         problemTitle: "Find minimum in rotated sorted array",
//         problemDesc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets  Aldus PageMaker including versions of Lorem Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets  Aldus PageMaker including versions of Lorem Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets  Aldus PageMaker including versions of Lorem Ipsum."
//     }

//     res.render('home', {
//         teamCode,
//         teamData
//     });
// })

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

