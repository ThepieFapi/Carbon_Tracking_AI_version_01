import re

URL_REGEX = "^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z\
0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$"


def is_valid_url(url: str) -> bool:
    """
    Check that the URL provided is valid

    Args:
        url: URL to test
    Returns:
        True if the URL is valid, False otherwise
    """
    regex = re.compile(URL_REGEX)
    return bool(regex.match(url))
