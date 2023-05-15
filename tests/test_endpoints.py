"""
See
https://github.com/NHSDigital/pytest-nhsd-apim/blob/main/tests/test_examples.py
for more ideas on how to test the authorization of your API.
"""
import logging
import requests
import pytest
import os
from os import getenv


@pytest.fixture()
def proxy_url():
    base_path = os.getenv("SERVICE_BASE_PATH")
    apigee_env = os.getenv("APIGEE_ENVIRONMENT")

    return f"https://{apigee_env}.api.service.nhs.uk/{base_path}"


@pytest.mark.smoketest
def test_ping(proxy_url):
    resp = requests.get(f"{proxy_url}/_ping")
    assert resp.status_code == 200


@pytest.mark.smoketest
def test_wait_for_ping(proxy_url):
    retries = 0
    resp = requests.get(f"{proxy_url}/_ping")
    deployed_commitId = resp.json().get("commitId")
    while (deployed_commitId != getenv('SOURCE_COMMIT_ID')
           and retries <= 30
           and resp.status_code == 200):
        resp = requests.get(f"{proxy_url}/_ping")
        deployed_commitId = resp.json().get("commitId")
        retries += 1
        logging.warning(f"Expected commit id {getenv('SOURCE_COMMIT_ID')} but was {deployed_commitId}, retrying")
    if resp.status_code != 200:
        pytest.fail(f"Status code {resp.status_code}, expecting 200")
    elif retries >= 30:
        pytest.fail("Timeout Error - max retries")
    assert deployed_commitId == getenv('SOURCE_COMMIT_ID')


@pytest.mark.smoketest
def test_status(proxy_url):
    resp = requests.get(
        f"{proxy_url}/_status", headers={"apikey": os.getenv("STATUS_ENDPOINT_API_KEY")}
    )
    assert resp.status_code == 200
    # Make some additional assertions about your status response here!


@pytest.mark.smoketest
def test_wait_for_status(proxy_url):
    retries = 0
    resp = requests.get(f"{proxy_url}/_status", headers={"apikey": os.getenv("STATUS_ENDPOINT_API_KEY")})
    deployed_commitId = resp.json().get("commitId")
    while (deployed_commitId != getenv('SOURCE_COMMIT_ID')
           and retries <= 30
           and resp.status_code == 200
           and resp.json().get("version")):
        resp = requests.get(f"{proxy_url}/_status", headers={"apikey": os.getenv("STATUS_ENDPOINT_API_KEY")})
        deployed_commitId = resp.json().get("commitId")
        retries += 1
        logging.warning(f"Expected commit id {getenv('SOURCE_COMMIT_ID')} but was {deployed_commitId}, retrying")
    if resp.status_code != 200:
        pytest.fail(f"Status code {resp.status_code}, expecting 200")
    elif retries >= 30:
        pytest.fail("Timeout Error - max retries")
    elif not resp.json().get("version"):
        pytest.fail("version not found")
    assert deployed_commitId == getenv('SOURCE_COMMIT_ID')


@pytest.mark.auth
@pytest.mark.integration
@pytest.mark.user_restricted_separate_nhs_login
@pytest.mark.nhsd_apim_authorization({"access": "application", "level": "level0"})
def test_auth_level0(nhsd_apim_proxy_url, nhsd_apim_auth_headers):
    headers = {"Interaction-ID": "urn:nhs:names:services:gpconnect:fhir:operation:gpc.getstructuredrecord-1"}
    headers.update(nhsd_apim_auth_headers)
    resp = requests.get(f"{nhsd_apim_proxy_url}/Patient/9000000009", headers=headers)
    assert resp.status_code == 401


@pytest.mark.auth
@pytest.mark.integration
@pytest.mark.nhsd_apim_authorization(
    {
        "access": "patient",
        "level": "P9",
        "login_form": {"username": "9912003071"}
    }
)
def test_nhs_login_p9(nhsd_apim_proxy_url, nhsd_apim_auth_headers):
    headers = {
        "Interaction-ID": "urn:nhs:names:services:gpconnect:fhir:operation:gpc.getstructuredrecord-1",
        "accept": "*/*",
        "X-Correlation-ID": "11C46F5F-CDEF-4865-94B2-0EE0EDCC26DA",
        "X-Request-ID": "60E0B220-8136-4CA5-AE46-1D97EF59D068"
    }
    headers.update(nhsd_apim_auth_headers)

    resp = requests.get(
        f"{nhsd_apim_proxy_url}/Patient/9000000009",
        headers=headers
    )
    assert resp.status_code == 200
