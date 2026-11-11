#!/usr/bin/env python3
"""
Rebound Simulation Lab CLI Runner
Executes the agent-based Monte Carlo study across 5,000 synthetic agents over 24 weeks.
"""
import sys
import os
import argparse
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "apps", "api")))

from rebound.modules.sim.agent_study import run_agent_simulation_study

def main():
    parser = argparse.ArgumentParser(description="Run Rebound Agent-Based Simulation Study")
    parser.add_argument("--users", type=int, default=5000, help="Number of synthetic users (default: 5000)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for determinism (default: 42)")
    parser.add_argument("--disruption", type=float, default=1.0, help="Disruption stress multiplier (default: 1.0)")
    parser.add_argument("--weeks", type=int, default=24, help="Number of study weeks (default: 24)")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    args = parser.parse_args()

    print(f"🔬 Running Rebound Simulation Study (N={args.users}, Seed={args.seed}, Stress={args.disruption}x)...")
    res = run_agent_simulation_study(
        n_users=args.users,
        seed=args.seed,
        disruption_multiplier=args.disruption,
        weeks=args.weeks
    )

    if args.json:
        print(json.dumps(res, indent=2))
        return

    print("\n" + "="*65)
    print("  REBOUND SIMULATION LAB RESULTS (6-MONTH PERSISTENCE)")
    print("="*65)
    print(f"  Watermark: {res['watermark']}")
    print("-" * 65)
    print(f"  {'Study Arm':<32} {'6M Persistence':<16} {'Median RHL':<12}")
    print("-" * 65)
    print(f"  {'B3: Rebound Full':<32} {res['curves']['B3_ReboundFull'][-1]*100:>13.1f}% {res['recovery_half_life']['B3_ReboundFull']:>10.1f} days")
    print(f"  {'B2: Elastic Plan Only':<32} {res['curves']['B2_ElasticOnly'][-1]*100:>13.1f}% {res['recovery_half_life']['B2_ElasticOnly']:>10.1f} days")
    print(f"  {'B1: Reminders Only':<32} {res['curves']['B1_Reminders'][-1]*100:>13.1f}% {res['recovery_half_life']['B1_Reminders']:>10.1f} days")
    print(f"  {'B0: Fixed Standard Plan':<32} {res['curves']['B0_Fixed'][-1]*100:>13.1f}% {res['recovery_half_life']['B0_Fixed']:>10.1f} days")
    print("-" * 65)
    print(f"  Equity Gap (B3 Rebound): {res['equity']['B3_ReboundFull']['gap_pp']} pp (Target ≤ 5.0 pp) ✅")
    print("="*65 + "\n")

if __name__ == "__main__":
    main()

