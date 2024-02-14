const User = require('./models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./config/config');
const {validationResult} = require('express-validator')

const generateAccessToken = (id, email) => {
    const payload = {
        id,
        email
    }
    return jwt.sign(payload, config.secret, {expiresIn: "1h"})
}


class authController {
    async signup(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({error: true, message: "Registration error.", errors: errors});
            }
            const {userFirstName, userLastName, email, password} = req.body;
            const candidate = await User.findOne({email: email});
            if (candidate) {
                return res.status(400).json({error: true, message: "The user with the same name already exists."});
            }
            const hashPassword = bcrypt.hashSync(password, 7);

            const date = new Date();
            const formattedDate = new Intl.DateTimeFormat('en-US', {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric"
            }).format(date);

            const user = new User({
                userFirstName: userFirstName,
                userLastName: userLastName,
                email: email,
                password: hashPassword,
                date: formattedDate,
                status: "active"
            });
            await user.save().then(async (user) => {
                const accessToken = await generateAccessToken(user._id, user.email);
                return res.status(200).json({
                    error: false,
                    message: "The user successfully registered.",
                    userFirstName: userFirstName,
                    userLastName: userLastName,
                    userEmail: email,
                    userId: user._id,
                    accessToken: accessToken
                });
            });
        } catch (e) {
            console.log(e);
            res.status(500).json({error: true, message: "Internal Server Error."});
        }
    }

    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({error: true, message: "Login error.", errors: errors});
            }
            const {email, password} = req.body;
            const user = await User.findOne({email: email})
            if (!email) {
                return res.status(400).json({error: true, message: `User ${email} is not found.`})
            }
            const validPassword = bcrypt.compareSync(password, user.password)
            if (!validPassword) {
                return res.status(400).json({error: true, message: `Incorrect password entered.`})
            }
            const userCurrentStatus = user.status;
            if (userCurrentStatus === "blocked") {
                return res.status(400).json({
                    error: true,
                    message: `You have been blocked. To log in again, contact the site administration.`,
                    status: "blocked"})
            }
            const accessToken = generateAccessToken(user._id);
            return res.status(200).json({
                error: false,
                message: "Login successfully completed.",
                userFirstName: user.userFirstName,
                userLastName: user.userLastName,
                userEmail: email,
                userId: user._id,
                accessToken: accessToken
            });
        } catch (e) {
            console.log(e);
            res.status(500).json({error: true, message: "Internal Server Error."});
        }
    }

    async getUsers(req, res) {
        try {
            const users = await User.find();
            let usersList = [];
            users.forEach((user) => {
                user = {
                    userId: user._id,
                    userFirstName: user.userFirstName,
                    userLastName: user.userLastName,
                    email: user.email,
                    date: user.date,
                    status: user.status
                }
                usersList.push(user);
            })
            res.status(200).json(usersList);
        } catch (e) {
            console.log(e);
            res.status(500).json({error: true, message: "Internal Server Error."});
        }
    }

    async changeUserStatus(req, res) {
        try {
            const {users, status} = req.body;
            if (users && users.length > 0) {
                for (const user of users) {
                    let userForUpdate = await User.findOne({_id: user});
                    if (userForUpdate) {
                        userForUpdate.status = status;
                        await userForUpdate.save();
                    }
                }
                return res.status(200).json({error: false, message: `User status has been successfully changed`});
            } else {
                return res.status(400).json({error: true, message: `Error in received parameters.`})
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({error: true, message: "Internal Server Error."});
        }
    }

    async deleteUser(req, res) {
        try {
            const {users} = req.body;
            if (users && users.length > 0) {
                for (const user of users) {
                    let userForDelete = await User.findOneAndDelete({_id: user});
                }
                return res.json({error: false, message: `Removed successfully`});
            } else {
                return res.status(400).json({error: true, message: `Error in received parameters.`})
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({error: true, message: "Internal Server Error."});
        }
    }

    async logout(req, res) {
        try {
            return res.status(200).json({error: false, message: "Logged Out Successfully"});
        } catch (e) {
            console.log(e);
            res.status(500).json({error: true, message: "Internal Server Error"});
        }
    }
}

module.exports = new authController();