"""
Data Guardrail & QC Inspector for ONE FOR ALL (little-ong)
Enforces ABSOLUTE ZERO MOCKUP POLICY:
- Rejects any mock, dummy, synthetic, or placeholder URLs/names before saving or serving.
"""

import re
from typing import Dict, Any, List, Tuple

FORBIDDEN_MOCK_PATTERNS = [
    r"\bexample\.com\b",
    r"\btest\.com\b",
    r"\bdummy\b",
    r"\bmock\b",
    r"\bfaker\b",
    r"\blorem\s+ipsum\b",
    r"\bsample-app\b",
    r"\bplaceholder\b",
    r"127\.0\.0\.1:0000",
    r"0\.0\.0\.0:0000",
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in FORBIDDEN_MOCK_PATTERNS]


class MockupViolationError(ValueError):
    """Raised when a record contains forbidden mockup or dummy signatures."""
    pass


def validate_application_payload(payload: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Inspects an application dictionary for any mockup signatures or invalid fields.
    Returns (is_valid, error_message).
    """
    name = str(payload.get("name") or "").strip()
    if not name:
        return False, "กรุณาระบุชื่อโปรเจกต์ / แอปพลิเคชัน (ห้ามเว้นว่าง)"

    full_url = str(payload.get("full_url") or "").strip()
    intranet_url = str(payload.get("intranet_url") or "").strip()
    cloud_url = str(payload.get("cloud_url") or "").strip()

    if not (full_url or intranet_url or cloud_url):
        return False, "กรุณาระบุ URL หรือ IP:Port จริงอย่างน้อย 1 รายการ"

    fields_to_check = [
        name,
        str(payload.get("description") or ""),
        full_url,
        intranet_url,
        cloud_url,
        str(payload.get("host_or_url") or ""),
    ]

    combined_text = " | ".join(fields_to_check)
    for pattern in COMPILED_PATTERNS:
        if pattern.search(combined_text):
            return False, f"Data Guardrail ปฏิเสธข้อมูล: ตรวจพบรูปแบบข้อมูลจำลอง (Mockup Signature: {pattern.pattern}) ซึ่งขัดต่อ Zero Mockup Policy"

    return True, "OK"


def filter_verified_records(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Filters out any record that fails Data Guardrail inspection before sending to client."""
    clean_list = []
    for rec in records:
        ok, _ = validate_application_payload(rec)
        if ok:
            clean_list.append(rec)
    return clean_list
