const databaseUtil = require("../utils/UpdateDatabase");

exports.execute = async (intent, dialogFlowResult, deviceData) => {
    var userName = "";
    var deviceName = "";
    var responseText = dialogFlowResult.queryResult.fulfillmentText;
    
    // conso
    // if(dialogFlowResult.queryResult.parameters.fields.hasOwnProperty("given-name") && dialogFlowResult.queryResult.parameters.fields.hasOwnProperty("device_name")){
    //     if(dialogFlowResult.queryResult.parameters.fields['given-name'].stringValue != null){
    //         userName = dialogFlowResult.queryResult.parameters.fields['given-name'].stringValue;
    //     }
    
    //     if(dialogFlowResult.queryResult.parameters.fields['device_name'].stringValue != null){
    //         deviceName = dialogFlowResult.queryResult.parameters.fields['device_name'].stringValue;
    //     }
    // }
    

    if(intent === 'store.PermanentDevice'){
        var userName = "";
        var deviceName = "";
        var responseText = dialogFlowResult.queryResult.fulfillmentText;


        if(dialogFlowResult.queryResult.parameters.fields['given-name'].stringValue != null){
            userName = dialogFlowResult.queryResult.parameters.fields['given-name'].stringValue;
        }

        if(dialogFlowResult.queryResult.parameters.fields['device_name'].stringValue != null){
            deviceName = dialogFlowResult.queryResult.parameters.fields['device_name'].stringValue;
        }
        
        //Break if the query needs more information
        if(userName === "" || deviceName === "")
            return Promise.resolve(responseText);
        
        databaseUtil.AddUserData({userName: userName, deviceName: deviceName, socketID: deviceData.socket.id});
        
        if(userName != undefined){
            
            databaseUtil.GetUserPreferences(userName)
            .then(value => {
                if(value != undefined){
                    
                    deviceData.socket.emit("ApplyUserPreferences", value);
                }
            });
        }   

        return Promise.resolve({
            responseText: responseText,
            userName: userName,
            deviceName: deviceName,
            daysToExpire: 7
        });
        
    }else if(intent === "store.clear_device"){
        //CLEAR STORED DATA FOR THE DEVICE
        databaseUtil.RemoveDevice(deviceData.userName, deviceData.deviceName);
        deviceData.socket.emit("clearCookies", {colour: "#0099ff"});
        return Promise.resolve({
            responseText: responseText,
            userName: undefined,
            deviceName: undefined,
        })
    }
    

    return Promise.resolve("I'm sorry, I don't understand that.");
}