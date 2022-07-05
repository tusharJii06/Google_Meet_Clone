const express = require('express'); //requiring express
var app = express(); //app has all the properties of express
const server = require('http').Server(app); //creting http server
const io = require('socket.io')(server); //socket runs on this server
const { ExpressPeerServer } = require('peer'); //WebRTC api for real time media communication


const PORT = 8000; //port on which server runs


const peerServer = ExpressPeerServer(server, {
    debug: true
});


app.use(express.static('./assets')); //setting up static path
app.set('view engine', 'ejs'); //setting up view engine
app.set('views', './views'); //setting up view path
app.use('/', require('./routes/index'));
app.use(express.static("./views/whiteboard"));

let connections = [];


//socket handels users joining/leaving and messaging
io.on('connection', socket => {
    //request for joining room
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId); //joining the mentioned room
        socket.broadcast.to(roomId).emit('user-connected', userId, userName);
        socket.on('send-message', (inputMsg, userName) => {
            io.to(roomId).emit('recieve-message', inputMsg, userName);
        })
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId, userName);
        })
    });

   
});

// let connections = [];

io.on("connect", (socket) => {
 connections.push(socket);
  console.log(`${socket.id} has connected`);

  socket.on("down",(data)=>{
    console.log('down data',data);
    connections.forEach(con =>{
        if(con.id!== socket.id){
            con.emit('ondown', {x: data.x, y: data.y})
        }
    })
  });

  socket.on("draw", (data) => {
    console.log("my data",data);
    connections.forEach((con) => {
      if (con.id !== socket.id) {
        con.emit("ondraw", {x: data.x, y: data.y});
      }
    });
  });
  
  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} is disconnected`);
    connections = connections.filter((con) => con.id !== socket.id);
  });
});

// app.use(express.static("./views"));


//running the server
server.listen(PORT, function (err) {
    if (err) {
        console.log(`Error :: ${err} occured while starting the server in index.js!`);
    }
    console.log(`Server is up and running on port ${PORT}`);
});