function json_tryparse(raw) {
    try {
        return JSON.parse(raw);
    }
    catch (e) {
        return raw;
    }
  }
  
  var respContent=context.getVariable('GPCAuthResponse.content');
  const respObject=json_tryparse(respContent);
  
  context.setVariable("request.header.Authorization", respObject["access_token"]);
  