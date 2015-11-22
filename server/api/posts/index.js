var mongoose = require('mongoose');
var Post = require('../../models/post');

module.exports.add = function(req, res) {
    var post = new Post(req.body.post);
    post.save(function(err) {
        if (err) {
            res.send(err);
        }
        res.json({
            post: post
        });
    });
};

module.exports.getAll = function(req, res) {
    Post.find(function(err, posts) {
        if (err) {
            res.send(err);
        }
        res.json({
            posts: posts
        });
    });
};

module.exports.getOne = function(req, res, id) {
    Post.findById(id, function(err, post) {
        if (err) {
            res.send(err);
        }
        res.json({post: post});
    });
};

module.exports.update = function(req, res, id) {
    Post.findByIdAndUpdate(id, {$set: req.body.post}, function(err, post) {
        if (err) {
            res.send(err);
        }
        res.json({post: post});
    });
};

module.exports.delete = function(req, res, id) {
    Post.findByIdAndRemove(id, function(err) {
        if (err) {
            res.send(err);
        }
        res.sendStatus(200);
    });
};
