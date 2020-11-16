const path = require("path");
const skillPaths = require("../utils/SkillPaths");
const dialogFlowUtil = require("../utils/DialogFlowUtil");
const unknownDeviceDialogFlowUtil = require("../utils/UnknownDeviceDialogFlowUtil");
const { response } = require("express");
const databaseUtil = require("../utils/UpdateDatabase");
const customizeUIDialogFlowUtil = require('../utils/CustomizeUIDialogFlowUtil');

exports.handleTextQuery = async (query, deviceData) => {
    var dialogFlowResult = {};
    var performNormalSkill = true;
    
    //If the previous request was made over 5 minutes ago (in milliseconds) then set mode to default
    if(await databaseUtil.CompareCurrentTimeToPrevious(deviceData.userName) <-300000){
        databaseUtil.changeMode(deviceData.userName, "default");
    }
    
    
    if(deviceData.userName === undefined){   
        //Use unknown device handler 
        dialogFlowResult = await unknownDeviceDialogFlowUtil.executeTextQuery(query);
       
    }else if(await databaseUtil.GetCurrentMode(deviceData.userName) === "customizeUI"){
        dialogFlowResult = await customizeUIDialogFlowUtil.executeTextQuery(query);
    }

    if(dialogFlowResult.queryResult != undefined && !(dialogFlowResult.queryResult.intent.displayName == 'Default Welcome Intent') && !(dialogFlowResult.queryResult.intent.displayName == 'Default Fallback Intent')){
        performNormalSkill = false;
    }
    

    if(performNormalSkill){
        dialogFlowResult = await dialogFlowUtil.executeTextQuery(query);
        
    }
    return this.handleQuery(dialogFlowResult, false, deviceData);
};

exports.handleVoiceQuery = async (deviceData) => {
    var dialogFlowResult = {};
    var performNormalSkill = true;

    //If the previous request was made over 5 minutes ago (in milliseconds) then set mode to default
    if(await databaseUtil.CompareCurrentTimeToPrevious(deviceData.userName) < -300000){
        databaseUtil.changeMode(deviceData.userName, "default");
    }
    
    if(deviceData.userName === undefined){
        //Use unknown device handler 
        dialogFlowResult = await unknownDeviceDialogFlowUtil.executeVoiceQuery();
       
    }else if(await databaseUtil.GetCurrentMode(deviceData.userName) === "customizeUI"){
        dialogFlowResult = await customizeUIDialogFlowUtil.executeVoiceQuery();
    }

    if(dialogFlowResult.queryResult != undefined && !(dialogFlowResult.queryResult.intent.displayName == 'Default Welcome Intent') && !(dialogFlowResult.queryResult.intent.displayName == 'Default Fallback Intent')){
        performNormalSkill = false;
    }

    if(performNormalSkill){
        dialogFlowResult = await dialogFlowUtil.executeVoiceQuery(); 
    }
    return this.handleQuery(dialogFlowResult, true, deviceData);
};

exports.handleQuery = async (dialogFlowResult, isVoiceQuery, deviceData) => {
    const queryText = dialogFlowResult.queryResult.queryText;

    let domain = null;
    let intent = null;
    
    if (dialogFlowResult.queryResult.intent != null) {
        intent = dialogFlowResult.queryResult.intent.displayName;

        if (intent == 'Default Welcome Intent') {
            domain = 'smalltalk';
        }
        else {
            domain = intent.substr(0, intent.indexOf('.'));
        }
    }
    
    const skill = getSkill(domain);
    var responseData = await skill.execute(intent, dialogFlowResult, deviceData);
    var responseText;
    

    if (responseData === null || responseData === undefined) {
        responseText = "I'm sorry, I don't understand that.";
    }else if(typeof(responseData) === 'string'){
        responseText = responseData;
    }else{
        if(responseData.responseText != null)
            responseText = responseData.responseText;
    }

    if(deviceData.userName != undefined && intent != "store.clear_device"){
        databaseUtil.UserActionUpdate(deviceData.userName, deviceData.deviceName, deviceData.socket.id, intent);
    }
    
    
    
     // Format the data response
     return {
        responseText: responseText,
        isVoiceQuery: isVoiceQuery,
        queryText: queryText,
        intent: intent,
        responseData: responseData,

    }
};

function getSkill(domain) {
    try {
        let fileName;

        if (skillPaths.hasOwnProperty(domain)) {
            fileName = skillPaths[domain];
        }
        else {
            fileName = "skills/SpeakResponse.js";
        }
        
        const pathToSkill = path.join(__dirname, "..", fileName);
        return require(pathToSkill);
    }
    catch(error) {
        console.log(error);
        return require("../skills/ErrorSkill");
    }
}