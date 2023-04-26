const queryString = context.getVariable("request.querystring")
const pathSuffix = context.getVariable("proxy.pathsuffix")

var endpointsContent=context.getVariable('endpoints');
const endpointsObject=JSON.parse(endpointsContent);
const endpoint=endpointsObject[context.getVariable("endpointInteractionKey")];

//Parsing hostname and pathname from given url
function parseURL(href) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        hostname: match[3],
        pathname: match[5]
    }
}

var values=parseURL(endpointsObject[context.getVariable("GPCAuthInteractionId")]);
context.setVariable("GPCAuthHostname",values["hostname"])
context.setVariable("GPCAuthHostpath",values["pathname"])

if (endpoint) {
  url = endpoint + pathSuffix
  if (queryString !== "") {
    url = url + queryString
  }
  context.setVariable("target.url", url)

} else {
  context.setVariable("endpointNotFound", true)
}


var endpointConfig=context.getVariable("private.config")
const parsedEndpointConfig = JSON.parse(endpointConfig)

Oauth2Config=parsedEndpointConfig["oauth2"]

context.setVariable("client_id_config",Oauth2Config["client_id"])
context.setVariable("kid_config",Oauth2Config["kid"])
context.setVariable("audience_config",Oauth2Config["audience"])
context.setVariable("subject_issuer_config",Oauth2Config["subject_issuer"])


