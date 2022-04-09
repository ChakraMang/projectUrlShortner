const urlModel = require('../models/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid')
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  10211,
  "redis-10211.c212.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("z2FRFH7qrVtoooORJ2W5QLIQcsL5efzI", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});


//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const createUrl = async function(req,res) {
    try{
        if(Object.keys(req.body).length == 0) return res.status(400).send({status:false,msg:'enter the long url in the body'})

        const baseUrl = 'http://localhost:3000'
        const urlCode = shortid.generate().toLowerCase()
        
        const longUrl = req.body.longUrl;
        if(!validUrl.isWebUri(longUrl.trim())) return res.status(400).send({status:false,msg:"longUrl is not valid"})
        
        /// check if longUrl is already present
        let doc = await GET_ASYNC(`${longUrl}`)
        if(doc){
            doc = JSON.parse(doc)
            return res.status(200).send(doc)
        } else {
            let url = await urlModel.findOne({ longUrl })

            if (url) {  
                await SET_ASYNC(`${longUrl}`, JSON.stringify(url))
                return res.send({ status: true, data: url });
            }
            }

       // if longurl is not present

        const shortUrl = baseUrl + '/' + urlCode

        let data = {
            urlCode : urlCode,
            longUrl : longUrl,
            shortUrl : shortUrl
        }

        let newDoc = await urlModel.create(data)
        let urlDoc = { urlCode : newDoc.urlCode,longUrl:newDoc.longUrl,shortUrl:newDoc.shortUrl}
        await SET_ASYNC(`${longUrl}`, JSON.stringify(newDoc))
        return res.status(201).send({status:true,msg:urlDoc})
    }
    catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
    
}

// localhost:3000/123212
const redirect = async function(req,res){
    try{
        let urlCode = req.params.urlCode
        if(!shortid.isValid(urlCode)) return res.status(400).send({status:false,msg:'urlCode is not valid'})

        let url = await GET_ASYNC(`${urlCode}`)
       
        if(url){
            url = JSON.parse(url)
            return res.redirect(url.longUrl)
            
        } else{
            let url = await urlModel.findOne({urlCode : urlCode})
            if(!url) return res.status(404).send({status:false,msg:"No url is assigned to  this long url"})
            await SET_ASYNC(`${urlCode}`, JSON.stringify(url))
            return res.redirect(url.longUrl)
        }
    }catch(error){
        return res.status(500).send({statsu:false,msg:error.message})
    }
}

module.exports.createUrl = createUrl;
module.exports.redirect = redirect;
