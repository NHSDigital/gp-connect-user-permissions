function json_tryparse(raw) {
    try {
        return JSON.parse(raw);
    }
    catch (e) {
        return raw;
    }
}

var respContent=context.getVariable('PDSResponse.content');
const respObject=json_tryparse(respContent);
var ods = respObject["generalPractitioner"][0]["identifier"]["value"]

var interactionId = context.getVariable("request.header.Interaction-ID")
var endpointConfigEncryptedKey= ods + "_private_key"

context.setVariable("endpointODSKey", ods);
context.setVariable("endpointInteractionKey", interactionId)
context.setVariable("endpointConfigEncryptedKey", endpointConfigEncryptedKey)

var GPCAuthInteractionId = properties.GPCAuthInteractionId

context.setVariable("GPCAuthInteractionId", GPCAuthInteractionId)