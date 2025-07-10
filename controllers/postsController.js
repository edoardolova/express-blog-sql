// const postsData = require("../data/postsData.js");
const connection = require("../db/db.js")

function index(req, res) {
    //add tags 
    const sql = `
        SELECT posts.*, GROUP_CONCAT(tags.label SEPARATOR ', ') AS tags
        FROM posts
        JOIN post_tag ON post_tag.post_id = posts.id
        JOIN tags ON tags.id = post_tag.tag_id
        GROUP BY posts.id;
        
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: true, mess: err.message });
        }
        res.json(results);
    });
}


function show(req, res){
    const id = parseInt(req.params.id);
    //add tags 
    const sql = `
        SELECT posts.*, GROUP_CONCAT(tags.label SEPARATOR ', ') AS tags
        FROM posts
        JOIN post_tag ON post_tag.post_id = posts.id
        JOIN tags ON tags.id = post_tag.tag_id
        WHERE posts.id = ?
        GROUP BY posts.id;
    `;
    
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

// function store(req, res){
//     const {title, content, image} = req.body;
//     const sql = 'INSERT INTO posts (title, content, image) VALUES (?, ?, ?)';

//     connection.query(sql, [title, content, image], (err, results) =>{
//         if (err) {
//             return res.status(500).json({error: true, mess: err.message});
//         };
//         console.log(results);
//         res.status(201).json({id: results.insertId});
//     })
// };



// Funzione to capitalize first letter
function capitalize(string) {
    string = string.trim();
    if (string.length === 0){
        return "";
    } 
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
// store post + tag id + post_tag
function store(req, res) {
    const { title, content, image, tags } = req.body;
    //sql query create post
    const sqlPost = 'INSERT INTO posts (title, content, image) VALUES (?, ?, ?)';

    connection.query(sqlPost, [title, content, image], (err, postResult) => {
        if (err) {
            return res.status(500).json({ error: true, mess: err.message });
        }
        //post id for the post_tag
        const postId = postResult.insertId;

        if (!tags || tags.length === 0) {
            // No tags to process
            return res.status(201).json({ id: postId });
        }

        // Process each tag
        const tagPromises = tags.map((label) => {
            const normalizedLabel = capitalize(label);

            return new Promise((resolve, reject) => {
                // Check if tag already exists
                const sqlCheck = 'SELECT id FROM tags WHERE LOWER(label) = ?';
                connection.query(sqlCheck, [normalizedLabel.toLowerCase()], (err, tagResults) => {
                    if (err){
                        return reject(err);
                    } 

                    // Tag exists
                    if (tagResults.length > 0) {
                        return resolve(tagResults[0].id);
                    } 
                    // Insert new tag with capitalized label
                    else {
                        const sqlInsertTag = 'INSERT INTO tags (label) VALUES (?)';
                        connection.query(sqlInsertTag, [normalizedLabel], (err, newTagResult) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve(newTagResult.insertId);
                        });
                    }
                });
            });
        });

        Promise.all(tagPromises)
            .then(tagIds => {

                const pivotValues = tagIds.map(tagId => [postId, tagId]);
                // Insert into post_tag pivot table   (VALUES ? insert more row in one go)
                const sqlPivot = 'INSERT INTO post_tag (post_id, tag_id) VALUES ?';

                connection.query(sqlPivot, [pivotValues], (err) => {
                    if (err) {
                        return res.status(500).json({ error: true, mess: err.message });
                    }
                    res.status(201).json({ id: postId });
                });
            })
            .catch(err => {
                res.status(500).json({ error: true, mess: err.message });
            });
    });
}


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
