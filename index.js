require('./models/mongod');
const express = require("express");
const cors = require('cors');
const userController = require('./controllers/UserController');
const postsController = require('./controllers/PostsController');
const commentsController = require('./controllers/CommentsController');
const auth = require('./controllers/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/test", (req,res)=>{
    return res.json({ status: "success", message: "we are ready to move Peter!!" });
});
app.use("/user", userController);
app.use("/auth", auth);
app.use("/posts", postsController);
app.use("/comment", commentsController);

const port = process.env.PORT || 3000;

app.listen(port, ()=>console.log(`Server running on port ${port}`));