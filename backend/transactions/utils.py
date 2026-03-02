import secrets


def generate_token(length: int = 20) -> str:
    """
    Generate a cryptographically secure numeric token.
    Format: XXXXX-XXXXX-XXXXX-XXXXX (20 digits, grouped for readability)
    """
    digits = "".join(secrets.choice("0123456789") for _ in range(length))
    # Group into blocks of 5: XXXXX-XXXXX-XXXXX-XXXXX
    return "-".join(digits[i:i+5] for i in range(0, length, 5))


def generate_unique_token(model, field: str = "token_generated", max_attempts: int = 10) -> str:
    """
    Generate a token guaranteed to be unique in the database.
    
    Usage:
        token = generate_unique_token(TokenPurchase)
    """
    for _ in range(max_attempts):
        token = generate_token()
        if not model.objects.filter(**{field: token}).exists():
            return token
    raise RuntimeError("Failed to generate a unique token after maximum attempts.")