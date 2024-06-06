function json_tryparse(raw) {
  try {
      return JSON.parse(raw);
  }
  catch (e) {
      return raw;
  }
}

var respContent=context.getVariable('GPCPFSAuthResponse.content');
const respObject=json_tryparse(respContent);

context.setVariable("request.header.Authorization", "Bearer " + respObject["access_token"]);
