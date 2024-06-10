# import os
# from urllib.parse import parse_qs, urlparse

# import pytest
# import requests
# from lxml import html

# """
# This test is for int environment targeting OUR mock-provider
# """


# @pytest.fixture()
# def nhs_login_mock_token():
#     apigee_env = os.getenv("APIGEE_ENVIRONMENT")
#     client_id = os.getenv("DEFAULT_CLIENT_ID")
#     client_secret = os.getenv("DEFAULT_CLIENT_SECRET")
#     if not client_id or not client_secret:
#         raise RuntimeError("Both DEFAULT_CLIENT_ID and DEFAULT_CLIENT_SECRET environment variables has to be present")
#     callback_url = os.getenv("DEFAULT_CALLBACK_URL", "https://oauth.pstmn.io/v1/callback")
#     username = os.getenv("DEFAULT_USERNAME", "testuser")

#     auth_data = {
#         "username": username,
#         "client_id": client_id,
#         "client_secret": client_secret,
#         "callback_url": callback_url,
#         "scope": "nhs-login"
#     }
#     auth = IntNhsLoginMockAuth(apigee_env, auth_data)

#     return auth.get_token()


# class IntNhsLoginMockAuth:

#     def __init__(self, apigee_env, auth_data: dict) -> None:
#         self.auth_data = auth_data
#         base_url = f"https://{apigee_env}.api.service.nhs.uk/oauth2-mock"
#         self.auth_url = f"{base_url}/authorize"
#         self.token_url = f"{base_url}/token"

#     @staticmethod
#     def extract_code(response) -> str:
#         qs = urlparse(
#             response.history[-1].headers["Location"]
#         ).query
#         auth_code = parse_qs(qs)["code"]
#         if isinstance(auth_code, list):
#             # in case there's multiple, this was a bug at one stage
#             auth_code = auth_code[0]

#         return auth_code

#     @staticmethod
#     def extract_form_url(response) -> str:
#         html_str = response.content.decode()
#         tree = html.fromstring(html_str)
#         authorize_form = tree.forms[0]

#         return authorize_form.action

#     def get_token(self) -> str:
#         login_session = requests.session()

#         client_id = self.auth_data["client_id"]
#         client_secret = self.auth_data["client_secret"]
#         callback_url = self.auth_data["callback_url"]
#         scope = self.auth_data["scope"]
#         username = self.auth_data["username"]

#         # Step1: login page
#         authorize_resp = login_session.get(
#             self.auth_url,
#             params={
#                 "client_id": client_id,
#                 "redirect_uri": callback_url,
#                 "response_type": "code",
#                 "scope": scope,
#                 "state": "1234567890",
#             },
#         )

#         # Step2: Submit login form
#         form_action_url = self.extract_form_url(authorize_resp)
#         form_submission_data = {"username": username}
#         code_resp = login_session.post(url=form_action_url, data=form_submission_data)

#         # Step3: extract code form redirect
#         auth_code = self.extract_code(code_resp)

#         # Step4: Post the code to get access token
#         token_resp = login_session.post(
#             self.token_url,
#             data={
#                 "grant_type": "authorization_code",
#                 "code": auth_code,
#                 "redirect_uri": callback_url,
#                 "client_id": client_id,
#                 "client_secret": client_secret,
#             },
#         )

#         return token_resp.json()["access_token"]


# @pytest.mark.mock_provider_int
# def test_mock_provider_int_happy_path(nhs_login_mock_token):
#     headers = {
#         "Authorization": f"Bearer {nhs_login_mock_token}",
#         "X-Request-ID": "60E0B220-8136-4CA5-AE46-1D97EF59D068",
#     }
#     base_path = os.getenv("SERVICE_BASE_PATH")
#     apigee_env = os.getenv("APIGEE_ENVIRONMENT")

#     url = f"https://{apigee_env}.api.service.nhs.uk/{base_path}"
#     resp = requests.get(f"{url}/Patient/9000000009", headers=headers)

#     assert resp.status_code == 200
