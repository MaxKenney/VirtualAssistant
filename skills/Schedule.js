const scheduleJobUtil = require("../utils/ScheduleJob");

exports.execute = async (intent, dialogFlowResult, deviceData) => {
    var responseText = dialogFlowResult.queryResult.fulfillmentText;
    const queryParams = dialogFlowResult.queryResult.parameters;

    if(intent === 'schedule.timer'){
    	var unitsOfTime = queryParams.fields["unit-time"].listValue.values;
    	var numbers = queryParams.fields["number"].listValue.values;
    	var counter = 0;

    	var hour = 0;
    	var minute = 0;
    	var second = 0;

    	unitsOfTime.forEach(function(entry){
    		if(numbers.length > 0){
    			var num = numbers.shift();

    			if(entry.stringValue == 'hour'){
	    			hour = hour + num.numberValue;
	    			counter++;
	    		}else if(entry.stringValue == 'minute'){
	    			minute = minute + num.numberValue;
	    			counter++;
	    		}else if(entry.stringValue = 'second'){
	    			second = second + num.numberValue;
	    		}
    		}
    	})

        if(hour != 0 || minute != 0 || second != 0){
        	scheduleJobUtil.ScheduleTimer(deviceData, hour, minute, second);
        	var response = "Okay, setting the timer for ";
        	if(hour != 0){
        		if(hour == 1){
        			response = response + hour + " hour ";
        		}else{
        			response = response + hour + " hours ";
        		}
        		
        	}
        	if(minute != 0){
        		if(minute == 1){
        			response = response + minute + " minute ";
        		}else{
        			response = response + minute + " minutes ";
        		}
        	}
        	if(second != 0){
        		if(second == 1){
        			response = response + second + " second ";
        		}else{
        			response = response + second + " seconds ";
        		}
        	}
        	return Promise.resolve(response);
        }
        else{
        	return Promise.resolve(responseText);
        }
    }else if(intent === 'schedule.reminder'){
        console.log("setting reminder");

        var dateTime;
        var person;
        var reminderToGive;

		

        // if(dialogFlowResult.queryResult.parameters.fields['date-time'].structValue.fields['date_time'].stringValue != null){
        //     dateTime = dialogFlowResult.queryResult.parameters.fields['date-time'].structValue.fields['date_time'].stringValue;
		// }
		
		if(dialogFlowResult.queryResult.parameters.fields['date-time'].structValue != null){
			dateTime = dialogFlowResult.queryResult.parameters.fields['date-time'].structValue.fields['date_time'].stringValue;
		}else{
			dateTime = dialogFlowResult.queryResult.parameters.fields['date-time'].stringValue;
		}

        if(dialogFlowResult.queryResult.parameters.fields['person'].stringValue != null){
            person = dialogFlowResult.queryResult.parameters.fields['person'].stringValue;
        }

        if(dialogFlowResult.queryResult.parameters.fields['reminderToGive'].stringValue != null){
            reminderToGive = dialogFlowResult.queryResult.parameters.fields['reminderToGive'].stringValue;
        }

		
        console.log('----');
		console.log(dateTime);
        console.log(person);
		console.log(reminderToGive);
		var date_test = new Date(dateTime);
        console.log(date_test.getHours());
        
    }

    return Promise.resolve("I'm sorry, I don't understand that.");
}