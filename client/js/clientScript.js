// const { response } = require("express")();

var socket = io();

var sendButton = document.getElementById("sendButton");
var inputBox = document.getElementById("inputBox");
var responseHeader = document.getElementById("responseHeader");
var queryTextHeader = document.getElementById("queryTextHeader");
var microphonePressArea = document.getElementById('listenButton');


$(document).ready(function(){
    sendButton.onclick = sendMessage;
    socket.on('connect', function(){
        socket.emit("requestUserPreferences", {
            userName: Cookies.get('userName'),
            deviceName: Cookies.get('deviceName'),
        });
    });

    socket.on('responseReceived', function(responseFromServer){
        responseHeader.textContent = responseFromServer.responseText;
        queryTextHeader.textContent = "You said: " + responseFromServer.queryText;

        
        if(responseFromServer.responseData.audioFile != null){
            textToSpeech(responseFromServer.responseData.audioFile);
        }
        
        
        PerformAction(responseFromServer);
    });

    socket.on('messageFromServer', function(messageFromServer){
        responseHeader.textContent = messageFromServer.message;
    });

    socket.on('ApplyUserPreferences', function(userPreferences){
        console.log(userPreferences);
        ApplyUserPreferences(userPreferences);
    });

    socket.on('timer', function(){
        alert("This is your timer!");
    })

    socket.on('setDeviceSettings', function(responseData){
        Cookies.set('userName', responseData.userName, {expires: responseData.daysToExpire});
        Cookies.set('deviceName', responseData.deviceName, {expires: responseData.daysToExpire});
    });

    socket.on('clearCookies', function(data){
        var cookies = document.cookie.split(";");

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        /* --It will not delete cookies with HttpOnly flag set,
        as the HttpOnly flag disables Javascript's access to the cookie.
        --It will not delete cookies that have been set with a Path value.
        (This is despite the fact that those cookies will appear in document.cookie, 
        but you can't delete it without specifying the same Path value with which it was set.) */
        
        changeBackgroundColour(data.colour);
    });

    microphonePressArea.onpointerdown = downhandler;
 	microphonePressArea.onpointerup = upHandler;
 	microphonePressArea.onpointercancel = cancelHandeler;

});


function sendMessage(){
    var message = inputBox.value;
    if(message != ""){
        socket.emit("textQuerySubmitted", {
            data: message,
            userName: Cookies.get('userName'),
            deviceName: Cookies.get('deviceName'),
        });
        inputBox.value = "";
    }  
}

function textToSpeech(audioFile){
    var blob = new Blob([audioFile], {type: 'audio/mpeg-3'});
    console.log("need to do something with this blob");
    

   
}


function PerformAction(responseFromServer){
    console.log(responseFromServer.intent);
    console.log(responseFromServer.responseData);
    if(responseFromServer.responseData.userName != undefined && responseFromServer.responseData.deviceName != undefined){
        var responseData = responseFromServer.responseData;
        if(responseFromServer.intent === "store.PermanentDevice"){
            Cookies.set('userName', responseData.userName, {expires: responseData.daysToExpire});
            Cookies.set('deviceName', responseData.deviceName, {expires: responseData.daysToExpire});
        }else if(responseFromServer.intent === "store.clear_device"){
            Cookies.remove('userName');
            Cookies.remove('deviceName');
        }
    }

    // responseFromServer.intent = "customize_UI.change_Colour";

    if(responseFromServer.intent.split('.')[0] == "customize_UI"){
        ApplyUserPreferences(responseFromServer.userPreferences);
    }
    
}

function ApplyUserPreferences(userPreferences){
    console.log(userPreferences);
    if(userPreferences.primaryColour != undefined){
        
        changeBackgroundColour(userPreferences.primaryColour);
    }
}

function changeBackgroundColour(newColour){
    document.body.style.background = newColour;
}

var recorder = new WzRecorder({
    onRecordingStop: function(blob) {
        document.getElementById('vid2').src = URL.createObjectURL(blob);
    },
    onRecording: function(milliseconds) {
        document.getElementById('duration').innerText = milliseconds + 'ms';
    }
});

recorder.initialiseMicrophone();

function downhandler(event){
	console.log("STARTED TOUCHhhh");
	recorder.toggleRecording();
}

function upHandler(event){
	console.log("ENDING TOUCH");
	recorder.toggleRecording();
}

function cancelHandeler(event){
	console.log("CANCELING TOUCH");
	recorder.toggleRecording();
}

function WzRecorder(config) {

    config = config || {};

    var self = this;
    var audioInput;
    var audioNode;
    var bufferSize = config.bufferSize || 4096;
    var recordedData = [];
    var recording = false;
    var recordingLength = 0;
	var startDate;
	var audioCtx;
	
	this.toggleRecording = function()
	{
		recording ? self.stop() : self.start();
	}
	

	this.initialiseMicrophone = function(){
		// webkit audio context shim
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        if (audioCtx.createJavaScriptNode) {
            audioNode = audioCtx.createJavaScriptNode(bufferSize, 1, 1);
        } else if (audioCtx.createScriptProcessor) {
            audioNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
        } else {
            throw 'WebAudio not supported!';
        }

        audioNode.connect(audioCtx.destination);

        navigator.mediaDevices.getUserMedia({audio: true})
            .catch(onMicrophoneError)
	};

    this.start = function() {

    	
		// reset any previous data
		recordedData = [];
		recordingLength = 0;
		
		// webkit audio context shim
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        if (audioCtx.createJavaScriptNode) {
            audioNode = audioCtx.createJavaScriptNode(bufferSize, 1, 1);
        } else if (audioCtx.createScriptProcessor) {
            audioNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
        } else {
            throw 'WebAudio not supported!';
        }

        audioNode.connect(audioCtx.destination);

        navigator.mediaDevices.getUserMedia({audio: true})
            .then(onMicrophoneCaptured)
            .catch(onMicrophoneError)
    };

    this.stop = function() {
        stopRecording(function(blob) {
			self.blob = blob;

			config.onRecordingStop && config.onRecordingStop(blob);

        });
    };
	
	this.upload = function (url, params, callback) {
        var formData = new FormData();
        formData.append("audio", self.blob, config.filename || 'recording.wav');
        
        for (var i in params)
            formData.append(i, params[i]);

        var request = new XMLHttpRequest();
        request.upload.addEventListener("progress", function (e) {
            callback('progress', e, request);
        });
        request.upload.addEventListener("load", function (e) {
            callback('load', e, request);
        });

		request.onreadystatechange = function (e) {
			var status = 'loading';
			if (request.readyState == 4)
			{
				status = request.status == 200 ? 'done' : 'error';
			}
			callback(status, e, request);
		};
  
        request.open("POST", url);
        request.send(formData);
    };


    function stopRecording(callback) {
        // stop recording
        recording = false;

        // to make sure onaudioprocess stops firing
		window.localStream.getTracks().forEach( (track) => { track.stop(); });
        audioInput.disconnect();
        audioNode.disconnect();
		
        exportWav({
            sampleRate: sampleRate,
            recordingLength: recordingLength,
            data: recordedData
        }, function(buffer, view) {
            self.blob = new Blob([view], { type: 'audio/ogg' });
            socket.emit("audioDataSent", {
                data: self.blob, 
                userName: Cookies.get('userName'),
                deviceName: Cookies.get('deviceName'),
            });
            callback && callback(self.blob);
        });
    }


    function onMicrophoneCaptured(microphone) {

		if (config.visualizer)
			visualize(microphone);
		
		// save the stream so we can disconnect it when we're done
		window.localStream = microphone;

        audioInput = audioCtx.createMediaStreamSource(microphone);
        audioInput.connect(audioNode);

        audioNode.onaudioprocess = onAudioProcess;

        recording = true;
		self.startDate = new Date();
		
		config.onRecordingStart && config.onRecordingStart();
		sampleRate = audioCtx.sampleRate;
    }

    function onMicrophoneError(e) {
		console.log(e);
		alert('Unable to access the microphone.');
    }

    function onAudioProcess(e) {
        if (!recording) {
            return;
        }

        recordedData.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        recordingLength += bufferSize;

        self.recordingLength = recordingLength;
		self.duration = new Date().getTime() - self.startDate.getTime();

		config.onRecording && config.onRecording(self.duration);
    }

	
	function visualize(stream) {
		var canvas = config.visualizer.element;
		if (!canvas)
			return;
			
		var canvasCtx = canvas.getContext("2d");
		var source = audioCtx.createMediaStreamSource(stream);

		var analyser = audioCtx.createAnalyser();
		analyser.fftSize = 2048;
		var bufferLength = analyser.frequencyBinCount;
		var dataArray = new Uint8Array(bufferLength);

		source.connect(analyser);

		function draw() {
			// get the canvas dimensions
			var width = canvas.width, height = canvas.height;

			// ask the browser to schedule a redraw before the next repaint
			requestAnimationFrame(draw);

			// clear the canvas
			canvasCtx.fillStyle = config.visualizer.backcolor || '#fff';
			canvasCtx.fillRect(0, 0, width, height);

			if (!recording)
				return;
			
			canvasCtx.lineWidth = config.visualizer.linewidth || 2;
			canvasCtx.strokeStyle = config.visualizer.forecolor || '#f00';

			canvasCtx.beginPath();

			var sliceWidth = width * 1.0 / bufferLength;
			var x = 0;

			
			analyser.getByteTimeDomainData(dataArray);

			for (var i = 0; i < bufferLength; i++) {
			
				var v = dataArray[i] / 128.0;
				var y = v * height / 2;

				i == 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y);
				x += sliceWidth;
			}
		
			canvasCtx.lineTo(canvas.width, canvas.height/2);
			canvasCtx.stroke();
		}
		
		draw();
	}
	
    function exportWav(config, callback) {
        function inlineWebWorker(config, cb) {

            var data = config.data.slice(0);
            var sampleRate = config.sampleRate;          
			data = joinBuffers(data, config.recordingLength);
		
            function joinBuffers(channelBuffer, count) {
                var result = new Float64Array(count);
                var offset = 0;
                var lng = channelBuffer.length;

                for (var i = 0; i < lng; i++) {
                    var buffer = channelBuffer[i];
                    result.set(buffer, offset);
                    offset += buffer.length;
                }

                return result;
            }

            function writeUTFBytes(view, offset, string) {
                var lng = string.length;
                for (var i = 0; i < lng; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            }

            var dataLength = data.length;

            // create wav file
            var buffer = new ArrayBuffer(44 + dataLength * 2);
            var view = new DataView(buffer);
			
            writeUTFBytes(view, 0, 'RIFF'); // RIFF chunk descriptor/identifier
            view.setUint32(4, 44 + dataLength * 2, true); // RIFF chunk length
            writeUTFBytes(view, 8, 'WAVE'); // RIFF type
            writeUTFBytes(view, 12, 'fmt '); // format chunk identifier, FMT sub-chunk
            view.setUint32(16, 16, true); // format chunk length
            view.setUint16(20, 1, true); // sample format (raw)
            view.setUint16(22, 1, true); // mono (1 channel)
            view.setUint32(24, sampleRate, true); // sample rate
            view.setUint32(28, sampleRate * 2, true); // byte rate (sample rate * block align)
            view.setUint16(32, 2, true); // block align (channel count * bytes per sample)
            view.setUint16(34, 16, true); // bits per sample
            writeUTFBytes(view, 36, 'data'); // data sub-chunk identifier
            view.setUint32(40, dataLength * 2, true); // data chunk length

            // write the PCM samples
            var index = 44;
            for (var i = 0; i < dataLength; i++) {
                view.setInt16(index, data[i] * 0x7FFF, true);
                index += 2;
            }

            if (cb) {
                return cb({
                    buffer: buffer,
                    view: view
                });
            }

            postMessage({
                buffer: buffer,
                view: view
            });
        }

        var webWorker = processInWebWorker(inlineWebWorker);

        webWorker.onmessage = function(event) {
            callback(event.data.buffer, event.data.view);

            // release memory
            URL.revokeObjectURL(webWorker.workerURL);
        };

        webWorker.postMessage(config);
    }

    function processInWebWorker(_function) {
        var workerURL = URL.createObjectURL(new Blob([_function.toString(),
            ';this.onmessage = function (e) {' + _function.name + '(e.data);}'
        ], {
            type: 'application/javascript'
        }));

        var worker = new Worker(workerURL);
        worker.workerURL = workerURL;
        return worker;
    }
}