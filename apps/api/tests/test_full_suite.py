import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from rebound.main import app

class TestFullReboundSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_static_landing_page(self):
        r = self.client.get("/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("Rebound", r.text)

    def test_api_today_and_checkin(self):
        r_today = self.client.get("/v1/today")
        self.assertEqual(r_today.status_code, 200)
        data = r_today.json()
        self.assertIn("capacity", data)
        self.assertIn("actions", data)
        self.assertIn("consistency_28d", data)
        self.assertFalse(data.get("streak_exists", True))  # No streaks!

        # Submit checkin
        r_chk = self.client.post("/v1/checkins", json={
            "mood_face": 2,
            "sleep_hours": 4.5,
            "chips": ["tired", "shift_swap"]
        })
        self.assertEqual(r_chk.status_code, 200)
        self.assertTrue(r_chk.json()["capacity"] < 0.50)

    def test_crash_test_and_patch(self):
        # Crash test
        r_sim = self.client.post("/v1/plans/plan_fatima_1/crash-test", json={"n_runs": 100, "seed": 42})
        self.assertEqual(r_sim.status_code, 200)
        sim = r_sim.json()
        self.assertEqual(len(sim["scenarios"]), 6)
        self.assertTrue(len(sim["patches"]) > 0)

        # Apply patch
        r_patch = self.client.post("/v1/plans/plan_fatima_1/patches/p_shift_window/apply")
        self.assertEqual(r_patch.status_code, 200)
        self.assertTrue(r_patch.json()["success"])

    def test_flight_recorder_and_rules(self):
        r_rec = self.client.get("/v1/recorder/lapse_demo_1")
        self.assertEqual(r_rec.status_code, 200)
        self.assertEqual(len(r_rec.json()["timeline"]), 7)

        # Answer with keyword text
        r_ans = self.client.post("/v1/recorder/lapse_demo_1/answer", json={
            "text": "I had consecutive night shifts and was exhausted."
        })
        self.assertEqual(r_ans.status_code, 200)
        self.assertEqual(r_ans.json()["barrier"]["value"], "SHIFT_WORK")
        self.assertIn("text", r_ans.json()["proposed_rule"])

        # Accept rule
        r_rule = self.client.post("/v1/rules", json={
            "text": "If I miss two days after a night shift, I will do a 2-minute stretch on my first day off.",
            "trigger": {"context": "shift_swap"},
            "action": {"level": "min"}
        })
        self.assertEqual(r_rule.status_code, 200)

    def test_governor_fail_closed_and_red_flag(self):
        # Shame block
        r_block = self.client.post("/v1/governor/test-message", json={
            "message": "You broke your streak and failed yesterday. You are lazy!"
        })
        self.assertEqual(r_block.json()["decision"], "block")
        self.assertIn("R1", r_block.json()["rule_ids"])

        # Red flag escalation
        r_rf = self.client.post("/v1/governor/test-message", json={
            "message": "I am experiencing severe chest pain and short of breath."
        })
        self.assertEqual(r_rf.json()["decision"], "block")
        self.assertIn("R7", r_rf.json()["rule_ids"])

        # Supportive allow
        r_allow = self.client.post("/v1/governor/test-message", json={
            "message": "Today can be small. The 2-minute version counts."
        })
        self.assertEqual(r_allow.json()["decision"], "allow")

    def test_program_analytics_privacy_suppression(self):
        r_prog = self.client.get("/v1/program/coh_adq_workplace/metrics")
        self.assertEqual(r_prog.status_code, 200)
        metrics = r_prog.json()["series"]
        
        # Verify k>=20 suppression: Tagalog cell has n < 20 and must be suppressed
        tl_cell = next(m for m in metrics if "language:tl" in m["subgroup"])
        self.assertTrue(tl_cell["suppressed"])
        self.assertIsNone(tl_cell["value"])
        self.assertEqual(tl_cell["n_bucket"], "<20")

        # Verify equity gap
        gap = r_prog.json()["equity_gap"]
        self.assertTrue(gap["abs_pp"] <= 5.0)

    def test_simulation_lab(self):
        r_lab = self.client.post("/v1/sim/runs", json={"n_users": 1000, "seed": 42})
        self.assertEqual(r_lab.status_code, 200)
        data = r_lab.json()
        self.assertIn("curves", data)
        self.assertIn("SIMULATED", data["watermark"])
        self.assertTrue(data["curves"]["B3_ReboundFull"][-1] > data["curves"]["B0_Fixed"][-1])

if __name__ == "__main__":
    unittest.main()

