var errorContent = context.getVariable("error.content");
var rawStatus = context.getVariable("error.status.code");
var statusCode = parseInt(rawStatus, 10) || 500;
context.setVariable("response.status.code", statusCode);
var reasonPhrase = context.getVariable("error.reason.phrase") || "Internal Server Error";

// Check if RaiseFault was triggered or a custom response already exists
var raiseFaultTriggered = context.getVariable("raisefault.failed") === true;
var responseAlreadySet = context.getVariable("response.content") !== null;

// Default to not handled
context.setVariable("error.handled.in.HandleErrorContent", false);

function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

// Skip handling if RaiseFault ran or a custom AssignMessage response is already set
if (raiseFaultTriggered || responseAlreadySet) {
  context.setVariable("response.header.X-Error-Handled", "skipped-due-to-raisefault-or-custom-response");
} else {
  var parsed = tryParseJSON(errorContent);

  // If error.content is already a valid OperationOutcome, pass it through
  if (parsed && parsed.resourceType === "OperationOutcome") {
    context.setVariable("response.content", JSON.stringify(parsed));
    context.setVariable("response.header.Content-Type", "application/json");
    context.setVariable("response.status.code", statusCode);
    context.setVariable("response.reason.phrase", reasonPhrase);
    context.setVariable("error.handled.in.HandleErrorContent", true);
    context.setVariable("Error-Handled", "passthrough");
  }

  // If error.content is a fault object, check for nested OperationOutcome
  else if (parsed) {
    var faultString = parsed.fault && parsed.fault.faultstring;
    var nested = tryParseJSON(faultString);

    // If nested OperationOutcome found, unwrap and use it
    if (nested && nested.resourceType === "OperationOutcome") {
      context.setVariable("response.content", JSON.stringify(nested));
      context.setVariable("response.header.Content-Type", "application/json");
      context.setVariable("response.status.code", statusCode);
      context.setVariable("response.reason.phrase", reasonPhrase);
      context.setVariable("error.handled.in.HandleErrorContent", true);
      context.setVariable("Error-Handled", "unwrapped-nested");
    }

    // Otherwise, wrap fault string or full object into a clean OperationOutcome
    else {
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
      context.setVariable("error.handled.in.HandleErrorContent", true);
      context.setVariable("Error-Handled", "wrapped");
    }
  }

  // If error.content is empty or invalid, return a fallback OperationOutcome with blank diagnostics
  else {
    var fallbackEmpty = {
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
          diagnostics: ""
        }
      ]
    };

    context.setVariable("response.content", JSON.stringify(fallbackEmpty));
    context.setVariable("response.header.Content-Type", "application/json");
    context.setVariable("response.status.code", statusCode);
    context.setVariable("response.reason.phrase", reasonPhrase);
    context.setVariable("error.handled.in.HandleErrorContent", true);
    context.setVariable("Error-Handled", "fallback-empty");
  }
}