const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// 使用定义好的schema
const User = require('../../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/',
    // 检查输入的格式是否正确
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
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exits' }] });
            }

            // 获取大头像
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            // 把post request里的json data, 弄到user里
            user = new User({
                name,
                email,
                avatar,
                password
            });

            // 加密, 把密码给hash了
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            // 用户存入数据库
            await user.save();

            // 从payload获取userid
            const payload = {
                user: {
                    id: user.id
                }
            }
            // 返回 jsonwebton 
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                });

        }
        catch (err) {
            console.log(err.message);
            res.status(500).send('Server');
        }


    });
module.exports = router;
