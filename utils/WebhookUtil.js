const fetch = require("node-fetch");
const key = "d7ZZwtJEFIa9L2IgWl9vFwuCNbql7v4J4eAgO7oQRJv";

exports.makeRequest = async (webhookName) => {

    const response = await fetch(`https://maker.ifttt.com/trigger/${webhookName}/with/key/${key}`);

    if (response.ok) {
        return Promise.resolve();
    }

    console.log("Error. Response code: " + response.status);

    return Promise.reject();
}