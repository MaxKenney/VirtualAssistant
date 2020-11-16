const { default: wordsToNumbers } = require("words-to-numbers");
const { query } = require("express");

exports.execute = async (intent, dialogFlowResult, deviceData) => {

    const queryParams = dialogFlowResult.queryResult.parameters;
    const fulfillmentText = dialogFlowResult.queryResult.fulfillmentText;
    const queryText = dialogFlowResult.queryResult.queryText;
    const audioFile = dialogFlowResult.outputAudio;

    let outputText;


    operators = {
        "+": ["+", "plus", "add","addition"],
        "-": ["-", "take away", "takeaway", "minus", "subtract", "subtraction"],
        "/": ["/", "divide","divided", "division"],
        "*": ["*", "times", "multiplied", "x"],
    }


    if (intent === "maths.Calculate") {
        var words = wordsToNumbers(queryText.toLowerCase()).split(' ');

        //Go through each 'word' in query, 
        //Remove if it is not a part of equation
        for (var i = 0; i < words.length; i++) {
            var removeWord = true;
            for(operatorCharacter in operators){
                if(operators[operatorCharacter].includes(words[i])){
                    words[i] = operatorCharacter;
                    removeWord = false;
                }
            }
            if(removeWord && isNaN(words[i])){
                words.splice(i, 1);
                i--;
            }
        }
        outputText = eval(words.join('')).toString();
    }
    
    if (outputText != null) {
        return Promise.resolve({
            responseText: outputText,
            audioFile: audioFile
        });
    }

    return Promise.reject("I'm sorry, I don't understand that.");
}

