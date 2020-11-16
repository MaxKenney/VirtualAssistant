const databaseUtil = require("../utils/UpdateDatabase");
const colours = require("../utils/Colours");

exports.execute = async (intent, dialogFlowResult, deviceData) => {
    var userName = "";
    var deviceName = "";
    var responseText = dialogFlowResult.queryResult.fulfillmentText;


    if(intent === 'customize.ChangeColour'){
        var colour = "";

        if(dialogFlowResult.queryResult.parameters.fields['color'].stringValue != null){
            colour = colours[dialogFlowResult.queryResult.parameters.fields['color'].stringValue];
            
            if(colour === undefined)
                colour = colours.default;
        }
        //Break if the query needs more information
        if(colour === "")
            return Promise.resolve("We dont have that colour");
        
        
        databaseUtil.changeColour(deviceData.userName, colour);
        
        if(deviceData.userName != undefined){
            
            databaseUtil.GetUserPreferences(deviceData.userName)
            .then(value => {
                if(value != undefined){
                    
                    deviceData.socket.emit("ApplyUserPreferences", value);
                }
            });
        }   

        return Promise.resolve(responseText);
        
    }

    return Promise.resolve("I'm sorry, I don't understand that.");
}