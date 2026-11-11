import hashlib
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any

_last_hash: bytes = b"0" * 32

def record_audit_entry(
    db_session,
    action: str,
    subject_user_id: Optional[str] = None,
    actor_id: Optional[str] = None,
    actor_role: str = "user",
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    global _last_hash
    ts = datetime.now(timezone.utc).isoformat()
    canonical_payload = {
        "action": action,
        "subject_user_id": subject_user_id,
        "actor_id": actor_id or subject_user_id,
        "actor_role": actor_role,
        "details": details or {},
        "ts": ts,
        "prev_hash": _last_hash.hex()
    }
    raw_str = json.dumps(canonical_payload, sort_keys=True)
    new_hash = hashlib.sha256(_last_hash + raw_str.encode("utf-8")).digest()
    _last_hash = new_hash

    entry = {
        "action": action,
        "subject_user_id": subject_user_id,
        "actor_id": actor_id or subject_user_id,
        "actor_role": actor_role,
        "details": details or {},
        "ts": ts,
        "prev_hash": canonical_payload["prev_hash"],
        "hash": new_hash.hex()
    }
    # If db_session has audit log table insertion or memory store, store it
    return entry
