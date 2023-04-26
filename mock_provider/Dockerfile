#First Stage
FROM alpine:latest
#Installing Jq
RUN apk add jq
#Copying OAS spec file in container
COPY "gp-connect-user-permissions.json" ./
#Copyign HealthStatus OAS file in container
COPY "HealthStatusEndpoint.json" ./
#Copying whole components directory , to get inline examples and schemas
COPY ./components ./components
#Adding Health status endpoint to main spec file
RUN jq ".paths+=$(cat HealthStatusEndpoint.json)" gp-connect-user-permissions.json > updated-spec.json


#Second stage
FROM stoplight/prism:latest
#Inheriting from previous image and copying updated OAS spec file to current container
COPY --from=0  /updated-spec.json  /usr/src/prism/packages/cli/gp-connect-user-permissions/specification/gp-connect-user-permissions.json
COPY --from=0  /components  /usr/src/prism/packages/cli/gp-connect-user-permissions/specification/components

#Running command of mock with OAS file
CMD ["mock" , "-h", "0.0.0.0", "-p" ,"9000" ,"gp-connect-user-permissions/specification/gp-connect-user-permissions.json"]
