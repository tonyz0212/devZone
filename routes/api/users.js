const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');


// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 ore more characters').isLength({ min: 6 })
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            // 检查用户是否在
            let user = await User.findOne({email});

            if(user){
              return res.status(400).json({errors: [{msg:'User already exits'}]});    
            }

            // 获取大头像
            const avatar  = gravatar.url(email,{
                s: '200',
                r:'pg',
                d:'mm'    
            });

            // 把post request里的json data, 弄到user里
            user = new User({
                name,
                email,
                avatar,
                password
            });

            // 加密
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            // 返回 jsonwebton
            res.send('User route'); 
        }
        catch (err) {
            console.log(err.message);
            res.status(500).send('Server');
        }


    });
module.exports = router;
