"""Send a one-off Resend test email to an address entered by the operator.

Run from the backend directory with `python -m scripts.check_email`.
The recipient is prompted interactively and is never written to a file.
"""

import asyncio
import re

from app.services.notification_service import send_email


async def main() -> int:
    recipient = input("Email address for a Resend test (blank cancels): ").strip()
    if not recipient:
        print("Cancelled; no email was sent.")
        return 1
    if len(recipient) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", recipient):
        print("Invalid email address; no email was sent.")
        return 1

    accepted = await send_email(
        recipient,
        "there",
        "Wazifny Resend delivery test",
        "<p>This is a test email from the Wazifny backend.</p>",
    )
    if not accepted:
        print("Email was NOT accepted by Resend. Check the backend log for the exact failure.")
        return 1

    print("Email sent successfully: Resend accepted the test message.")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
