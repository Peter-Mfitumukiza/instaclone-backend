require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_CONN)
    .then(()=>console.log("DB connected successfully..."))
    .catch(err=>console.error(err))
    