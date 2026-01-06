print("nhsd.actor.nhs_number NUM   : " + context.getVariable("nhsd.actor.nhs_number"));
print("nhsd.subject.nhs_number NUM   : " + context.getVariable("nhsd.subject.nhs_number"));

var httpverb = context.getVariable("request.verb");
var actorNHS = context.getVariable("nhsd.actor.nhs_number");
if (httpverb == 'GET') {
    var queryNHSNumber = context.getVariable("request.queryparam.patientNHSNumber");
    print("queryNHSNumber :" +queryNHSNumber);
    if (queryNHSNumber) {
        if (queryNHSNumber !== actorNHS) {
            print("NHS Number is not valid");
        }
    }
    else {
        var routeParamArray = context.getVariable("proxy.pathsuffix").split('/');
        var routeNHSNumber = routeParamArray[routeParamArray.length - 1];
        print("routeNHSNumber :" +routeNHSNumber);
        if (routeNHSNumber && routeNHSNumber !== actorNHS){
            print("NHS Number is not valid");
        }    
    }
}
else {
    if(httpverb == 'POST') {
        var reqContent = context.getVariable("request.content");
        var jsonContent = JSON.parse(reqContent);
        var postNHSnumber = null;
        for (var i = 0; i < jsonContent.parameter.length; i++) {
            var p = jsonContent.parameter[i];
            if ( p.name === "patientNHSNumber" && p.valueIdentifier && p.valueIdentifier.value) {
                postNHSnumber = p.valueIdentifier.value;
                break;
            }
        }
        print("postNHSnumber :" +postNHSnumber);
        if (postNHSnumber && postNHSnumber !== actorNHS){
            print("NHS Number is not valid");
        }
    }
}