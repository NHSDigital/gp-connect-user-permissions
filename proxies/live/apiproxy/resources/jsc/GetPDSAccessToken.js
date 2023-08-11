function json_tryparse(raw) {
    try {
        return JSON.parse(raw);
    }
    catch (e) {
        return raw;
    }
  }
  
  var respContent=context.getVariable('PDSAuthResponse.content');
  const respObject=json_tryparse(respContent);
  
  context.setVariable("PDSAccessToken", respObject["access_token"]);