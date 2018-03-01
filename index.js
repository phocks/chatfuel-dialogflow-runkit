const URL = require("url"); // Built in library
const API_AI = require("apiai-promise"); // DialogFlow v1 library (Promise version)
const polly = require("polly-js"); // A request retry library

const { API_AI_KEY } = process.env; // Load key from secure environment variables
const DEFAULT_APP = API_AI_KEY ? API_AI(API_AI_KEY) : null;

// Some constants
const RETRY_ATTEMPTS = 3;
const MAX_QUERY_STRING_LENGTH = 255;

// Define the endpoint. This is run every HTTP request
exports.endpoint = function(req, res) {
  let query = URL.parse(req.url, true).query; // Get query string if any from ChatFuel etc
  let app = query.API_AI_KEY ? API_AI(query.API_AI_KEY) : DEFAULT_APP; // Create app with API key

  // Generate new random session ID if not passed one in the query
  // We can use this to keep track of sessions
  let newSessionId =
    !query.DF_SESSION_ID || query.DF_SESSION_ID === "0"
      ? Math.random()
          .toString()
          .slice(2)
      : 0;

  let sessionId =
    query.DF_SESSION_ID && query.DF_SESSION_ID != "0"
      ? query.DF_SESSION_ID
      : newSessionId;

  let contexts = [
    {
      name: query.DF_CONTEXT || "DEFAULT",
      parameters: query
    }
  ];

  let queryStringToSend = "";

  // DialogFlow can only string less than 255 characters
  if (query.queryString.length > MAX_QUERY_STRING_LENGTH) {
    queryStringToSend = query.queryString.substring(0, MAX_QUERY_STRING_LENGTH);
  } else {
    queryStringToSend = query.queryString;
  }

  // Use polly to retry DialogFlow requests until one works or else send error
  polly()
    .retry(RETRY_ATTEMPTS)
    .executeForPromise(function() {
      return app.textRequest(queryStringToSend, {
        sessionId,
        contexts
      });
    })
    .then(handleResponse(res), handleError(res));
};

function sendResponse({ response, message }) {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(message));
}

function createTextMsg(text) {
  return { messages: [{ text }] };
}

function handleResponse(response) {
  return function({ result, sessionId }) {
    console.log(result);
    // Deal with custom payloads if there is one
    let messages = result.fulfillment.messages;
    let customPayload = messages.find(message => message.type === 4);

    // If there is a custom payload send that back to ChatFuel
    if (customPayload) {
      let message = customPayload.payload;

      // Check if there are already custom messages
      if (message.messages) {
        // If so then push any text responses from DialogFlow
        message.messages.push({
          text: result.fulfillment.speech
        });
      } else {
        // Otherwise it's the only one
        message.messages = [{ text: result.fulfillment.speech }];
      }

      message.set_attributes = Object.assign(message.set_attributes || {}, {
        DF_SESSION_ID: sessionId
      });

      sendResponse({ response, message });
    } else {
      let message = createTextMsg(result.fulfillment.speech);

      message.set_attributes = Object.assign(message.set_attributes || {}, {
        DF_SESSION_ID: sessionId
      });
      sendResponse({ response, message });
    }
  };
}

function handleError(response) {
  return function(error) {
    console.log("Failed " + RETRY_ATTEMPTS + " retries...");
    console.log(error);
    let message = createTextMsg("There was an error...");
    sendResponse({ response, message });
  };
}
