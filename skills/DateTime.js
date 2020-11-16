const format = require('string-format');
const moment = require('moment-timezone'); // https://momentjs.com/
const { type } = require('os');
const timeZones = require("../utils/timeZones/timezones");
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

exports.execute = async (intent, dialogFlowResult, deviceData) => {

    const queryParams = dialogFlowResult.queryResult.parameters;
    const fulfillmentText = dialogFlowResult.queryResult.fulfillmentText;

    let outputText;

    if (intent === "time.get") {
        var queryCity = queryParams.fields["geo-city"].stringValue;
        var queryCountry = queryParams.fields["geo-country"].stringValue;
        var queryState = queryParams.fields["geo-state"].stringValue;
        var query = queryCity == undefined || queryCity == null || queryCity == '' ? queryCountry : queryCity;
        query = query == undefined || query == null || query == '' ? queryState : query;
        
        // If no query parameter - just return the current time
        if (query === null || query === undefined || query === "") {
            outputText = format(fulfillmentText, moment().format('LT'));  
        }
        else {
            var timezoneCode = timeZones[query.toLowerCase()];
            if(!timezoneCode) {
                outputText = "I don't know the timezone for " + query;
            }
            else {
                outputText = format(fulfillmentText, moment().tz(timezoneCode).format('LT'));   
            }
        }
    }
    else if (intent === "date.get") {
        outputText = format(fulfillmentText, moment().format('MMMM Do YYYY'));
    }
    else if (intent === "date.year.get") {
        outputText = format(fulfillmentText, moment().format('YYYY'));
    }
    else if (intent === "date.month.get") {
        outputText = format(fulfillmentText, moment().format('MMMM'));
    }
    else if (intent === "date.year.check") {
        const date = getDateFromParam(queryParams.fields["date-period"]);

        const confirmationText = new Date().getFullYear() == date.getFullYear() ? "Yes" : "Nope";
        outputText = format(fulfillmentText, confirmationText, moment().format("YYYY"));
    }
    else if (intent === "date.month.check") {
        const date = getDateFromParam(queryParams.fields["date-period"]);

        const confirmationText = new Date().getMonth() == date.getMonth() ? "Yes" : "Nope";
        outputText = format(fulfillmentText, confirmationText, moment().format("MMMM"));
    }
    
    if (outputText != null) {
        return Promise.resolve(outputText);
    }

    return Promise.reject("I'm sorry, I don't understand that.");
}

function getDateFromParam(param) {
    const dateString = param.structValue.fields.startDate;
    return new Date(dateString.stringValue);
}

function createTimeZoneFile() {
    var moment = require('moment-timezone');
    var timeZones = moment.tz.names();
    var fs = require('fs')
    var logger = fs.createWriteStream('timeZones-processed.txt');
    
    var result = {};
    timeZones.forEach(t => {
        var array = t.split("/");

        var last = array[array.length - 1];
        last = last.replace(/_/g, " ");
        last = last.replace(/-/g, " ");

        result[last.toLowerCase()] = t.toLowerCase();
        
        // logger.write(last + ": " + t + '\r');
    });

    logger.write(JSON.stringify(result));
}