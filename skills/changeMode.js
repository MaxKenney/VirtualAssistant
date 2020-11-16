const databaseUtil = require("../utils/UpdateDatabase");

exports.execute = async (intent, dialogFlowResult, deviceData) => {
    if(deviceData.userName === undefined){
        return Promise.resolve("I'm sorry, you must log in first");
    }
   
    var responseText = dialogFlowResult.queryResult.fulfillmentText;

    if(intent === 'changeMode.customize_UI'){
        databaseUtil.changeMode(deviceData.userName, "customizeUI");
        return Promise.resolve(responseText);
    }else if(intent === 'changeMode.default'){
        databaseUtil.changeMode(deviceData.userName, "default"); 
        return Promise.resolve(responseText);
    }

    return Promise.resolve("I'm sorry, I don't understand that.");
}