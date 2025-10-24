var errorContent = context.getVariable("error.content");
var statusCode = context.getVariable("error.status.code") || "500";
var reasonPhrase = context.getVariable("error.reason.phrase") || "Internal Server Error";

context.setVariable("error.handled", false);

function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

var parsed = tryParseJSON(errorContent);

// If error.content is already a valid OperationOutcome, use it directly
if (parsed && parsed.resourceType === "OperationOutcome") {
  context.setVariable("response.content", JSON.stringify(parsed));
  context.setVariable("response.header.Content-Type", "application/json");
  context.setVariable("response.status.code", statusCode);
  context.setVariable("response.reason.phrase", reasonPhrase);
  context.setVariable("error.handled", true);
  context.setVariable("response.header.X-Error-Handled", "passthrough");
} else if (parsed) {
  // Check if fault.faultstring contains a stringified OperationOutcome
  var faultString = parsed.fault?.faultstring;
  var nested = tryParseJSON(faultString);

  if (nested && nested.resourceType === "OperationOutcome") {
    // Use the nested OperationOutcome directly
    context.setVariable("response.content", JSON.stringify(nested));
    context.setVariable("response.header.Content-Type", "application/json");
    context.setVariable("response.status.code", statusCode);
    context.setVariable("response.reason.phrase", reasonPhrase);
    context.setVariable("error.handled", true);
    context.setVariable("response.header.X-Error-Handled", "unwrapped-nested");
  } else {
    // Build a clean OperationOutcome using fault.faultstring or full parsed object
    var diagnostics = faultString || JSON.stringify(parsed);

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
          diagnostics: diagnostics
        }
      ]
    };

    context.setVariable("response.content", JSON.stringify(fallback));
    context.setVariable("response.header.Content-Type", "application/json");
    context.setVariable("response.status.code", statusCode);
    context.setVariable("response.reason.phrase", reasonPhrase);
    context.setVariable("error.handled", true);
    context.setVariable("response.header.X-Error-Handled", "wrapped");
  }
}
// If error.content is not valid JSON, leave error.handled = false
