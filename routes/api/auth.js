const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config = require('config');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');
// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        // 从 req.user 获取user的信息，但是不显示password
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST api/auth
// @desc    Autheticaet user and get token
// @access  Public
router.post('/',
    // 检查输入的格式是否正确
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
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

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'User does not exits OR Password is wrong' }] });
            }


            const matched = await bcrypt.compare(password, user.password);

            // do not specify whether it is username or password issue.
            if (!matched) {
                return res.status(400).json({ errors: [{ msg: 'User does not exits OR Password is wrong' }] });
            }


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

