  var respContent=context.getVariable('GPCAuthResponse.content');
  const respObject=JSON.parse(respContent);
  
  context.setVariable("request.header.Authorization", respObject["access_token"]);
  