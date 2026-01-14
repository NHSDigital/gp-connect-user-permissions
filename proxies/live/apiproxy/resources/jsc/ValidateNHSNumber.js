//print("nhsd.actor.nhs_number   : " + context.getVariable("nhsd.actor.nhs_number"));
//print("nhsd.subject.nhs_number : " + context.getVariable("nhsd.subject.nhs_number"));

// ---- Subject NHS number (from composite ID shared flow) ----
var subNHS = context.getVariable("nhsd.subject.nhs_number");
subNHS = String(subNHS).trim();
if (subNHS) {
    var requestNHS = null;
    var pathSuffix = context.getVariable("proxy.pathsuffix");
    if (pathSuffix) {
        var parts = pathSuffix.split('/').filter(Boolean);
        requestNHS = parts.length ? parts[parts.length - 1] : null;
        //print("NHS from route: " + requestNHS);
        requestNHS = requestNHS.trim();
        if(requestNHS) {
            if(requestNHS !== subNHS) {
                context.setVariable('trigger.raiseNHSNumberFault', true);
                var errorObject = { error: 'invalid_token', errorDescription: "NHS ID could not be validated", statusCode: 401, reasonPhrase: "Unauthorized" };
                context.setVariable('validation.errorMessage', errorObject.error);
                context.setVariable('validation.errorDescription', errorObject.errorDescription);
                context.setVariable('validation.statusCode', errorObject.statusCode);
                context.setVariable('validation.reasonPhrase', errorObject.reasonPhrase);
            }
        }
        else {
            context.setVariable('trigger.raiseNHSNumberFault', true);
            var errorObject = { error: 'invalid_token', errorDescription: "NHS ID could not be validated", statusCode: 401, reasonPhrase: "Unauthorized" };
            context.setVariable('validation.errorMessage', errorObject.error);
            context.setVariable('validation.errorDescription', errorObject.errorDescription);
            context.setVariable('validation.statusCode', errorObject.statusCode);
            context.setVariable('validation.reasonPhrase', errorObject.reasonPhrase);
        }
    }
}