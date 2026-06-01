package claude_test

import (
	"path/filepath"
	"testing"

	"github.com/JuanCruzRobledo/jr-stack/internal/agents/claude"
	"github.com/JuanCruzRobledo/jr-stack/internal/harness/external"
	"github.com/JuanCruzRobledo/jr-stack/internal/model"
)

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
