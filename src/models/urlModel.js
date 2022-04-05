const mongoose = require('mongoose')

const URLSchema = new mongoose.Schema({
    urlCode : {
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    longUrl :{
        type :String,
        required:true,
        trim:true
    },
    shortUrl : {
        type:String,
        required : true,
        trim : true,
        unique:true
    }
})

module.exports = mongoose.model('Url',URLSchema)