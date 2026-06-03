package claude_test

import (
	"path/filepath"
	"testing"

	"github.com/JuanCruzRobledo/jr-stack/internal/agents/claude"
	"github.com/JuanCruzRobledo/jr-stack/internal/harness/external"
	"github.com/JuanCruzRobledo/jr-stack/internal/model"
)

// TestClaudeAdapter_ZeroRegression_MachinePathsForMCP asserts that PathsFor
// with Machine target still returns the legacy machine MCP path and that the
// resolved strategy from AgentPaths for the machine target is SeparateFile.
// This is the zero-regression guard for C-28: changing project must not
// touch machine.
func TestClaudeAdapter_ZeroRegression_MachinePathsForMCP(t *testing.T) {
	a := claude.NewAdapter()
	home := "/home/regressuser"

	paths := a.PathsFor(home, model.Machine)

	t.Run("MachineTargetMCPPath", func(t *testing.T) {
		want := filepath.Join(home, ".claude", "mcp", "context7.json")
		got := paths.MCPConfigPath("context7")
		if got != want {
			t.Errorf("Machine PathsFor MCPConfigPath = %q, want %q", got, want)
		}
	})

	t.Run("MachineTargetStrategy_SeparateFile", func(t *testing.T) {
		if paths.MCPStrategy != model.MCPStrategySeparateFile {
			t.Errorf("Machine MCPStrategy = %v, want MCPStrategySeparateFile", paths.MCPStrategy)
		}
	})

	t.Run("MachineLegacyMCPStrategy_Unchanged", func(t *testing.T) {
		if got := a.MCPStrategy(); got != external.StrategySeparateFile {
			t.Errorf("MCPStrategy() = %v, want StrategySeparateFile", got)
		}
	})
}

// TestClaudeAdapter_ZeroRegression_C31_PathsForFields asserts that adding
// CommandsDir in C-31 does not alter any previously established PathsFor fields
// (InstructionsPath, SkillsDir, SettingsPath, MCP path/strategy) for either target.
// This is the zero-regression guard for the C-31 PathsFor extension.
func TestClaudeAdapter_ZeroRegression_C31_PathsForFields(t *testing.T) {
	a := claude.NewAdapter()
	home := "/home/regressuser"
	root := "/project/myapp"

	t.Run("Machine_InstructionsPath", func(t *testing.T) {
		want := filepath.Join(home, ".claude", "CLAUDE.md")
		if got := a.PathsFor(home, model.Machine).InstructionsPath; got != want {
			t.Errorf("Machine PathsFor InstructionsPath = %q, want %q", got, want)
		}
	})
	t.Run("Machine_SkillsDir", func(t *testing.T) {
		want := filepath.Join(home, ".claude", "skills")
		if got := a.PathsFor(home, model.Machine).SkillsDir; got != want {
			t.Errorf("Machine PathsFor SkillsDir = %q, want %q", got, want)
		}
	})
	t.Run("Machine_SettingsPath", func(t *testing.T) {
		want := filepath.Join(home, ".claude", "settings.json")
		if got := a.PathsFor(home, model.Machine).SettingsPath; got != want {
			t.Errorf("Machine PathsFor SettingsPath = %q, want %q", got, want)
		}
	})
	t.Run("Machine_MCPStrategy", func(t *testing.T) {
		if got := a.PathsFor(home, model.Machine).MCPStrategy; got != model.MCPStrategySeparateFile {
			t.Errorf("Machine PathsFor MCPStrategy = %v, want SeparateFile", got)
		}
	})
	t.Run("Project_InstructionsPath", func(t *testing.T) {
		want := filepath.Join(root, ".claude", "CLAUDE.md")
		if got := a.PathsFor(root, model.Project).InstructionsPath; got != want {
			t.Errorf("Project PathsFor InstructionsPath = %q, want %q", got, want)
		}
	})
	t.Run("Project_SkillsDir", func(t *testing.T) {
		want := filepath.Join(root, ".claude", "skills")
		if got := a.PathsFor(root, model.Project).SkillsDir; got != want {
			t.Errorf("Project PathsFor SkillsDir = %q, want %q", got, want)
		}
	})
	t.Run("Project_SettingsPath", func(t *testing.T) {
		want := filepath.Join(root, ".claude", "settings.json")
		if got := a.PathsFor(root, model.Project).SettingsPath; got != want {
			t.Errorf("Project PathsFor SettingsPath = %q, want %q", got, want)
		}
	})
	t.Run("Project_MCPPath_SingleFile", func(t *testing.T) {
		want := filepath.Join(root, ".mcp.json")
		if got := a.PathsFor(root, model.Project).MCPConfigPath("any-server"); got != want {
			t.Errorf("Project PathsFor MCPConfigPath = %q, want %q", got, want)
		}
	})
	t.Run("Project_MCPStrategy_SingleFileMerge", func(t *testing.T) {
		if got := a.PathsFor(root, model.Project).MCPStrategy; got != model.MCPStrategySingleFileMerge {
			t.Errorf("Project PathsFor MCPStrategy = %v, want SingleFileMerge", got)
		}
	})
}

// TestClaudeAdapter_ZeroRegression_MachineMethodsUnchanged is the explicit
// zero-regression guard for C-27. It pins the exact return values of the
// 7 pre-existing adapter methods (those that existed before C-27) and asserts
// they are UNCHANGED by the project-target addition.
//
// Invariant: adding PathsFor must not alter the output of any existing method.
func TestClaudeAdapter_ZeroRegression_MachineMethodsUnchanged(t *testing.T) {
	a := claude.NewAdapter()
	home := "/home/regressuser"

	t.Run("Agent", func(t *testing.T) {
		if got := a.Agent(); got != model.AgentClaude {
			t.Errorf("Agent() = %q, want %q", got, model.AgentClaude)
		}
	})

	t.Run("InstructionsPath", func(t *testing.T) {
		want := filepath.Join(home, ".claude", "CLAUDE.md")
		if got := a.InstructionsPath(home); got != want {
			t.Errorf("InstructionsPath(%q) = %q, want %q", home, got, want)
		}
	})

	t.Run("SkillsDir", func(t *testing.T) {
		want := filepath.Join(home, ".claude", "skills")
		if got := a.SkillsDir(home); got != want {
			t.Errorf("SkillsDir(%q) = %q, want %q", home, got, want)
		}
	})

	t.Run("SettingsPath", func(t *testing.T) {
		want := filepath.Join(home, ".claude", "settings.json")
		if got := a.SettingsPath(home); got != want {
			t.Errorf("SettingsPath(%q) = %q, want %q", home, got, want)
		}
	})

	t.Run("MCPConfigPath", func(t *testing.T) {
		want := filepath.Join(home, ".claude", "mcp", "context7.json")
		if got := a.MCPConfigPath(home, "context7"); got != want {
			t.Errorf("MCPConfigPath(%q, %q) = %q, want %q", home, "context7", got, want)
		}
	})

	t.Run("MCPStrategy", func(t *testing.T) {
		if got := a.MCPStrategy(); got != external.StrategySeparateFile {
			t.Errorf("MCPStrategy() = %v, want StrategySeparateFile", got)
		}
	})

	t.Run("VariantKey", func(t *testing.T) {
		if got := a.VariantKey(); got != "claude" {
			t.Errorf("VariantKey() = %q, want %q", got, "claude")
		}
	})
}
