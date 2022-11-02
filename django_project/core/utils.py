"""Global utils."""


def string_is_true(string: str):
    """Return is true or false of string contains true like string."""
    return str(string).lower() in ['y', 'yes', 't', 'true', 'ok', True]
