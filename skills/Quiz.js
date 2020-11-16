const format = require('string-format');
const FirebaseApp = require("../utils/FirebaseApp");
const mathTestServiceAccount = require("../firebaseServiceAccounts/mathtest.json");
const firebaseUrl = "https://mathtest-b4c39.firebaseio.com";

exports.execute = async (intent, dialogFlowResult, deviceData) => {

    const queryParams = dialogFlowResult.queryResult.parameters;
    const fulfillmentText = dialogFlowResult.queryResult.fulfillmentText;

    let outputText;

    if (intent === "quiz.math.start") {
        const num1 = getRandomNumberBetween(11, 99);
        const num2 = getRandomNumberBetween(11, 99);

        const firebaseApp = new FirebaseApp(mathTestServiceAccount, firebaseUrl);
        firebaseApp.set("virtualAssistant/context", { num1: num1, num2: num2, operator: "x" });

        outputText = format(fulfillmentText, num1, num2);
    }
    else if (intent === "quiz.math.start - context:answer-check") {
        const firebaseApp = new FirebaseApp(mathTestServiceAccount, firebaseUrl);
        const snapshot = await firebaseApp.get("virtualAssistant/context");
        const previousContext = snapshot.val();
        const answer = previousContext["num1"] * previousContext["num2"];
        const userAnswer = getUserAnswer(queryParams);

        if(userAnswer == answer) {
            outputText = format(fulfillmentText, "Yes", "right");
        }
        else {
            outputText = format(fulfillmentText, "Nope", `not right. The answer was ${answer}`);
        }

        // TODO: SUBMIT ANSWER DETAILS TO FIREBASE
    }

    if (outputText != null) {
        return Promise.resolve(outputText);
    }

    return Promise.reject("I'm sorry, I don't understand that.");
}

function getUserAnswer(queryParams) {
    return queryParams.fields.number.numberValue;
}

function getRandomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}