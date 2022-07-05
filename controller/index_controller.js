const { v4: uuidv4 } = require('uuid'); //used to get unique room ids

module.exports.renderHome = function (req, res) {
    return res.render('home');
}

module.exports.createNewRoom = function (req, res) {
    return res.redirect(`/room/${uuidv4()}`);
}

module.exports.joinRoom = function (req, res) {
    return res.render('room', { roomId: req.params.room });
}

module.exports.leaveRoom = function (req, res) {
    return res.render('meeting_end', { roomId: req.params.room });
}
module.exports.joinWhiteboard=function (req,res){
    return res.render("whiteboard",{ roomId: req.params.room })
}