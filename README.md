# ChatFuel to DialogFlow Runkit Endpoint
Use this script to connect your ChatFuel bot to DialogFlow.

## Instructions
Create a JSON API card in ChatFuel and paste the endpoint ink in.

Pass the `queryString` user attribute.

Create an environment variable in RunKit called `API_AI_KEY` with your DialogFlow "client access token" as the value. It will look like this `86a437d748aa4a8aca126487efafe427`.

Then DialogFlow will send back text responses and any custom payloads as documented in the [ChatFuel JSON docs](http://docs.chatfuel.com/plugins/plugin-documentation/json-api).

---

See this [on RunKit](https://runkit.com/phocks/chatfuel-to-dialogflow-endpoint).