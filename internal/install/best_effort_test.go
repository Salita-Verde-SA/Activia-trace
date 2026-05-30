package install_test

// C-19: best-effort harness — tasks 2.1, 2.2, 2.3, 3.1
//
// Tests are intentionally RED until the implementation is added.

import (
	"context"
	"errors"
	"io/fs"
	"testing"

	"github.com/JuanCruzRobledo/jr-stack/internal/backup"
	skillinstaller "github.com/JuanCruzRobledo/jr-stack/internal/harness/skill"
	"github.com/JuanCruzRobledo/jr-stack/internal/install"
	"github.com/JuanCruzRobledo/jr-stack/internal/model"
	"github.com/JuanCruzRobledo/jr-stack/internal/pipeline"
)

// Task 2.1 — best-effort skillStep whose install fn fails → Run() returns nil
// (pipeline does not abort).
func TestSkillStep_BestEffort_FailReturnNil(t *testing.T) {
	installErr := errors.New("git clone: exit status 1")

	restore := install.SetSkillInstallFn(func(
		_ interface{},
		_ fs.FS,
		_ context.Context,
		_ model.Harness,
		_ []skillinstaller.AgentAdapter,
		_, _ string,
	) ([]skillinstaller.Result, error) {
		return nil, installErr
	})
	defer restore()

	restoreSnap := install.SetSnapshotCreate(func(dir string, paths []string) (backup.Manifest, error) {
		return backup.Manifest{}, nil
	})
	defer restoreSnap()

	h := model.Harness{
		ID:           "find-skill",
		Type:         model.HarnessSkill,
		BestEffort:   true,
		Source:       &model.Source{Repo: "vercel-labs/skills", Method: "clone"},
		InstallModes: []model.InstallMode{model.ModeFull},
	}
	cat := &fakeCatalog{harnesses: []model.Harness{h}}
	reg := &fakeRegistry{adapters: map[model.Agent]install.AgentAdapter{
		model.AgentClaude: fakeAdapter{agent: model.AgentClaude},
	}}
	homeDir := t.TempDir()
	intent := install.Intent{Agents: []model.Agent{model.AgentClaude}, Mode: model.ModeFull}

	plan, err := install.BuildPlan(cat, intent, buildOptions(homeDir, reg, nil))
	if err != nil {
		t.Fatalf("BuildPlan() error = %v", err)
	}

	orch := pipeline.NewOrchestrator(pipeline.DefaultRollbackPolicy())
	result := orch.Execute(plan.StagePlan)

	// A best-effort step failure must NOT propagate as a pipeline error.
	if result.Err != nil {
		t.Errorf("best-effort skillStep failure should not abort the pipeline, got error: %v", result.Err)
	}
}

// Task 2.2a — best-effort skillStep failure emits a warning via onProgress callback.
func TestSkillStep_BestEffort_EmitsWarningViaProgressCallback(t *testing.T) {
	installErr := errors.New("git clone: exit status 1")

	restore := install.SetSkillInstallFn(func(
		_ interface{},
		_ fs.FS,
		_ context.Context,
		_ model.Harness,
		_ []skillinstaller.AgentAdapter,
		_, _ string,
	) ([]skillinstaller.Result, error) {
		return nil, installErr
	})
	defer restore()

	restoreSnap := install.SetSnapshotCreate(func(dir string, paths []string) (backup.Manifest, error) {
		return backup.Manifest{}, nil
	})
	defer restoreSnap()

	h := model.Harness{
		ID:           "find-skill",
		Type:         model.HarnessSkill,
		BestEffort:   true,
		Source:       &model.Source{Repo: "vercel-labs/skills", Method: "clone"},
		InstallModes: []model.InstallMode{model.ModeFull},
	}
	cat := &fakeCatalog{harnesses: []model.Harness{h}}
	reg := &fakeRegistry{adapters: map[model.Agent]install.AgentAdapter{
		model.AgentClaude: fakeAdapter{agent: model.AgentClaude},
	}}
	homeDir := t.TempDir()
	intent := install.Intent{Agents: []model.Agent{model.AgentClaude}, Mode: model.ModeFull}

	var receivedEvents []pipeline.ProgressEvent
	progressFn := func(ev pipeline.ProgressEvent) {
		receivedEvents = append(receivedEvents, ev)
	}

	opts := buildOptionsWithProgress(homeDir, reg, nil, progressFn)
	plan, err := install.BuildPlan(cat, intent, opts)
	if err != nil {
		t.Fatalf("BuildPlan() error = %v", err)
	}

	orch := pipeline.NewOrchestrator(
		pipeline.DefaultRollbackPolicy(),
		pipeline.WithProgressFunc(plan.OnProgress),
	)
	result := orch.Execute(plan.StagePlan)
	if result.Err != nil {
		t.Errorf("best-effort failure must not abort pipeline, got: %v", result.Err)
	}

	// At least one warning event must have been emitted for find-skill carrying a non-nil Err.
	warningFound := false
	for _, ev := range receivedEvents {
		if ev.StepID == "skill:find-skill" && ev.Err != nil {
			warningFound = true
			break
		}
	}
	if !warningFound {
		t.Errorf("expected a warning progress event for skill:find-skill with non-nil Err, got events: %+v", receivedEvents)
	}
}

// Task 2.3 — NON-best-effort skillStep whose install fn fails → Run() returns the
// error (unchanged abort behavior — regression guard).
func TestSkillStep_NonBestEffort_FailReturnsError(t *testing.T) {
	installErr := errors.New("clone failed: permission denied")

	restore := install.SetSkillInstallFn(func(
		_ interface{},
		_ fs.FS,
		_ context.Context,
		_ model.Harness,
		_ []skillinstaller.AgentAdapter,
		_, _ string,
	) ([]skillinstaller.Result, error) {
		return nil, installErr
	})
	defer restore()

	restoreSnap := install.SetSnapshotCreate(func(dir string, paths []string) (backup.Manifest, error) {
		return backup.Manifest{ID: "snap", RootDir: dir}, nil
	})
	defer restoreSnap()

	restoreRestore := install.SetRestoreFn(func(_ backup.Manifest) error {
		return nil
	})
	defer restoreRestore()

	h := model.Harness{
		ID:           "jr-orchestrator",
		Type:         model.HarnessSkill,
		BestEffort:   false, // explicit: not best-effort
		Source:       &model.Source{Repo: "JuanCruzRobledo/jr-orchestrator", Method: "clone"},
		InstallModes: []model.InstallMode{model.ModeLite, model.ModeFull},
	}
	cat := &fakeCatalog{harnesses: []model.Harness{h}}
	reg := &fakeRegistry{adapters: map[model.Agent]install.AgentAdapter{
		model.AgentClaude: fakeAdapter{agent: model.AgentClaude},
	}}
	homeDir := t.TempDir()
	intent := install.Intent{Agents: []model.Agent{model.AgentClaude}, Mode: model.ModeLite}

	plan, err := install.BuildPlan(cat, intent, buildOptions(homeDir, reg, nil))
	if err != nil {
		t.Fatalf("BuildPlan() error = %v", err)
	}

	orch := pipeline.NewOrchestrator(pipeline.DefaultRollbackPolicy())
	result := orch.Execute(plan.StagePlan)

	// A non-best-effort step failure MUST propagate as a pipeline error.
	if result.Err == nil {
		t.Error("non-best-effort skillStep failure must abort the pipeline (error expected)")
	}
}

// Task 3.1 — buildHarnessStep for a best-effort skill harness propagates BestEffort
// and opts.OnProgress into the skillStep. Verified indirectly: the plan runs,
// the failing best-effort step returns nil (soft success), and OnProgress receives
// a warning event carrying the install error.
func TestBuildHarnessStep_BestEffortSkill_PropagatesBestEffortAndProgress(t *testing.T) {
	installErr := errors.New("git: not available")

	restore := install.SetSkillInstallFn(func(
		_ interface{},
		_ fs.FS,
		_ context.Context,
		_ model.Harness,
		_ []skillinstaller.AgentAdapter,
		_, _ string,
	) ([]skillinstaller.Result, error) {
		return nil, installErr
	})
	defer restore()

	restoreSnap := install.SetSnapshotCreate(func(dir string, paths []string) (backup.Manifest, error) {
		return backup.Manifest{}, nil
	})
	defer restoreSnap()

	h := model.Harness{
		ID:           "skill-creator",
		Type:         model.HarnessSkill,
		BestEffort:   true,
		Source:       &model.Source{Repo: "anthropics/skills", Method: "clone"},
		InstallModes: []model.InstallMode{model.ModeFull},
	}
	cat := &fakeCatalog{harnesses: []model.Harness{h}}
	reg := &fakeRegistry{adapters: map[model.Agent]install.AgentAdapter{
		model.AgentClaude: fakeAdapter{agent: model.AgentClaude},
	}}
	homeDir := t.TempDir()
	intent := install.Intent{Agents: []model.Agent{model.AgentClaude}, Mode: model.ModeFull}

	var receivedEvents []pipeline.ProgressEvent
	progressFn := func(ev pipeline.ProgressEvent) {
		receivedEvents = append(receivedEvents, ev)
	}

	opts := buildOptionsWithProgress(homeDir, reg, nil, progressFn)
	plan, err := install.BuildPlan(cat, intent, opts)
	if err != nil {
		t.Fatalf("BuildPlan() error = %v", err)
	}

	orch := pipeline.NewOrchestrator(
		pipeline.DefaultRollbackPolicy(),
		pipeline.WithProgressFunc(plan.OnProgress),
	)
	result := orch.Execute(plan.StagePlan)

	// Pipeline must NOT abort.
	if result.Err != nil {
		t.Errorf("best-effort step must not abort pipeline, got error: %v", result.Err)
	}

	// OnProgress must have received a warning event for this step.
	warningFound := false
	for _, ev := range receivedEvents {
		if ev.StepID == "skill:skill-creator" && ev.Err != nil {
			warningFound = true
			break
		}
	}
	if !warningFound {
		t.Errorf("expected warning progress event for skill:skill-creator with non-nil Err, got: %+v", receivedEvents)
	}
}
