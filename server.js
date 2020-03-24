const express = require('express')
const app = express()
const https = require("https");
const http = require('http').Server(app)
const io = require('socket.io')(http)
// const request = require("request");
const bodyParser = require("body-parser");
const port = process.env.PORT || 8000
// var favicon = require('favicon');

app.use(express.static(__dirname + "/public"))
let clients = 0

////////////////////////////////////////
// favicon("http://nodejs.org/", function(err, favicon_url) {
//     app.use(favicon(__dirname + '/public/images/favicon.ico'))
// });



app.use(bodyParser.urlencoded({
    extented: true
}));



app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signup.html");

});

app.post("/",function(req,res){

    const firstName=req.body.firstname;
    const lastName=req.body.lastname;
    const email=req.body.email;
    
    
    const data = {
        members:[
            {
                email_address:email,
                status: "subscribed",
                merge_fields:{
                    FNAME:firstName,
                    LNAME:lastName
                }
            }
        ]

    };

    const jsonData = JSON.stringify(data);
   

    const url = "https://us19.api.mailchimp.com/3.0/lists/e5d4bd07df";

    const options = {
        method:"POST",
        auth:"nivedin:b4831b529636846617d646bb0c06141d-us19"
    }

    /*here*/
    const request = https.request(url,options,function(response){

        if(response.statusCode===200){
            res.sendFile(__dirname + "/public/videochat.html");
        }else{
            res.sendFile(__dirname + "/failure.html");
        }

    })
    request.write(jsonData);
    request.end();

});

app.post("/failure",function(req,res){
    res.redirect("/");
});





///////////////////////////////////////

io.on('connection', function (socket) {
    socket.on("NewClient", function () {
        if (clients < 2) {
            if (clients == 1) {
                this.emit('CreatePeer')
            }
        }
        else
            this.emit('SessionActive')
        clients++;
    })
    socket.on('Offer', SendOffer)
    socket.on('Answer', SendAnswer)
    socket.on('disconnect', Disconnect)
})

function Disconnect() {
    if (clients > 0) {
        if (clients <= 2)
            this.broadcast.emit("Disconnect")
        clients--
    }
}

function SendOffer(offer) {
    this.broadcast.emit("BackOffer", offer)
}

function SendAnswer(data) {
    this.broadcast.emit("BackAnswer", data)
}

http.listen(process.env.PORT ||port, () => console.log(`Active on ${port} port`))



