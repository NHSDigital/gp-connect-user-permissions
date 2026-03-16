var errorContent = context.getVariable("error.content");
var statusCode = context.getVariable("error.status.code") || "500";
var reasonPhrase = context.getVariable("error.reason.phrase") || "Internal Server Error";

// Default to not handled
context.setVariable("error.handled.in.HandleErrorContent", false);

// ---Safely parse JSON ---
function tryParseJSON(str) {
  try { return JSON.parse(str); }
  catch (e) { return null; }
}

// --- Parse error content ---
var parsed = tryParseJSON(errorContent);
var responseContent;

// --- Already a FHIR OperationOutcome ---
if (parsed && parsed.resourceType === "OperationOutcome") {
    responseContent = parsed;
    context.setVariable("Error-Handled", "passthrough");
}

// --- For Body buffer overflow ---
else if (parsed && parsed.fault && parsed.fault.faultstring === "Body buffer overflow") {
    error.status.code = "400"
    responseContent = {
        resourceType: "OperationOutcome",
        issue: [
            {
                severity: "error",
                code: "processing",
                details: {
                    coding: [{ system: "https://fhir.nhs.uk/R4/CodeSystem/Spine-ErrorOrWarningCode", code: "BAD_GATEWAY_BUFFER_OVERFLOW", display: "Response body exceeded buffer limit" }]
                },
                diagnostics: "Body buffer overflow: response exceeded 10MB limit"
            }
        ]
    };
    context.setVariable("Error-Handled", "transformed-raisefault");

}

// --- Apigee RaiseFault / ServiceCallout format ---
else if (parsed && parsed.fault && parsed.fault.faultstring) {
    responseContent = {
        resourceType: "OperationOutcome",
        issue: [
            {
                severity: "error",
                code: "exception",
                details: {
                    coding: [{ system: "https://fhir.nhs.uk/R4/CodeSystem/Spine-ErrorOrWarningCode", code: statusCode.toString(), display: reasonPhrase }]
                },
                diagnostics: parsed.fault.faultstring
            }
        ]
    };
    context.setVariable("Error-Handled", "transformed-raisefault");

}

// --- Other JSON with faultstring ---
else if (parsed && parsed.faultstring) {
    responseContent = {
        resourceType: "OperationOutcome",
        issue: [
            {
                severity: "error",
                code: "exception",
                details: {
                    coding: [{ system: "https://fhir.nhs.uk/R4/CodeSystem/Spine-ErrorOrWarningCode", code: statusCode.toString(), display: reasonPhrase }]
                },
                diagnostics: parsed.faultstring
            }
        ]
    };
    context.setVariable("Error-Handled", "transformed-faultstring");
}

// --- Fallback for non-JSON or empty content ---
else {
    responseContent = {
        resourceType: "OperationOutcome",
        issue: [
            {
                severity: "error",
                code: "exception",
                details: {
                    coding: [{ system: "https://fhir.nhs.uk/R4/CodeSystem/Spine-ErrorOrWarningCode", code: statusCode.toString(), display: reasonPhrase }]
                },
                diagnostics: errorContent || ""
            }
        ]
    };
    context.setVariable("Error-Handled", "fallback-empty");
}

    context.setVariable("handled.error.output", JSON.stringify(responseContent));
    context.setVariable("handleErrorSucceeded", true);
    context.setVariable("response.header.Content-Type", "application/fhir+json");
    context.setVariable("response.status.code", statusCode);
    context.setVariable("response.reason.phrase", reasonPhrase);
    context.setVariable("error.handled.in.HandleErrorContent", true);
