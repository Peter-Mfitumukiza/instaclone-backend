const mongoose = require('mongoose');

let PostSchema = new mongoose.Schema(
    {
        user_id: {
            type: String,
            required: "This field is required."
        },
        image_url: {
            type: String,
            required: "This field is required."
        },
        post_text: {
            type: String,
        },
        likes: {
            type: Number
        },
        liked_by: {
            type: [
                {
                    type: String,
                }
            ]
        },
        date_of_creation:{
            type: Date,
            default: Date.now()
        }
    }
);



module.exports = new mongoose.model("Post", PostSchema);