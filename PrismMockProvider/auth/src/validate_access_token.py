import logging
import requests
import re
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def validate_access_token(keycloak_env: str, client_id: str, client_secret: str, incoming_token: str) -> bool:
    """
    Get the introspection endpoint from the Keycloak realm's discovery document and validate an access token against it.
    """
    # Extract just the token value from the header
    token = re.sub(r"Bearer\s|Basic\s", "", incoming_token)

    # Get the introspection endpoint from the Keycloak discovery doc
    discovery_url = f"https://identity.ptl.api.platform.nhs.uk/" \
        f"auth/realms/gpconnect-pfs-mock-{keycloak_env}/.well-known/uma2-configuration"
    discovery = requests.get(discovery_url).json()
    introspection_endpoint = discovery.get('introspection_endpoint')

    # Get an Access Token for the realm using the client_id and client_secret
    validation_response = requests.post(
        introspection_endpoint,
        auth=(client_id, client_secret),
        data={
            'token_type_hint': 'requesting_party_token',
            'token': token
        }
    ).json()

    return validation_response.get("active") or False


def handler(event, _context):
    access_token = event.get("headers").get("authorization")
    is_valid = validate_access_token(
        os.getenv("keycloak_environment"),
        os.getenv("client_id"),
        os.getenv("client_secret"),
        access_token
    )

    return {
        "isAuthorized": is_valid,
        "context": {
            "is_valid": is_valid,
            "environment": os.getenv("keycloak_environment"),
            "client_id": os.getenv("client_id"),
            "access_token": access_token,
            "gpc": event.get("headers").get("gpc-authorization")
        }
    }
