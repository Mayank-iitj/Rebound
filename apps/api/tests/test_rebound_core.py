import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rebound.policy.governor_rules import evaluate_governor
from rebound.modules.capacity.capacity_math import compute_capacity, compute_rolling_consistency
from rebound.modules.crashtest.simulator import run_crash_test_simulation
from rebound.modules.recorder.recorder_service import classify_barrier, generate_recovery_rule
from rebound.modules.analytics.differential_privacy import apply_differential_privacy_and_suppression, compute_equity_gap
from rebound.modules.sim.agent_study import run_agent_simulation_study

class TestReboundCore(unittest.TestCase):

    # 1. Governor Tests
    def test_governor_blocks_shame_and_loss(self):
        # English forbidden words
        res_fail = evaluate_governor(surface="nudge", text="You failed your goal today. Don't be lazy.")
        self.assertEqual(res_fail.decision, "block")
        self.assertIn("R1", res_fail.rule_ids)

        res_streak = evaluate_governor(surface="nudge", text="You broke your streak yesterday!")
        self.assertEqual(res_streak.decision, "block")
        self.assertIn("R1", res_streak.rule_ids)

        # Arabic forbidden words
        res_ar = evaluate_governor(surface="nudge", text="لقد فشلت في المشي اليوم", locale="ar")
        self.assertEqual(res_ar.decision, "block")
        self.assertIn("R1", res_ar.rule_ids)

    def test_governor_red_flag_escalation(self):
        res_rf = evaluate_governor(surface="recorder", text="I felt severe chest pain and short of breath.")
        self.assertEqual(res_rf.decision, "block")
        self.assertIn("R7", res_rf.rule_ids)
        self.assertIn("Emergency", res_rf.reason)

    def test_governor_allows_supportive_messages(self):
        res_ok = evaluate_governor(surface="nudge", text="Today can be small. Even 2 minutes counts.")
        self.assertEqual(res_ok.decision, "allow")
        self.assertEqual(len(res_ok.rule_ids), 0)

    # 2. Capacity & Consistency Math Tests
    def test_capacity_computation_and_renormalization(self):
        # Checkin with only mood face
        c, inputs, sug, expl = compute_capacity(mood_face=4)
        self.assertEqual(c, 0.75)
        self.assertEqual(inputs, ["self_report"])
        self.assertEqual(sug, "std")

        # Checkin with poor sleep and night shift
        c_low, inputs_low, sug_low, expl_low = compute_capacity(mood_face=2, sleep_hours=4.0, work_pattern="night")
        self.assertTrue(c_low < 0.50)
        self.assertEqual(sug_low, "min")

    def test_consistency_rolling_no_streaks(self):
        # 1 missed day does NOT reset score to zero!
        logs = [{"level_done": "std"}] * 20 + [{"level_done": "none"}]
        score, eligible, grace = compute_rolling_consistency(logs)
        self.assertTrue(score > 0.65)
        self.assertEqual(grace, 1)

    # 3. Crash-Test Simulator Tests
    def test_crash_test_simulation(self):
        plan = {
            "actions": [
                {"catalog_id": "mv_walk", "window_start": "07:00", "fallback_catalog_id": None, "indoor": False}
            ]
        }
        res = run_crash_test_simulation(plan, profile={"work_pattern": "night", "ramadan_observing": True}, n_runs=100, seed=42)
        self.assertIn("survivability", res)
        self.assertIn("scenarios", res)
        self.assertIn("patches", res)
        self.assertTrue(len(res["scenarios"]) == 6)
        self.assertTrue(len(res["patches"]) > 0)

    # 4. Flight Recorder Tests
    def test_barrier_classification_and_rule_generation(self):
        # Keyword barrier classification
        res = classify_barrier(text="I had to work back-to-back night shifts and was exhausted.")
        self.assertEqual(res["barrier"], "SHIFT_WORK")

        # Generate recovery rule
        rule = generate_recovery_rule("SHIFT_WORK", locale="ar")
        self.assertIn("text", rule)
        self.assertIn("المناوبة الليلية", rule["text"])

    # 5. Differential Privacy & Equity Tests
    def test_differential_privacy_suppression(self):
        # Suppress cell when n < 20
        noisy_val, suppressed, n_bucket = apply_differential_privacy_and_suppression(0.45, true_n=15)
        self.assertTrue(suppressed)
        self.assertIsNone(noisy_val)
        self.assertEqual(n_bucket, "<20")

        # Add noise when n >= 20
        noisy_val2, suppressed2, n_bucket2 = apply_differential_privacy_and_suppression(0.45, true_n=100, seed=42)
        self.assertFalse(suppressed2)
        self.assertIsNotNone(noisy_val2)
        self.assertAlmostEqual(noisy_val2, 0.45, delta=0.08)

    def test_equity_gap_calculation(self):
        subgroups = {"language:ar": 0.45, "language:en": 0.43, "language:hi": 0.42}
        gap_res = compute_equity_gap(subgroups)
        self.assertEqual(gap_res["abs_pp"], 3.0)
        self.assertEqual(gap_res["status"], "within_target")

    # 6. Agent Simulation Study Test
    def test_agent_study(self):
        study = run_agent_simulation_study(n_users=500, weeks=12)
        self.assertIn("curves", study)
        self.assertIn("B3_ReboundFull", study["curves"])
        # B3 persistence must exceed B0 fixed standard
        self.assertTrue(study["curves"]["B3_ReboundFull"][-1] > study["curves"]["B0_Fixed"][-1])

if __name__ == "__main__":
    unittest.main()

