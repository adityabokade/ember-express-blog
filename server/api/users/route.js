var User = require('../../models/user');
var passport = require('passport');
var config = require('../../config/config');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
    return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
    User.find({}, '-salt -hashedPassword', function(err, users) {
        if (err) return res.status(500).send(err);
        res.status(200).json(users);
    });
};

/**
 * Creates a new user
 */
exports.create = function(req, res, next) {
    var newUser = new User(req.body);
    newUser.provider = 'local';
    User.find({}, '-salt -hashedPassword', function(err, users) {
        if (err) return res.status(500).send(err);
        if (users && users.length) {
            newUser.role = 'user';
        } else {
            newUser.role = 'admin';
        }
        newUser.save(function(err, user) {
            if (err) return validationError(res, err);
            var token = jwt.sign({
                _id: user._id
            }, config.secret, {
                expiresIn: 60 * 60 * 5
            });
            res.json({
                token: token
            });
        });
    });
};

/**
 * Get a single user
 */
exports.show = function(req, res, next) {
    var userId = req.params.id;

    User.findById(userId, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        res.json(user.profile);
    });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err, user) {
        if (err) return res.status(500).send(err);
        return res.status(204).send('No Content');
    });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
    var userId = req.user._id;
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    User.findById(userId, function(err, user) {
        if (user.authenticate(oldPass)) {
            user.password = newPass;
            user.save(function(err) {
                if (err) return validationError(res, err);
                res.status(200).send('OK');
            });
        } else {
            res.status(403).send('Forbidden');
        }
    });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
    var userId = req.user._id;
    User.findOne({
        _id: userId
    }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        res.json(user);
    });
};

/**
 * Get my info
 */
exports.setup = function(req, res, next) {
    User.find({}, '-salt -hashedPassword', function(err, users) {
        if (err) return res.status(500).send(err);
        if (users.length !== 0) {
            var error = new Error('Users route has been already setup');
            return res.status(500).send(error);
        }
        res.status(200).json(users);
    });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};
