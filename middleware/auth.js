const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = function(req,res,next){

    // 从header获得token
    const token = req.header('x-auth-token');

    // check if no token
    if(!token){
        // not authorize
        return res.status(401).json({msg: 'No token'});
    }

    // 有token的话，Verify
    try{
        const decoded = jwt.verify(token,config.get('jwtSecret'));

        req.user = decoded.user;

    } catch(err){
       res.status(401).json({msg:'Token is not valid'}); 
    }
} 
