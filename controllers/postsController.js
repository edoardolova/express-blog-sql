// const postsData = require("../data/postsData.js");
const connection = require("../db/db.js")

function index(req, res){
    const sql = 'SELECT * FROM posts';

    connection.query(sql, (err, results)=>{
        if (err) {
            return res.status(500).json({error: true, mess: err.message});
        };
        console.log(results);
        res.json(results);
    });
};

function show(req, res){
    const id = parseInt(req.params.id);

    const sql = 'SELECT * FROM posts WHERE id = ?';
    connection.query(sql, [id], (err, results)=>{
        if (err) {
            return res.status(500).json({error: true, mess: err.message});
        };
        if (results.length === 0) {
            return res.status(404).json({error: true, mess: 'post not found'});
        };
        res.json(results)
    });
};

function store(req, res){
    const {title, content, image} = req.body;
    const sql = 'INSERT INTO posts (title, content, image) VALUES (?, ?, ?)';

    connection.query(sql, [title, content, image], (err, results) =>{
        if (err) {
            return res.status(500).json({error: true, mess: err.message});
        };
        console.log(results);
        res.status(201).json({id: results.insertId});
    })
};

function update(req, res){
    const id = parseInt(req.params.id);
    const {title, content, image} = req.body;

    
    // Prepare the sql to update the post
    const sql = 'UPDATE posts SET title = ?, content = ?, image = ? WHERE id = ?';
     // Execute the update query
    connection.query(sql, [title, content, image, id], (err, results) =>{
        if (err) {
            return res.status(500).json({error: true, mess: err.message});
        };
        if (results.affectedRows === 0) {
            return res.status(404).json({error: true, mess: 'post not found'})
        };

        // second query to read the updated post from the database, so we can return the updated data to the client
        const sqlPost = 'SELECT * FROM posts WHERE id = ?';   
        connection.query(sqlPost, [id], (err, results) =>{
            if (err) {
                return res.status(500).json({error: true, mess: err.message});
            };
            if (results.length === 0) {
                return res.status(404).json({error: true, mess: 'post not found'});
            };
    
            return res.json(results);
        });
    });  
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
    const id = parseInt(req.params.id);
    const sql = 'DELETE FROM posts WHERE id = ?';

    connection.query(sql, [id], (err, results)=>{
        if (err){
            return res.status(500).json({ error: true, message: err.message });
        };

        if (results.affectedRows === 0) {
            return res.status(404).json({
            error: true,
            message: 'Not Found'
            });
        };
    });
    
    res.sendStatus(204);

};

module.exports = {index, show, store, update, modify, destroy};
