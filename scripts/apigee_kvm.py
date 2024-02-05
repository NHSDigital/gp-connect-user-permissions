#!/usr/bin/env python3
"""
create_kvm.py
Usage:
  apigee_kvm (--env=<env>) (--access-token=<access-token>) [--org=<org>] delete <name>
  apigee_kvm (--env=<env>) (--access-token=<access-token>) [--org=<org>] populate-interaction-ids <name> --ods=<ods> \
--provider-endpoint=<provider-endpoint> --oauth-endpoint=<oauth-endpoint>

Options:
  -h --help                                    Show this screen.
  -t --access-token=<access-token>             Apigee access token
  --env=<env>                                  Apigee environment
  --org=<org>                                  Apigee organisation [default: nhsd-nonprod]
  --ods=<ods>                                  ODS code of the provider
  --provider-endpoint=<provider-endpoint>      Provider backend endpoint
  --oauth-endpoint=<oauth-endpoint>            Authentication server endpoint for the provider
"""
import json

import requests
from docopt import docopt


def make_interaction_ids(provider_endpoint: str, oauth_endpoint: str) -> object:
    return {
        "urn:nhs:names:services:gpconnect:fhir:operation:gpc.providerauthorizationservice": oauth_endpoint,
        "urn:nhs:names:services:gpconnect:fhir:operation:gpc.getstructuredrecord-1": provider_endpoint,
        "urn:nhs:names:services:gpconnect:documents:fhir:rest:search:patient-1": provider_endpoint,
        "urn:nhs:names:services:gpconnect:documents:fhir:rest:read:binary-1": provider_endpoint
    }


class ApigeeKvm:
    def __init__(self, env: str, access_token: str, org="nhsd-nonprod") -> None:
        self.base_kvm_url = f"https://api.enterprise.apigee.com/v1/organizations/{org}/environments/{env}/keyvaluemaps"
        self.headers = {
            "Authorization": f"Bearer {access_token}"
        }

    def get_kvm(self, kvm_name: str):
        url = f"{self.base_kvm_url}/{kvm_name}"
        res = requests.get(url, headers=self.headers)
        if res.status_code == 200:
            return res.content
        if res.status_code == 404:
            return None
        else:
            print(f"Bad response from apigee: status code: {res.status_code} content: {res.content}")
            exit(1)

    def create_kvm(self, kvm_name: str):
        url = f"{self.base_kvm_url}"
        payload = {"name": kvm_name}
        res = requests.post(url, json=payload, headers=self.headers)
        if res.status_code == 201:
            return res.content
        if res.status_code == 409:
            return self.get_kvm(kvm_name)
        else:
            print(f"Bad response from apigee: status code: {res.status_code} content: {res.content}")
            exit(1)

    def delete_kvm(self, kvm_name: str):
        url = f"{self.base_kvm_url}/{kvm_name}"
        res = requests.delete(url, headers=self.headers)
        if res.status_code == 200:
            return res.content
        if res.status_code == 404:
            # Return an empty JSON object when KVM is not found
            return b'{}'
        else:
            print(f"Bad response from apigee: status code: {res.status_code} content: {res.content}")
            exit(1)

    def get_entry(self, kvm_name: str, key: str):
        url = f"{self.base_kvm_url}/{kvm_name}/entries/{key}"
        res = requests.get(url, headers=self.headers)
        if res.status_code == 200:
            return res.content
        if res.status_code == 404:
            return None
        else:
            print(f"Bad response from apigee: status code: {res.status_code} content: {res.content}")
            exit(1)

    def replace_entry(self, kvm_name: str, key: str, value: str):
        url = f"{self.base_kvm_url}/{kvm_name}/entries"
        payload = {"name": key, "value": value}
        res = requests.post(url, json=payload, headers=self.headers)
        if res.status_code == 201:
            return res.content
        if res.status_code == 409:
            self.remove_entry(kvm_name, key)
            return self.replace_entry(kvm_name, key, value)
        else:
            print(f"Bad response from apigee: status code: {res.status_code} content: {res.content}")
            exit(1)

    def remove_entry(self, kvm_name: str, key: str):
        url = f"{self.base_kvm_url}/{kvm_name}/entries/{key}"
        res = requests.delete(url, headers=self.headers)
        if res.status_code == 200:
            return res.content
        if res.status_code == 404:
            return None
        else:
            print(f"Bad response from apigee: status code: {res.status_code} content: {res.content}")
            exit(1)

    def populate_interaction_id(self, kvm_name: str, ods: str, provider_endpoint: str, oauth_endpoint: str):
        interaction_ids = make_interaction_ids(provider_endpoint, oauth_endpoint)
        self.create_kvm(kvm_name)
        return self.replace_entry(kvm_name, ods, json.dumps(interaction_ids))


def main():
    args = docopt(__doc__)
    apigee = ApigeeKvm(env=args["--env"], access_token=args["--access-token"], org=args["--org"])

    kvm_name = args["<name>"]
    res = b""
    if args.get("delete"):
        res = apigee.delete_kvm(kvm_name)
    elif args.get("populate-interaction-ids"):
        res = apigee.populate_interaction_id(kvm_name, args["--ods"],
                                             args["--provider-endpoint"], args["--oauth-endpoint"])
    else:
        print("Operation not supported")
        exit(1)

    print(res)


if __name__ == '__main__':
    main()
