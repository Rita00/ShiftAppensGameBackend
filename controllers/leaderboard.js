const User = require("../models/user")

exports.getLeaderboard = (req, res, next) => {
    User.find({}, 'username totalPoints')
    .then(userDocuments => {
        res.status(200).json({
            ranks: userDocuments
        })
    })
    .catch(error => {
        res.status(400).json({
            msg: ""
        })
    }) 
}