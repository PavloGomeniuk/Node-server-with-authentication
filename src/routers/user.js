
const bodyParser =require( 'body-parser')

const express = require('express')
const User = require('../models/User')
const PostModel = require('../models/Post')
const auth = require('../middleware/auth')

const router = express.Router()

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.post('/users', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

})

router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})


router.post('/posts', auth, (req,res)=> {
    const data = req.body;
    const post = new PostModel({
    title: data.title,
    text: data.text,
    backgroundURL: data.backgroundURL
    });

    post.save().then(()=>{
    res.send({status:'ok'});
    });
});

router.get('/posts', auth, (req,res)=>{
    PostModel.find().then((err,posts)=>{
        if (err) {
            res.send({status:'LogIn please'});
        }
        res.json(posts);
    });
});

router.get('/posts/:id', auth, (req,res)=>{
    PostModel.findOne({ _id: req.params.id }).then((err,posts)=>{
        if (err) {
            res.send(err);
        }
        res.json(posts);
    });
});

router.delete('/posts/:id', auth, (req,res)=>{
    PostModel.remove({
        _id: req.params.id
    }).then(post=>{
        if(post) {
            res.json({status:'deleted'});
        }
        else{
            res.json({status:'error'});
        }
    });
});

router.put('/posts/:id', auth, (req,res)=>{
    PostModel.findByIdAndUpdate(req.params.id, {$set: req.body}, err=>{
        if(err) {
            res.send(err);
        }
        res.json({status:'updated'});
    });
});


module.exports = router