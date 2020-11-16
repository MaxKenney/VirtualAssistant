var schedule = require('node-schedule');
const databaseUtil = require("../utils/UpdateDatabase");

exports.ScheduleTimer = function(deviceData, hour, minute, second){
    let date_ob = new Date();
    date_ob.setHours(date_ob.getHours() + hour);
    date_ob.setMinutes(date_ob.getMinutes() + minute);
    date_ob.setSeconds(date_ob.getSeconds() + second);

    var event = schedule.scheduleJob(date_ob, function(){
        deviceData.socket.emit("timer");
    })


}

exports.ScheduleReminder = function(deviceData, messageToSend){
    let date_ob = new Date();
    
    var event = schedule.scheduleJob(date_ob, function(){
        deviceData.socket.emit("messageFromServer", {
            message: messageToSend,
        });
    })
}


