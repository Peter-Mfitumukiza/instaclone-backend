const router = require("express").Router();
const Post = require("../models/PostsModel");
const User =  require("../models/UserModel");

router.get("/all", async(req, res)=>{
    const user = await User.findOne({ _id : req.body.user_id });
    const followers = user.followers;
    let myPosts = [];
    for(let follower of followers){
        const posts = await Post.find({user_id: follower});
        myPosts = [...myPosts, ...posts];
    }
    res.json({ state: "success", message: "Posts fetched successfully.", data: myPosts })
}); 

router.get("/all/:user_id", (req, res)=>{
    let user = req.params.user_id;
    Post.find({ user_id: user })
        .then((post)=>{
            if(post.length<=0){
                return res.json({ status: "error", message: " User has no posts yet." });
            }
            res.json({status: "success", message: "post retrieved successfully", data: post});
        }, err =>{
            res.json({ status: "error", message: "something went wrong"});
        })
});

router.get("/:post_id", (req,res)=>{
    Post.findOne({_id: req.params.post_id})
        .then(post =>{
            if(!post){
                return res.json({ status: "error", message: " No such post." });
            }
            res.json({status: "success", message: "post retrieved successfully", data: post});
        }, err => {
            res.json({ status: "error", message: "Something went wrong." });
        })
})

router.post("", async(req,res)=>{
    let newPost = new Post(req.body);
    newPost.save()
        .then((post)=>{
            res.json({ status: "success", messsage: "post added successfully", data: post });
        })
})

router.post("/like", async(req,res)=>{
    let post = await Post.findOne({_id: req.body.post_id});
    post.likes += 1;
    post.liked_by.push(req.body.user_id);
    Post.findOneAndUpdate({ _id: post._id}, post, {new: false})
        .then(updated =>{
            res.json({status: "success", message: "Likes incremented successfully", data: {updated,
            likes: updated.likes}});
        }, err =>{
            res.send({status: "error", messsage: "something went wrong"});
        })
});

router.post("/remove_like", async(req,res)=>{
    let post = await Post.findOne({_id: req.body.post_id});
    post.likes -= 1;
    let i = post.liked_by.indexOf(req.body.user_id);
    post.liked_by.splice(i, 1);
    await Post.findOneAndUpdate({ _id: post._id}, post, {new: false})
        .then(updated =>{
            res.json({status: "success", message: "Likes decremented successfully", data: updated});
        }, err =>{
            res.send({status: "error", messsage: "something went wrong"});
        })
});

module.exports = router;