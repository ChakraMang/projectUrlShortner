const urlModel = require('../models/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid')


const createUrl = async function(req,res) {
    try{
        if(Object.keys(req.body).length == 0) return res.status(400).send({status:false,msg:'enter the long url in the body'})

        
        const baseUrl = 'http:localhost:3000'
        const urlCode = shortid.generate().toLowerCase()
        
        const longUrl = req.body.longUrl;

        if(!longUrl) return res.status(400).send({status:false,msg:'enter the long url in the body'})
        if(longUrl.trim().length == 0) return res.status(400).send({status:false,msg:'enter the long url in the proper format'})
        if(!validUrl.isWebUri(longUrl.trim())) return res.status(400).send({status:false,msg:"longUrl is not valid"})
        
        /// check if longUrl is already present
        let doc = await urlModel.findOne({longUrl : longUrl.trim()})
        if(doc) return res.status(200).send({status:true,data : doc})

       // if longurl is not present

        const shortUrl = baseUrl + '/' + urlCode

        let data = {
            urlCode : urlCode,
            longUrl : longUrl,
            shortUrl : shortUrl
        }

        let urlDoc = await urlModel.create(data)
        return res.status(201).send({status:true,msg:urlDoc})
    }
    catch(error){
        return res.status(500).send({status:false,msg:error.message})
    }
    
}


const redirect = async function(req,res){
    try{
        let urlCode = req.params.urlCode
        if(!shortid.isValid(urlCode)) return res.status(400).send({status:false,msg:'urlCode is not valid'})
        let url = await urlModel.findOne({urlCode : req.params.urlCode})

        if(!url) return res.status(404).send({status:false,msg:'document for this urlCode is not present, please create first'})

        return res.status(302).redirect(url.longUrl)
    }catch(error){
        return res.status(500).send({statsu:false,msg:error.message})
    }
}

module.exports.createUrl = createUrl;
module.exports.redirect = redirect;
