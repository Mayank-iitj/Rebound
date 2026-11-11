import re
from typing import Dict, Any, List, Optional
from rebound.policy.governor_rules import evaluate_governor

BARRIER_TAXONOMY = [
    "TIME", "ENERGY", "MOOD", "PAIN_ILLNESS", "TRAVEL", "FAMILY_CARE",
    "WEATHER_HEAT", "SHIFT_WORK", "ACCESS_FACILITIES_FOOD", "COST",
    "FORGOT", "MOTIVATION", "SOCIAL_PRESSURE", "OTHER"
]

BARRIER_KEYWORDS = {
    "SHIFT_WORK": ["shift", "night", "rotation", "swap", "hospital", "nurse", "مناوبة", "ليلي", "शिफ्ट"],
    "WEATHER_HEAT": ["heat", "hot", "sun", "humid", "weather", "summer", "حرارة", "شمس", "حر", "गर्मी", "धूप"],
    "ENERGY": ["tired", "exhausted", "sleepy", "fatigue", "drain", "تعب", "إرهاق", "نعاس", "थकान"],
    "TIME": ["busy", "late", "meeting", "work", "deadline", "no time", "مشغول", "وقت", "اجتماع", "व्यस्त", "समय"],
    "TRAVEL": ["travel", "flight", "hotel", "airport", "away", "سفر", "مطار", "رحلة", "यात्रा"],
    "FAMILY_CARE": ["kids", "children", "baby", "parents", "elderly", "care", "عائلة", "أطفال", "أسرة", "परिवार"],
    "PAIN_ILLNESS": ["sick", "cold", "flu", "fever", "headache", "sore", "مرض", "صداع", "ألم", "बीमार", "दर्द"],
    "FORGOT": ["forgot", "slip", "missed alert", "نسيت", "غفلت", "भूल गया"],
    "MOTIVATION": ["lazy", "didn't feel like it", "bored", "ملل", "تكاسل", "मन नहीं था"]
}

RULE_TEMPLATES = {
    "SHIFT_WORK": {
        "en": "If I miss two days after a night shift, I will do a 2-minute gentle stretch on my first day off.",
        "ar": "إذا فاتني يومان بعد تبديل المناوبة الليلية، سأقوم بـ إطالة لدقيقتين في أول يوم إجازة.",
        "hi": "अगर नाईट शिफ्ट के बाद दो दिन छूट जाएं, तो पहले छुट्टी के दिन 2 मिनट का हल्का खिंचाव करूंगा।"
    },
    "WEATHER_HEAT": {
        "en": "If the weather is extremely hot, I will switch to a 2-minute indoor stretch in an air-conditioned room.",
        "ar": "إذا كان الطقس حارًا جدًا، سأتحول إلى إطالة داخلية لدقيقتين في مكان مكيف.",
        "hi": "अगर बाहर बहुत गर्मी हो, तो कमरे के अंदर 2 मिनट का व्यायाम करूंगा।"
    },
    "ENERGY": {
        "en": "If I feel exhausted at the end of the day, I will do just 3 slow deep breaths and count it as done.",
        "ar": "إذا شعرت بإرهاق شديد في نهاية اليوم، سأكتفي بـ 3 أنفاس عميقة وأعتبرها إنجازًا كافيًا.",
        "hi": "अगर बहुत ज्यादा थकान हो, तो 3 बार गहरी सांस लेकर पूरा मानूंगा।"
    },
    "TIME": {
        "en": "If my day gets crowded with urgent tasks, I will do a 1-minute walk around the room right after lunch.",
        "ar": "إذا ازدحم يومي بالمهام الطارئة، سأمشي لدقيقة واحدة في الغرفة مباشرة بعد الغداء.",
        "hi": "अगर दिन भर बहुत व्यस्तता रहे, तो दोपहर के खाने के तुरंत बाद 1 मिनट टहलूंगा।"
    },
    "FAMILY_CARE": {
        "en": "If family needs my urgent attention, I will do a 2-minute breathing reset once everyone is resting.",
        "ar": "إذا احتاجتني عائلتي بشكل طارئ، سأقوم بدقيقتين من التنفس الهادئ فور استقرار الجميع.",
        "hi": "अगर परिवार में व्यस्तता हो, तो सबके विश्राम के बाद 2 मिनट का शांत अभ्यास करूंगा।"
    },
    "TRAVEL": {
        "en": "When I am traveling or away from home, I will do a 2-minute in-room movement routine before bed.",
        "ar": "عند السفر أو التواجد خارج المنزل، سأقوم بروتين حركة لدقيقتين داخل الغرفة قبل النوم.",
        "hi": "सफर के दौरान सोने से पहले कमरे में 2 मिनट की हल्की हलचल करूंगा।"
    }
}

def classify_barrier(text: Optional[str] = None, chip: Optional[str] = None, locale: str = "en") -> Dict[str, Any]:
    # Check governor for red flag first
    if text:
        gov = evaluate_governor(surface="recorder", text=text, locale=locale)
        if gov.decision == "block" and "R7" in gov.rule_ids:
            return {
                "barrier": "PAIN_ILLNESS",
                "confidence": 1.0,
                "governor_blocked": True,
                "governor_reason": gov.reason,
                "emergency_flag": True
            }

    # Direct chip selection
    if chip:
        chip_upper = chip.strip().upper()
        for b in BARRIER_TAXONOMY:
            if b == chip_upper or b in chip_upper:
                return {"barrier": b, "confidence": 0.95, "governor_blocked": False}

    # Keyword text matching
    if text:
        t_lower = text.lower()
        for barrier, kws in BARRIER_KEYWORDS.items():
            for kw in kws:
                if kw in t_lower:
                    return {"barrier": barrier, "confidence": 0.82, "governor_blocked": False}

    return {"barrier": "ENERGY", "confidence": 0.60, "governor_blocked": False}

def generate_recovery_rule(barrier: str, locale: str = "en") -> Dict[str, Any]:
    b_key = barrier if barrier in RULE_TEMPLATES else "ENERGY"
    template_text = RULE_TEMPLATES[b_key].get(locale, RULE_TEMPLATES[b_key]["en"])
    
    return {
        "text": template_text,
        "trigger": {"context": barrier.lower(), "condition": "missed_days>=2"},
        "action": {
            "level": "min",
            "catalog_id": "mv_stretch_2" if barrier in ("SHIFT_WORK", "WEATHER_HEAT") else "sl_wind_down",
            "when": "next_available_window"
        }
    }

