package opencode_test

import (
	"path/filepath"
	"testing"

	"github.com/JuanCruzRobledo/jr-stack/internal/agents/opencode"
	"github.com/JuanCruzRobledo/jr-stack/internal/harness/external"
	"github.com/JuanCruzRobledo/jr-stack/internal/model"
)

// TestOpenCodeAdapter_ZeroRegression_MachineMethodsUnchanged is the explicit
// zero-regression guard for C-27. It pins the exact return values of the
// 7 pre-existing adapter methods (those that existed before C-27) and asserts
// they are UNCHANGED by the project-target addition.
//
// Machine layout uses ~/.config/opencode/ (XDG). This MUST remain unchanged.
func TestOpenCodeAdapter_ZeroRegression_MachineMethodsUnchanged(t *testing.T) {
	a := opencode.NewAdapter()
	home := "/home/regressuser"

	t.Run("Agent", func(t *testing.T) {
		if got := a.Agent(); got != model.AgentOpenCode {
			t.Errorf("Agent() = %q, want %q", got, model.AgentOpenCode)
		}
	})

	t.Run("InstructionsPath", func(t *testing.T) {
		want := filepath.Join(home, ".config", "opencode", "AGENTS.md")
		if got := a.InstructionsPath(home); got != want {
			t.Errorf("InstructionsPath(%q) = %q, want %q", home, got, want)
		}
	})

	t.Run("SkillsDir", func(t *testing.T) {
		want := filepath.Join(home, ".config", "opencode", "skills")
		if got := a.SkillsDir(home); got != want {
			t.Errorf("SkillsDir(%q) = %q, want %q", home, got, want)
		}
	})

	t.Run("SettingsPath", func(t *testing.T) {
		want := filepath.Join(home, ".config", "opencode", "opencode.json")
		if got := a.SettingsPath(home); got != want {
			t.Errorf("SettingsPath(%q) = %q, want %q", home, got, want)
		}
	})

	t.Run("MCPConfigPath", func(t *testing.T) {
		want := filepath.Join(home, ".config", "opencode", "opencode.json")
		if got := a.MCPConfigPath(home, "context7"); got != want {
			t.Errorf("MCPConfigPath(%q, %q) = %q, want %q", home, "context7", got, want)
		}
	})

	t.Run("MCPStrategy", func(t *testing.T) {
		if got := a.MCPStrategy(); got != external.StrategyMergeIntoSettings {
			t.Errorf("MCPStrategy() = %v, want StrategyMergeIntoSettings", got)
		}
	})

	t.Run("VariantKey", func(t *testing.T) {
		if got := a.VariantKey(); got != "opencode" {
			t.Errorf("VariantKey() = %q, want %q", got, "opencode")
		}
	})
}
