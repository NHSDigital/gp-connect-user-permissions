var errorContent = context.getVariable("error.content");
var statusCode = context.getVariable("error.status.code") || "500";
var reasonPhrase = context.getVariable("error.reason.phrase") || "Internal Server Error";

// Check if a response is already set
var responseAlreadySet = !!context.getVariable("response.content");

// Default to not handled
context.setVariable("error.handled.in.HandleErrorContent", false);

// Helper to parse JSON safely
function tryParseJSON(str) {
  try { return JSON.parse(str); } 
  catch (e) { return null; }
}

// Only skip if a response already exists
if (responseAlreadySet) {
    context.setVariable("Error-Handled", "skipped-due-to-existing-response");
} else {
    var parsed = tryParseJSON(errorContent);
    var responseContent = null;

    // Already a FHIR OperationOutcome
    if (parsed && parsed.resourceType === "OperationOutcome") {
        responseContent = parsed;
        context.setVariable("Error-Handled", "passthrough");
    } 
    // RaiseFault or Apigee fault JSON
    else if (parsed && parsed.fault && parsed.fault.faultstring) {
        responseContent = {
            resourceType: "OperationOutcome",
            issue: [
                {
                    severity: "error",
                    code: statusCode.toString(),
                    details: {
                        coding: [
                            { code: statusCode.toString(), display: reasonPhrase }
                        ]
                    },
                    diagnostics: parsed.fault.faultstring
                }
            ]
        };
        context.setVariable("Error-Handled", "transformed-raisefault");
    } 
    // Other JSON with faultstring
    else if (parsed && parsed.faultstring) {
        responseContent = {
            resourceType: "OperationOutcome",
            issue: [
                {
                    severity: "error",
                    code: statusCode.toString(),
                    details: {
                        coding: [
                            { code: statusCode.toString(), display: reasonPhrase }
                        ]
                    },
                    diagnostics: parsed.faultstring
                }
            ]
        };
        context.setVariable("Error-Handled", "transformed-faultstring");
    } 
    // Fallback for unparsable or empty content
    else {
        responseContent = {
            resourceType: "OperationOutcome",
            issue: [
                {
                    severity: "error",
                    code: statusCode.toString(),
                    details: {
                        coding: [
                            { code: statusCode.toString(), display: reasonPhrase }
                        ]
                    },
                    diagnostics: errorContent || ""
                }
            ]
        };
        context.setVariable("Error-Handled", "fallback-empty");
    }

    // Set the response content and headers
    context.setVariable("response.content", JSON.stringify(responseContent));
    context.setVariable("response.header.Content-Type", "application/fhir+json");
    context.setVariable("response.status.code", statusCode);
    context.setVariable("response.reason.phrase", reasonPhrase);
    context.setVariable("error.handled.in.HandleErrorContent", true);
}

