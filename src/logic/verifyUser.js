const jwt = require('jsonwebtoken');

const verifyUser = (req,res,next)=>{
    const token = req.cookies.token
    
    if(!token){
        return res.redirect('/login')
    }

    try{
        const decoded = jwt.verify(token,process.env.SECRET_KEY)
        req.user = decoded;
    }catch(error){
        return res.redirect('/login')
    }
    

    next()
}

module.exports = verifyUser