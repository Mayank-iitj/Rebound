import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from rebound.core.db import (
    User, Profile, Consent, ActionCatalog, BCTTechnique, NudgeTemplate,
    Plan, PlanAction, Goal, Checkin, DailyLog, DailyState, RecoveryRule,
    Anchor, Cohort, AggMetric, BanditPosterior
)
from rebound.core.security import hash_email, encrypt_text

def seed_database(db: Session):
    # Check if already seeded
    if db.query(ActionCatalog).first():
        return

    # 1. BCT Techniques
    bct_data = [
        ("bct_1_1", {"en": "Goal setting (behaviour)", "ar": "تحديد الأهداف السلوكية", "hi": "व्यवहार लक्ष्य निर्धारण"},
         {"en": "Picking a specific, small goal gives you something clear to aim for.", "ar": "اختيار هدف محدد وبسيط يمنحك تركيزًا واضحًا.", "hi": "एक छोटा और स्पष्ट लक्ष्य तय करना काम आसान बनाता है।"},
         "strong", {"en": "Goals that are too big can feel heavy; we keep them small.", "ar": "الأهداف الكبيرة قد تشكل عبئًا؛ نحرص على إبقائها صغيرة."}),
        ("bct_1_2", {"en": "Problem solving", "ar": "حل المشكلات والعوائق", "hi": "समस्या समाधान"},
         {"en": "Thinking through what gets in the way helps you plan around it.", "ar": "التفكير في العقبات يساعدك على التخطيط لتجاوزها.", "hi": "रुकावटों को समझकर उनसे निपटने की योजना बनाएं।"},
         "strong", {"en": "Works best when you can name the barrier.", "ar": "يعمل بشكل أفضل عندما تحدد العائق بدقة."}),
        ("bct_1_4", {"en": "Action planning", "ar": "تخطيط العمل", "hi": "कार्य योजना"},
         {"en": "Deciding when and where you'll act makes it easier to follow through.", "ar": "تحديد الوقت والمكان بدقة يجعل التنفيذ أسهل.", "hi": "समय और स्थान तय करने से पालन करना आसान होता है।"},
         "strong", {"en": "Works best for simple actions; less help when days are unpredictable.", "ar": "أفضل للأفعال البسيطة؛ أقل فائدة في الأيام غير المتوقعة."}),
        ("bct_2_3", {"en": "Self-monitoring of behaviour", "ar": "المتابعة الذاتية للسلوك", "hi": "आत्म-निगरानी"},
         {"en": "Tracking what you do makes patterns visible.", "ar": "تسجيل ما تقوم به يوضح لك مسارك اليومي.", "hi": "अपनी प्रगति को ट्रैक करना आदतों को मजबूत करता है।"},
         "strong", {"en": "Tracking can feel like a chore; keep it to one tap.", "ar": "التسجيل قد يبدو مرهقًا؛ لذا جعلناه بنقرة واحدة فقط."}),
        ("bct_3_1", {"en": "Social support (unspecified)", "ar": "الدعم الاجتماعي", "hi": "सामाजिक सहयोग"},
         {"en": "A supportive person can make it easier to restart.", "ar": "شخص مساند يسهل عليك العودة بعد الانقطاع.", "hi": "एक सहयोगी साथी से पुनः शुरुआत आसान होती है।"},
         "moderate", {"en": "Only with your permission; your friend sees no health data.", "ar": "بإذنك فقط؛ صديقك لن يرى أي تفاصيل صحية على الإطلاق."}),
        ("bct_7_1", {"en": "Prompts/cues", "ar": "الإشارات والتنبيهات اللطيفة", "hi": "संकेत / अनुस्मारक"},
         {"en": "A reminder at the right moment helps you remember.", "ar": "تذكير في اللحظة المناسبة يساعدك على الاستمرار.", "hi": "सही समय पर एक छोटा संकेत मदद करता है।"},
         "moderate", {"en": "Too many reminders cause fatigue; you set the limit.", "ar": "كثرة التنبيهات مرهقة؛ أنت من يحدد الحد الأقصى."}),
        ("bct_8_7", {"en": "Graded tasks", "ar": "المهام المتدرجة", "hi": "क्रमिक कार्य"},
         {"en": "Starting small and building up keeps things doable.", "ar": "البدء بخطوات صغيرة ثم التدرج يجعل الأمور ممكنة.", "hi": "छोटे कदमों से शुरुआत करना सबसे सुरक्षित रास्ता है।"},
         "moderate", {"en": "Progress may be uneven; show up even on tough days.", "ar": "التقدم قد يكون متذبذبًا؛ الحضور في الأيام الصعبة هو الأهم."}),
        ("bct_13_5", {"en": "Identity associated with changed behaviour", "ar": "الهوية المرتبطة بالتعافي", "hi": "सकारात्मक पहचान"},
         {"en": "Seeing yourself as someone who comes back builds long-term habits.", "ar": "رؤية نفسك كشخص يعود دائمًا بعد الانقطاع يبني عادات تدوم.", "hi": "खुद को दोबारा लौटने वाले व्यक्ति के रूप में देखना मजबूती देता है।"},
         "emerging", {"en": "Focuses on comebacks rather than unbroken streaks.", "ar": "يركز على قوة العودة بدلاً من سلاسل الأيام الخالية من الأخطاء."}),
        ("bct_15_3", {"en": "Focus on past success", "ar": "التركيز على النجاحات السابقة", "hi": "पिछली सफलता पर ध्यान"},
         {"en": "Remembering times you managed it builds confidence.", "ar": "تذكر المرات التي نجحت فيها يعزز ثقتك بنفسك.", "hi": "अपनी पिछली कामयाबियों को याद करना आत्मविश्वास बढ़ाता है।"},
         "moderate", {"en": "Only grounded in your actual verified comebacks.", "ar": "يستند فقط إلى عوداتك الحقيقية المسجلة."})
    ]

    for tid, name, expl, ev, lim in bct_data:
        db.add(BCTTechnique(id=tid, name=name, plain_explanation=expl, evidence_level=ev, limits=lim))

    # 2. Action Catalog (All 3 levels defined per action, minimum <= 2-5 min)
    catalog_items = [
        # Movement
        ("mv_walk", "movement",
         {"en": "Short walk", "ar": "مشي خفيف", "hi": "हल्की सैर"},
         {"en": "Walk indoors or outdoors at your own pace.", "ar": "امشِ داخل المنزل أو خارجه بالسرعة التي تريحك."},
         False, [], ["outdoor", "indoor"],
         {"min": 2, "std": 10, "stretch": 20},
         1.0, {"en": "Stay hydrated in hot weather"}),
        ("mv_stretch_2", "movement",
         {"en": "Gentle stretch", "ar": "إطالة هادئة", "hi": "हल्का खिंचाव"},
         {"en": "Gentle mobility and breathing stretches.", "ar": "إطالات حركية خفيفة مع التنفس العميق."},
         True, [], ["indoor", "no_equipment", "seated_ok", "wheelchair_ok"],
         {"min": 2, "std": 5, "stretch": 10},
         0.4, {}),
        ("mv_chair_moves", "movement",
         {"en": "Seated movement", "ar": "حركات الجلوس والكرسي", "hi": "कुर्सी पर बैठकर व्यायाम"},
         {"en": "Seated arm raises, torso twists, and ankle rotations.", "ar": "رفع الذراعين ودوران الجذع أثناء الجلوس."},
         True, [], ["indoor", "seated_ok", "wheelchair_ok", "no_equipment"],
         {"min": 2, "std": 5, "stretch": 10},
         0.4, {}),
        ("mv_stairs", "movement",
         {"en": "Stairs", "ar": "صعود الدرج", "hi": "सीढ़ियां चढ़ना"},
         {"en": "Take the stairs instead of the elevator.", "ar": "استخدم الدرج بهدوء وتدرج."},
         True, [], ["indoor"],
         {"min": 1, "std": 3, "stretch": 6},
         1.2, {}),
        # Sleep
        ("sl_wind_down", "sleep",
         {"en": "Wind-down routine", "ar": "روتين الاسترخاء قبل النوم", "hi": "सोने से पहले शांति"},
         {"en": "Dim lights and take slow deep breaths.", "ar": "تخفيف الإضاءة وأخذ أنفاس هادئة."},
         True, [], ["indoor", "seated_ok"],
         {"min": 2, "std": 10, "stretch": 20},
         0.5, {}),
        ("sl_screen_down", "sleep",
         {"en": "Screens down", "ar": "إراحة العين من الشاشات", "hi": "स्क्रीन से दूरी"},
         {"en": "Put phone aside before resting.", "ar": "ضع هاتفك جانبًا قبل الاسترخاء."},
         True, [], ["indoor"],
         {"min": 2, "std": 15, "stretch": 30},
         0.6, {}),
        ("sl_shift_nap", "sleep",
         {"en": "Pre-shift rest", "ar": "قيلولة واستراحة ما قبل المناوبة", "hi": "शिफ्ट से पहले विश्राम"},
         {"en": "Short restorative rest before your shift.", "ar": "استراحة قصيرة مريحة قبل بدء مناوبتك."},
         True, [], ["indoor"],
         {"min": 10, "std": 20, "stretch": 40},
         0.8, {}),
        # Nutrition & Hydration
        ("nu_water", "nutrition",
         {"en": "Hydration / Water", "ar": "شرب الماء", "hi": "पानी पीना"},
         {"en": "Drink fresh water.", "ar": "اشرب كوبًا من الماء النقي."},
         True, [], ["indoor", "outdoor"],
         {"min": 1, "std": 4, "stretch": 8},
         0.3, {}),
        ("nu_water_ramadan", "nutrition",
         {"en": "Ramadan Hydration", "ar": "ترطيب رمضان", "hi": "रमजान में पानी"},
         {"en": "Hydrate between Iftar and Suhoor.", "ar": "توزيع شرب الماء بين الإفطار والسحور."},
         True, [], ["indoor"],
         {"min": 1, "std": 3, "stretch": 6},
         0.4, {}),
        ("nu_veg", "nutrition",
         {"en": "Add vegetables / fruit", "ar": "إضافة خضار أو فاكهة", "hi": "सब्जी या फल जोड़ना"},
         {"en": "Add a portion of fresh vegetables or fruit to your meal.", "ar": "أضف حصة من الخضار الطازجة إلى وجبتك."},
         True, [], ["indoor"],
         {"min": 1, "std": 2, "stretch": 3},
         0.5, {}),
        # Smoking Reduction
        ("sm_delay", "smoking",
         {"en": "Delay a cigarette", "ar": "تأخير السيجارة", "hi": "सिगरेट में देरी"},
         {"en": "When a craving strikes, wait a few minutes before deciding.", "ar": "عندما تشعر بالرغبة، انتظر دقائق قبل أن تقرر."},
         True, [], ["indoor", "outdoor"],
         {"min": 5, "std": 15, "stretch": 30},
         0.7, {}),
        ("sm_craving_plan", "smoking",
         {"en": "Craving swap", "ar": "بديل الرغبة الملحة", "hi": "तलब आने पर विकल्प"},
         {"en": "Take 10 deep breaths and sip cool water instead.", "ar": "خذ 10 أنفاس عميقة واشرب ماءً باردًا بدلاً من ذلك."},
         True, [], ["indoor", "outdoor"],
         {"min": 2, "std": 5, "stretch": 10},
         0.5, {})
    ]

    for cid, beh, title, inst, ind, eq, tags, est, eff, saf in catalog_items:
        db.add(ActionCatalog(
            id=cid, behavior=beh, title=title, instructions=inst,
            indoor=ind, equipment=eq, accessibility_tags=tags,
            est_minutes=est, effort_cost=eff, safety_notes=saf, active=True
        ))

    # 3. Nudge Templates
    templates = [
        ("t_m_plan_1", "bct_1_4", "morning", "en", "Good morning, {name}. When will you do your {action} today? Pick a time that fits your day.", ["planning", "neutral"]),
        ("t_m_plan_ar", "bct_1_4", "morning", "ar", "صباح الخير، {name}. متى ستخصص وقتًا لـ {action} اليوم؟ اختر الوقت المناسب ليومك.", ["planning", "neutral"]),
        ("t_m_min_1", "bct_8_7", "morning", "en", "Today can be small. Even the 2-minute version counts.", ["supportive", "planning"]),
        ("t_m_min_ar", "bct_8_7", "morning", "ar", "اليوم يمكن أن يكون خفيفًا. حتى الدقيقتان تُحسبان وتصنعان الفرق.", ["supportive", "planning"]),
        ("t_p_cue_1", "bct_7_1", "pre_window", "en", "Your planned window is coming up: {cue}. Ready for your Minimum version?", ["neutral"]),
        ("t_p_cue_ar", "bct_7_1", "pre_window", "ar", "اقترب موعدك المحدد: {cue}. هل أنت جاهز للنسخة البسيطة؟", ["neutral"]),
        ("t_r_restart_1", "bct_8_7", "restart", "en", "Life happened. Here is a 2-minute restart to get back on track: {min_label}.", ["supportive", "restart"]),
        ("t_r_restart_ar", "bct_8_7", "restart", "ar", "الحياة مليئة بالمفاجآت. إليك بداية بسيطة لدقيقتين: {min_label}.", ["supportive", "restart"]),
        ("t_r_comeback_1", "bct_13_5", "restart", "en", "You have made {n} comebacks before. Coming back is what builds lasting strength.", ["supportive", "identity", "restart"]),
        ("t_r_comeback_ar", "bct_13_5", "restart", "ar", "لقد عدت بنجاح {n} مرات من قبل. العودة دائمًا هي سر بناء العادات الراسخة.", ["supportive", "identity", "restart"]),
        ("t_m_heat_1", "bct_1_2", "morning", "en", "It is very hot today in Abu Dhabi. Let's switch to the indoor version: {indoor_label}.", ["supportive", "neutral"]),
        ("t_m_heat_ar", "bct_1_2", "morning", "ar", "الطقس حار اليوم في أبوظبي. نقترح التحول للنسخة الداخلية: {indoor_label}.", ["supportive", "neutral"])
    ]

    for tid, tech, slot, loc, body, tags in templates:
        db.add(NudgeTemplate(id=tid, technique_id=tech, slot=slot, locale=loc, body=body, tags=tags))

    # 4. Cohort for Aggregate Analytics
    cohort_adq = Cohort(id="coh_adq_workplace", name="Abu Dhabi Health Cohort A", program="workplace")
    db.add(cohort_adq)

    # 5. Seed Persona: Fatima (34, Night-shift Nurse in Abu Dhabi, Arabic)
    fatima_user = User(
        id="usr_fatima_demo",
        email_hash=hash_email("fatima.nurse@rebound.demo"),
        email_enc=encrypt_text("fatima.nurse@rebound.demo"),
        role="user",
        locale="ar",
        timezone="Asia/Dubai",
        status="active"
    )
    db.add(fatima_user)

    fatima_profile = Profile(
        user_id=fatima_user.id,
        display_name_enc=encrypt_text("فاطمة"),
        age_band="25-34",
        gender_group="female",
        work_pattern="night",
        ramadan_observing=False,
        accessibility_tags=[],
        literacy_mode="standard",
        city="Abu Dhabi",
        quiet_hours={"start": "08:00", "end": "15:00"},  # sleeps during day after night shift
        nudge_budget_per_day=3,
        channels={"push": True, "email": False, "whatsapp": True, "sms": False},
        muted_techniques=[]
    )
    db.add(fatima_profile)

    # Fatima's Consents (granular, all transparent)
    fatima_consents = [
        ("notifications", True),
        ("weather_location", True),
        ("wearable", True),
        ("health_age", False),
        ("patient_app", False),
        ("research_aggregate", True)
    ]
    for sc, gr in fatima_consents:
        db.add(Consent(user_id=fatima_user.id, scope=sc, granted=gr))

    # Fatima's Plan: Elastic Movement + Sleep
    fatima_plan = Plan(
        id="plan_fatima_1",
        user_id=fatima_user.id,
        status="active",
        survivability_score=0.833,  # 5 of 6 survived after patching
        survivability_detail={
            "survived": 5, "total": 6,
            "scenarios": [
                {"id": "night_shift_week", "survived": True, "note": "Walk window shifted to post-wake"},
                {"id": "heatwave", "survived": True, "note": "Indoor gentle stretch fallback"},
                {"id": "ramadan", "survived": True, "note": "Hydration shifted to iftar"},
                {"id": "travel", "survived": True, "note": "No-equipment room routine"},
                {"id": "work_crunch", "survived": True, "note": "2-minute Minimum used"},
                {"id": "sick_caregiver", "survived": False, "note": "Family high priority"}
            ]
        },
        committed_at=datetime.now(timezone.utc) - timedelta(days=45)
    )
    db.add(fatima_plan)

    p_act1 = PlanAction(
        id="act_fatima_walk",
        plan_id=fatima_plan.id,
        user_id=fatima_user.id,
        catalog_id="mv_walk",
        cue_text={"en": "After waking up", "ar": "بعد الاستيقاظ من النوم"},
        window_start="17:00",
        window_end="19:00",
        fallback_catalog_id="mv_stretch_2"
    )
    p_act2 = PlanAction(
        id="act_fatima_winddown",
        plan_id=fatima_plan.id,
        user_id=fatima_user.id,
        catalog_id="sl_wind_down",
        cue_text={"en": "Before day sleep", "ar": "قبل النوم الصباحي"},
        window_start="07:30",
        window_end="08:30",
        fallback_catalog_id="sl_screen_down"
    )
    db.add(p_act1)
    db.add(p_act2)

    # Fatima's Recovery Rule generated from Flight Recorder
    fatima_rule = RecoveryRule(
        id="rule_fatima_shift",
        user_id=fatima_user.id,
        trigger={"context": "shift_swap", "condition": "missed_days>=2"},
        action={"level": "min", "catalog_id": "mv_stretch_2", "when": "first_day_off"},
        text_enc=encrypt_text("إذا فاتني يومان بعد تبديل المناوبة الليلية، سأقوم بـ إطالة لدقيقتين في أول يوم إجازة."),
        active=True
    )
    db.add(fatima_rule)

    # 45 days of seeded logs and daily state showing 2 realistic comebacks!
    today_dt = datetime.now(timezone.utc).date()
    for i in range(45, 0, -1):
        day_date = today_dt - timedelta(days=i)
        day_str = day_date.isoformat()
        
        # Simulate shift swap lapse on day 30-31 and day 12-13, with rapid recovery!
        is_lapse_day = (i in [30, 31, 12, 13])
        is_post_recovery = (i in [29, 28, 11, 10])
        
        if is_lapse_day:
            lvl = "none"
            st = "LAPSED" if i in [30, 12] else "AT_RISK"
        elif is_post_recovery:
            lvl = "min"
            st = "RESTARTING"
        else:
            lvl = "std" if (i % 3 != 0) else "min"
            st = "ON_TRACK"

        db.add(DailyLog(
            user_id=fatima_user.id,
            plan_action_id=p_act1.id,
            day=day_str,
            level_done=lvl,
            source="manual"
        ))

        consistency = 0.76 if not is_lapse_day else 0.68
        db.add(DailyState(
            user_id=fatima_user.id,
            day=day_str,
            consistency_28d=consistency,
            eligible_days_28d=28,
            grace_days_used_28d=1,
            p_lapse_3d=0.15 if st == "ON_TRACK" else 0.65,
            state=st
        ))

    # Fatima's Checkin for Today: night shift, short sleep, high heat in Abu Dhabi
    today_str = today_dt.isoformat()
    db.add(Checkin(
        user_id=fatima_user.id,
        day=today_str,
        mood_face=2,
        sleep_hours=4.5,
        chips=["tired", "shift_swap"],
        capacity=0.38,
        capacity_inputs=["self_report", "sleep_hours", "heat_index"],
        suggested_level="min"
    ))
    db.add(DailyState(
        user_id=fatima_user.id,
        day=today_str,
        consistency_28d=0.74,
        eligible_days_28d=28,
        grace_days_used_28d=1,
        p_lapse_3d=0.48,
        state="AT_RISK"
    ))

    # 6. Seed Persona: Rajesh (Outdoor Worker, Hindi, Low Literacy, Smoking Reduction + Water)
    rajesh_user = User(
        id="usr_rajesh_demo",
        email_hash=hash_email("rajesh.worker@rebound.demo"),
        email_enc=encrypt_text("rajesh.worker@rebound.demo"),
        role="user",
        locale="hi",
        timezone="Asia/Dubai",
        status="active"
    )
    db.add(rajesh_user)
    db.add(Profile(
        user_id=rajesh_user.id,
        display_name_enc=encrypt_text("राजेश"),
        age_band="35-44",
        gender_group="male",
        work_pattern="outdoor",
        ramadan_observing=False,
        accessibility_tags=["low_literacy"],
        literacy_mode="low_literacy_audio",
        city="Abu Dhabi",
        quiet_hours={"start": "21:00", "end": "05:00"},
        nudge_budget_per_day=2,
        channels={"push": False, "email": False, "whatsapp": True, "sms": True}
    ))
    # Rajesh's Anchor (Rescue Link)
    db.add(Anchor(
        id="anc_rajesh_1",
        user_id=rajesh_user.id,
        name_enc=encrypt_text("Vikram (Friend)"),
        channel="whatsapp",
        address_enc=encrypt_text("+971501234567"),
        verified_at=datetime.now(timezone.utc) - timedelta(days=20),
        token_hash="tok_hash_vikram_demo"
    ))

    # 7. Seed Persona: Omar (Wheelchair User, Arabic, Seated movement + Sleep)
    omar_user = User(
        id="usr_omar_demo",
        email_hash=hash_email("omar.adaptive@rebound.demo"),
        email_enc=encrypt_text("omar.adaptive@rebound.demo"),
        role="user",
        locale="ar",
        timezone="Asia/Dubai",
        status="active"
    )
    db.add(omar_user)
    db.add(Profile(
        user_id=omar_user.id,
        display_name_enc=encrypt_text("عمر"),
        age_band="45-54",
        gender_group="male",
        work_pattern="day",
        ramadan_observing=True,
        accessibility_tags=["wheelchair", "seated_ok"],
        literacy_mode="standard",
        city="Abu Dhabi"
    ))

    # 8. Seed Aggregate Program Metrics with Differential Privacy (k>=20, Laplace noise, suppression)
    # Subgroup metrics demonstrating < 5 pp equity gap + small cell suppression (tl < 20)
    current_period = today_dt.strftime("%Y-%m")
    program_metrics = [
        # Metric, Subgroup, n, value, suppressed, epsilon
        ("persistence_6m", "all", 520, 0.44, False, 1.0),
        ("persistence_6m", "language:ar", 280, 0.45, False, 1.0),
        ("persistence_6m", "language:en", 160, 0.43, False, 1.0),
        ("persistence_6m", "language:hi", 68, 0.42, False, 1.0),
        ("persistence_6m", "language:tl", 12, None, True, 1.0),  # Suppressed because n < 20!
        ("rhl_median", "all", 520, 2.3, False, 1.0),
        ("rhl_median", "language:ar", 280, 2.1, False, 1.0),
        ("rhl_median", "language:en", 160, 2.4, False, 1.0),
        ("rhl_median", "language:hi", 68, 2.5, False, 1.0),
        ("rhl_median", "language:tl", 12, None, True, 1.0),      # Suppressed!
        ("resume_7d", "all", 520, 0.68, False, 1.0),
        ("resume_7d", "work_pattern:night", 110, 0.66, False, 1.0),
        ("resume_7d", "work_pattern:outdoor", 95, 0.65, False, 1.0),
        ("resume_7d", "work_pattern:day", 315, 0.70, False, 1.0),
    ]

    for met, sub, n_val, val, sup, eps in program_metrics:
        db.add(AggMetric(
            cohort_id=cohort_adq.id,
            metric=met,
            subgroup_key=sub,
            period=current_period,
            n=n_val,
            value=val,
            suppressed=sup,
            epsilon=eps
        ))

    db.commit()

