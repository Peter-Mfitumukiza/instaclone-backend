const mongoose = require('mongoose');

let CommentSchema = new mongoose.Schema(
    {
        post_id:{
            type: String,
            required: "This field is required"
        },
        commenter_id:{
            type: String,
            required: "This field is required"
        },
        comment_text: {
            type: String,
            required: "This field is required"
        },
        date_of_creation:{
            type: Date,
            default: Date.now()
        }
    }
)

module.exports = mongoose.model("Comment", CommentSchema);