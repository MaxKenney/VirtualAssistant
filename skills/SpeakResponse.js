const fetch = require("node-fetch");
const webhookUtil = require("../utils/WebhookUtil");

exports.execute = async (intent, dialogFlowResult, deviceData) => {
    const outputText = dialogFlowResult.queryResult.fulfillmentText;
    return Promise.resolve(outputText);
}