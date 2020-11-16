const express = require("express");
const bodyParser = require("body-parser");
var path = require('path');
const app = express();
const fs = require("fs");
const linear16 = require("linear16");
const queryRoutes = require("./routes/query");
const dialogFlowUtil = require("./utils/DialogFlowUtil");
const queryController = require("./controllers/queryController");
const { response } = require("express");
const port = process.env.PORT || 4000;
const databaseUtil = require("./utils/UpdateDatabase");


app.use(bodyParser.json());

var htmlPath = path.join(__dirname, 'client');
app.use(express.static(htmlPath));

const server = app.listen(port, () => console.log('Server listening at port %d', port));

// ALLOW CROSS ORIGIN (prevents CORS errors)
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

var io = require('socket.io')(server, { pingTimeout: 60000 });
io.on('connection', (socket) => {
    
    socket.on("requestUserPreferences", function(data){    
        if(data != undefined && data.userName != undefined){
            databaseUtil.GetUserPreferences(data.userName)
            .then(value => {
                if(value != undefined){
                    socket.emit("ApplyUserPreferences", value);
                }
            });
        }       
    });

    socket.on("textQuerySubmitted", async (data) => {
        const query = data.data;
        const userName = data.userName;
        const deviceName = data.deviceName;
        
        queryController.handleTextQuery(query, {userName: userName, deviceName: deviceName, socket: socket})
        .then(responseData => {
            socket.emit("responseReceived", responseData)
        })
        .catch(response => { });
    });

    socket.on("audioDataSent", function(data){
        var dataToConvert;
        const userName = data.userName;
        const deviceName = data.deviceName;

		fs.writeFile("./currentCommand.wav", data["data"], function(err){
            
			dataToConvert = linear16('./currentCommand.wav', './prevCommand.raw')
			.then(function(data){
				queryController.handleVoiceQuery({userName: userName, deviceName: deviceName, socket: socket})
                .then(responseData => {
                    socket.emit("responseReceived", responseData);
                })
                .catch(response => { console.log(response);});
			});	
		});
    });
});

app.use("/query", queryRoutes);

app.use((req, res, next) => {
    res.sendStatus(200);
});

const pythonServer = app.listen(8080, () => console.log('Server listening at port %d', 8080));
const pythonIO = require('socket.io')(pythonServer, {});

pythonIO.sockets.on('connection', function(socket){
	console.log("PYTHON CONNECTED");

	socket.on("audioDataSent", function(data){
        console.log("Audio recieved from python");
        var dataToConvert;
        const userName = data.userName;
        const deviceName = data.deviceName;

		fs.writeFile("./currentCommand.wav", data["data"], function(err){
            
			dataToConvert = linear16('./currentCommand.wav', './prevCommand.raw')
			.then(function(data){
				queryController.handleVoiceQuery({userName: userName, deviceName: deviceName, socket: socket})
                .then(responseData => {
                    socket.emit("responseReceived", responseData);
                })
                .catch(response => { console.log(response);});
			});	
		});
    });
})