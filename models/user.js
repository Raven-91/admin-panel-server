const {Schema, model} = require("mongoose");

const User = new Schema({
    userId: String,
    userFirstName: {type: String, required: true},
    userLastName: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    date: String,
    status: String,
    accessToken: String,
    refreshToken: String
})

module.exports = model('User', User);