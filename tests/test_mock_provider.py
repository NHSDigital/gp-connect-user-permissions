import pytest
import requests


@pytest.mark.smoketest
@pytest.mark.auth
@pytest.mark.integration
@pytest.mark.user_restricted_separate_nhs_login
@pytest.mark.nhsd_apim_authorization({"access": "patient", "level": "P9", "login_form": {"username": "9449305552"}})
def test_mock_receiver_patient_record_path(nhsd_apim_proxy_url, nhsd_apim_auth_headers):
    headers = {
        "X-Request-ID": "60E0B220-8136-4CA5-AE46-1D97EF59D068",
        "accept": "*/*",
        "X-Correlation-ID": "11C46F5F-CDEF-4865-94B2-0EE0EDCC26DA"
    }
    headers.update(nhsd_apim_auth_headers)

    headers.update(nhsd_apim_auth_headers)
    resp = requests.get(
        f"{nhsd_apim_proxy_url}/Patient/9000000009",
        headers=headers
    )
    assert resp.status_code == 200
