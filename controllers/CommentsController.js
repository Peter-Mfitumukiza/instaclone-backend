const router = require('express').Router();
const Comment = require('../models/CommentModel');
const User = require('../models/UserModel');

router.get("/:post_id", async(req,res)=>{
    let comments = await Comment.find({post_id : req.params.post_id});
    if(comments.length<=0){
        return res.json({status: "error", message: "no comments yet."});
    }
    let commenters = [];
    for(let comment of comments){
        let user = await User.findOne({_id : comment.commenter_id});
        commenters = [ ...commenters, user];
    }
    return res.json({status: "success", message: "comments fetched successfully", data: { comments, commenters }});

})

router.post("/", async(req,res)=>{
    let newComment = new Comment(req.body);
    await newComment.save()
                .then( saved =>{
                    res.json({ status: "success", message: "comment added successfully", data: saved });
                }, err =>{
                    res.json({status: "error", message: "something went wrong adding comment"});
                })
});


module.exports = router;