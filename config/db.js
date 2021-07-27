const mongoose = require('mongoose');


const connectDB = () => {
    try{
        mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log("connected")
    }
    catch(err){
        console.log("not connected")
    }
}

module.exports = connectDB