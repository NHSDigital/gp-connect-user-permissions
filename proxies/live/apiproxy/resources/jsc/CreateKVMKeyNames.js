var ods = context.getVariable("jwt.DecodeJWT.DecodeIDToken.claim.ods_code")
var interactionId = context.getVariable("request.header.Interaction-ID")

var endpointConfigEncryptedKey= ods + "_private_key"


context.setVariable("endpointInteractionKey", interactionId)
context.setVariable("endpointODSKey", ods)
context.setVariable("endpointConfigEncryptedKey", endpointConfigEncryptedKey)

var GPCAuthInteractionId = properties.GPCAuthInteractionId

context.setVariable("GPCAuthInteractionId", GPCAuthInteractionId)