const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: "This field is required"
    },
    email: {
        type: String,
        required: "This field is required"
    },
    username: {
        type: String,
        required: "This field is required"
    },
    password: {
        type: String,
        required: "This field is required"
    },
    profile_url: {
        type: String,
    },
    followers:{
        type: [
            {
                type: String
            }
        ]
    },
    following:{
        type: [
            {
                type: String
            }
        ]
    },
    status: {
        type: String
    },
    reset_id: {
        type: String,
        default: null
    },
    code: {
        type: Number,
        default: null
    },
    date_of_creation:{
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('User', userSchema);