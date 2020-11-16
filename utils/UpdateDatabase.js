var firebase = require("firebase");
var firebaseConfig = require("../firebaseServiceAccounts/database.json");
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

exports.AddUserData = function AddUserData(userData){
    if(userData.userName != undefined){
        tryCreateUser(userData.userName, new BaseUser(userData.socketID), userData.deviceName, new Device(userData.socketID))
    }
}

exports.UserActionUpdate = function(userName, deviceName, socketID, completedIntent){
    database.ref(userName).update({lastSocketID: socketID, timeOfLastAction: getCurrentDateTime(), previousAction: completedIntent});
    database.ref(userName).child("Devices").child(deviceName).update({lastSocketID: socketID});
}

exports.RemoveDevice = function(userName, deviceName){
    database.ref(userName).child("Devices").child(deviceName).remove();
}

exports.GetUserPreferences = async (userName) => {
    var userPreferences;
    await database.ref('/').once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            if(childSnapshot.key === userName){
                userPreferences = childSnapshot.val().UserPreferences;
            }

        })
    });
    return userPreferences;
}

exports.GetCurrentMode = async(userName) => {
    var mode;
    await database.ref('/').once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            if(childSnapshot.key === userName){
                mode = childSnapshot.val().mode;
            }

        })
    });
    return mode;
}

exports.GetSocketForUser = async(userName) => {
    var socket;
    await database.ref('/').once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            if(childSnapshot.key === userName){
                socket = childSnapshot.val().lastSocketID;
            }

        })
    });
    return socket;
}

exports.changeMode = function(userName, newMode){
    database.ref(userName).update({mode: newMode});
}

exports.changeColour = function(userName, colour){
    database.ref(userName).child("UserPreferences").update({primaryColour: colour});
}

exports.CompareCurrentTimeToPrevious = async (userName) => {
    var dateTime;

    await database.ref('/').once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            if(childSnapshot.key === userName){
                dateTime = childSnapshot.val().timeOfLastAction;
            }

        })
    });
    return Date.parse(dateTime) - Date.parse(getCurrentDateTime());
}


function tryCreateUser(userName, userData, deviceName, Device) {
    database.ref(userName).update(userData);
    database.ref(userName).child("Devices").child(deviceName).update(Device);
    // database.ref(userName).child("UserPreferences").update({
    //     primaryColour: "#0099ff"
    // });
}

class BaseUser{
    constructor(currentSocketID, deviceName,){
        this.lastSocketID = currentSocketID;
        this.mode = "default";
        this.timeOfLastAction = getCurrentDateTime();
    }
}

class Device{
    constructor(socketID){
        this.lastSocketID = socketID;
    }
}

function getCurrentDateTime(){
    let date_ob = new Date();

    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);
    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    // current year
    let year = date_ob.getFullYear();
    // current hours
    let hours = date_ob.getHours();
    // current minutes
    let minutes = date_ob.getMinutes();
    // current seconds
    let seconds = date_ob.getSeconds();
    // return date & time in YYYY-MM-DD HH:MM:SS format
    return (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

}