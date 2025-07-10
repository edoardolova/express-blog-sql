// const postsData = require("../data/postsData.js");
const mydb = require("../db/db.js")

function index(req, res){
    let myRes = postsData;
    const {tag} = req.query;
    if (tag) {
        myRes = postsData.filter(post => post.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }
    res.json(myRes);
};

function show(req, res){
    const id = req.params.id;
    //simulate internal error 500 posts not defined
    // const post = posts.find(post => post.id === Number(id));
    const post = postsData.find(post => post.id === Number(id));
    if(!post){
        return res.status(404).json({err: "post not found"});
    }
    return res.json(post);
};

function store(req, res){
    const newId = postsData[postsData.length - 1].id + 1;
    const newPost = {
        id: newId,
        title: req.body.title,
        content: req.body.content,
        image: req.body.image,
        tags: req.body.tags
    };
    postsData.push(newPost);
    console.log(postsData);
    res.status(201).send(newPost);
};

function update(req, res){
    const id = req.params.id;
    const post = postsData.find(post => post.id === Number(id));
    if (!post) {
        res.status(404);
        return res.json({
            err: "not found",
            mess: "post not found"
        });
    };

    post.title = req.body.title;
    post.content = req.body.content;
    post.image = req.body.image;
    post.tags = req.body.tags;

    console.log(postsData);
    res.json(post);
    
};

function modify(req, res){
    const id = req.params.id;
    const {title, content, image, tags} = req.body;
    const post = postsData.find(post => post.id === Number(id));
    if (!post) {
        res.status(404);
        return res.json({
            err: "not found",
            mess: "post not found"
        });
    };
    
    if (title) {
        post.title = req.body.title;
    };
    if (content) {
        post.content = req.body.content;
    };
    if (image){
        post.image = req.body.image;
    };
    if (tags) {
        post.tags = req.body.tags;
    };

    console.log(postsData);
    res.json(post);
};

function destroy(req, res){
    const id = Number(req.params.id);
    const post = posts.find(post => post.id === id);
    if (!post) {
        res.status(404);
        return res.json({
            status: 404,
            err: "not found",
            mess: "post not found"
        })
    }
    posts.splice(posts.indexOf(post),1);
    console.log(posts);
    res.sendStatus(204);
};

module.exports = {index, show, store, update, modify, destroy};
