require('./models/mongod');
const express = require("express");
const cors = require('cors');
const userController = require('./controllers/UserController');
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

app.listen(3000, ()=>console.log("Server running on port 3000"));