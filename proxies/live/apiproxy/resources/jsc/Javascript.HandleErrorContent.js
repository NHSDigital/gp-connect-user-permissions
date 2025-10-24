// Get error content and status info
var errorContent = context.getVariable("error.content");
var statusCode = context.getVariable("error.status.code") || "500";
var reasonPhrase = context.getVariable("error.reason.phrase") || "Internal Server Error";

try {
  var parsed = JSON.parse(errorContent);

  // Already a valid FHIR OperationOutcome — use as-is
  if (parsed.resourceType === "OperationOutcome") {
    context.setVariable("response.content", JSON.stringify(parsed));
    context.setVariable("response.header.Content-Type", "application/json");
    context.setVariable("response.status.code", statusCode);
    context.setVariable("response.reason.phrase", reasonPhrase);
    context.setVariable("error.handled", true);
    context.setVariable("response.header.X-Error-Handled", "passthrough");
    return;
  }
} catch (e) {
  // Not valid JSON — fall through to wrap
}

// Wrap raw fault JSON in OperationOutcome
var fallback = {
  resourceType: "OperationOutcome",
  issue: [
    {
      severity: "error",
      code: statusCode,
      details: {
        coding: [
          {
            code: statusCode,
            display: reasonPhrase
          }
        ]
      },
      diagnostics: errorContent
    }
  ]
};

context.setVariable("response.content", JSON.stringify(fallback));
context.setVariable("response.header.Content-Type", "application/json");
context.setVariable("response.status.code", statusCode);
context.setVariable("response.reason.phrase", reasonPhrase);
context.setVariable("error.handled", true);
context.setVariable("response.header.X-Error-Handled", "wrapped");
