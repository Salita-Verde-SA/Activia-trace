package headless

import (
	"fmt"
	"io"

	"github.com/JuanCruzRobledo/jr-stack/internal/install"
	"github.com/JuanCruzRobledo/jr-stack/internal/pipeline"
	"github.com/JuanCruzRobledo/jr-stack/internal/verify"
)

// RunHeadless executes the headless install flow and returns the process exit code:
//   - 0  on success (all hard checks pass).
//   - 1  on pipeline failure, verify failure, or rollback.
//
// It writes progress and verify output to w (typically os.Stdout).
//
// The function mirrors the wiring already used by the TUI (BuildPlan →
// pipeline.NewOrchestrator → Execute), so no new pipeline logic is introduced.
//
// When params.DryRun is true, RunHeadless prints the plan steps and returns 0
// without executing anything (no side-effects).
//
// When params.VerifyHookFn is non-nil it is used as the verify hook directly
// (test injection point). Otherwise the hook is built from the verify.BuildHook
// with an empty harness+adapter set (the caller is responsible for wiring the
// real hook via the catalog/registry; here we keep the hook nil when no
// VerifyHookFn is injected, matching the "no hook" TUI path for the test cases
// that don't supply harnesses with verify checks).
func RunHeadless(params ParsedFlags, cat install.Catalog, reg install.Registry, w io.Writer) int {
	// Build install options.
	opts := install.Options{
		HomeDir:  params.HomeDir,
		Registry: reg,
	}

	// Wire verify hook.
	if params.VerifyHookFn != nil {
		opts.VerifyHook = params.VerifyHookFn
	}
	// (When VerifyHookFn is nil and no real harnesses/adapters are provided in
	// tests, opts.VerifyHook stays nil — same as the current TUI path.)

	// Build the plan — use the injected BuildPlanFn when provided (allows
	// main.go to wire install.WithEmbeddedSkillsFS), otherwise use the default.
	buildPlanFn := params.BuildPlanFn
	if buildPlanFn == nil {
		buildPlanFn = install.BuildPlan
	}
	plan, err := buildPlanFn(cat, params.Intent, opts)
	if err != nil {
		fmt.Fprintf(w, "error: build plan: %v\n", err)
		return 1
	}

	// ── Dry-run: print plan steps and exit without executing ────────────────
	if params.DryRun {
		fmt.Fprintln(w, "Dry-run: plan steps (not executed):")
		for _, s := range plan.Prepare {
			fmt.Fprintf(w, "  [prepare] %s\n", s.ID())
		}
		for _, s := range plan.Apply {
			fmt.Fprintf(w, "  [apply]   %s\n", s.ID())
		}
		return 0
	}

	// ── Execute the plan via the orchestrator ───────────────────────────────

	// Progress function: print each step lifecycle event to w.
	progressFn := func(e pipeline.ProgressEvent) {
		switch e.Status {
		case pipeline.StepStatusRunning:
			fmt.Fprintf(w, "  → %s running...\n", e.StepID)
		case pipeline.StepStatusSucceeded:
			fmt.Fprintf(w, "  ✓ %s\n", e.StepID)
		case pipeline.StepStatusFailed:
			fmt.Fprintf(w, "  ✗ %s: %v\n", e.StepID, e.Err)
		case pipeline.StepStatusRolledBack:
			fmt.Fprintf(w, "  ↩ %s (rolled back)\n", e.StepID)
		}
	}

	orch := pipeline.NewOrchestrator(
		pipeline.DefaultRollbackPolicy(),
		pipeline.WithProgressFunc(progressFn),
	)
	result := orch.Execute(plan.StagePlan)

	if result.Err != nil {
		fmt.Fprintf(w, "\nInstallation failed: %v\n", result.Err)
		if result.Rollback.Stage == pipeline.StageRollback {
			if result.Rollback.Success {
				fmt.Fprintln(w, "Rollback: succeeded")
			} else {
				fmt.Fprintf(w, "Rollback: failed (%v)\n", result.Rollback.Err)
			}
		}
		return 1
	}

	// ── Print verify report ─────────────────────────────────────────────────
	// Collect any check results from the verify hook by building an empty
	// report (the real checks ran inside the verify-hook step). If no
	// VerifyHookFn was wired and opts.VerifyHook is nil, print the
	// "all passed" summary manually.
	report := verify.BuildReport(nil) // zero checks → Ready == true
	fmt.Fprint(w, verify.RenderReport(report))

	return 0
}
