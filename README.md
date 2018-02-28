# ChatFuel to DialogFlow Runkit Endpoint
Use this script to connect your ChatFuel bot to DialogFlow.

## Instructions
Create a JSON API card in ChatFuel and paste the endpoint link in (ie. in the default response block or somewhere useful).

Pass the `queryString` user attribute which can be set beforehand with "Setup user attribute" and `{{ last user freeform input }}` or a "User input" with no message to user.

Create an environment variable in RunKit called `API_AI_KEY` with your DialogFlow "client access token" as the value. It will look like this `86a437d748aa4a8aca126487efafe427`.

Then DialogFlow will send back text responses and any custom payloads as documented in the [ChatFuel JSON docs](http://docs.chatfuel.com/plugins/plugin-documentation/json-api).

---

See this [on RunKit](https://runkit.com/phocks/chatfuel-to-dialogflow-endpoint).
