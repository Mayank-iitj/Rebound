import re
from typing import List, Pattern

# Forbidden shame, loss-framing, guilt, and urgency words
FORBIDDEN_SHAME_LOSS_EN: List[str] = [
    "fail", "failure", "lazy", "weak", "guilt", "ashamed", "behind",
    "ruined", "broke your", "lost your", "last chance", "don't give up",
    "you must", "hurry", "only left", "shame", "disappointing", "zero progress"
]

FORBIDDEN_SHAME_LOSS_AR: List[str] = [
    "فشل", "كسول", "ضعيف", "ذنب", "خجل", "متأخر", "كسرت", "خسرت", "فرصة أخيرة", "عليك أن"
]

FORBIDDEN_SHAME_LOSS_HI: List[str] = [
    "विफल", "आलसी", "कमजोर", "दोष", "शर्म", "पीछे", "टूटा", "खो दिया", "आखिरी मौका"
]

# R7 Red-flag medical and mental health emergency patterns
RED_FLAG_PATTERNS: List[Pattern] = [
    re.compile(r"\b(chest\s+pain|heart\s+attack|shortness\s+of\s+breath|can't\s+breathe|severe\s+pain)\b", re.IGNORECASE),
    re.compile(r"\b(faint|fainted|loss\s+of\s+consciousness|bleeding\s+heavily|seizure)\b", re.IGNORECASE),
    re.compile(r"\b(suicid|kill\s+myself|end\s+my\s+life|self-harm|harm\s+myself|overdose)\b", re.IGNORECASE),
    re.compile(r"\b(abuse|domestic\s+violence|unsafe\s+at\s+home)\b", re.IGNORECASE),
    # Arabic red-flag phrases
    re.compile(r"(ألم\s+في\s+الصدر|ضيق\s+في\s+التنفس|إغماء|انتحار|إيذاء\s+النفس)", re.IGNORECASE),
    # Hindi red-flag phrases
    re.compile(r"(सीने\s+में\s+दर्द|सांस\s+लेने\s+में\s+तकलीफ|बेहोश|आत्महत्या|खुद\s+को\s+नुकसान)", re.IGNORECASE)
]

# Medication/dosing patterns (Rebound does not prescribe or dose)
MEDICATION_PATTERNS: List[Pattern] = [
    re.compile(r"\b(\d+\s*mg|\d+\s*ml|\d+\s*pills?|take\s+\d+\s+tablets?)\b", re.IGNORECASE),
    re.compile(r"\b(nicotine\s+patch\s+\d+|varenicline|bupropion|ozempic|metformin|aspirin|insulin)\b", re.IGNORECASE)
]
