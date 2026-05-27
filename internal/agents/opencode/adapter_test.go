package opencode_test

import (
	"path/filepath"
	"testing"

	"github.com/JuanCruzRobledo/jr-stack/internal/agents/opencode"
	"github.com/JuanCruzRobledo/jr-stack/internal/harness/external"
	"github.com/JuanCruzRobledo/jr-stack/internal/model"
)

const testHome = "/home/testuser"

func TestOpenCodeAdapter_Agent(t *testing.T) {
	a := opencode.NewAdapter()
	if got := a.Agent(); got != model.AgentOpenCode {
		t.Errorf("Agent() = %q, want %q", got, model.AgentOpenCode)
	}
}

func TestOpenCodeAdapter_VariantKey(t *testing.T) {
	a := opencode.NewAdapter()
	if got := a.VariantKey(); got != "opencode" {
		t.Errorf("VariantKey() = %q, want %q", got, "opencode")
	}
}

func TestOpenCodeAdapter_MCPStrategy(t *testing.T) {
	a := opencode.NewAdapter()
	if got := a.MCPStrategy(); got != external.StrategyMergeIntoSettings {
		t.Errorf("MCPStrategy() = %v, want StrategyMergeIntoSettings", got)
	}
}

func TestOpenCodeAdapter_PathMethods(t *testing.T) {
	a := opencode.NewAdapter()
	home := testHome

	tests := []struct {
		name string
		got  string
		want string
	}{
		{
			name: "InstructionsPath",
			got:  a.InstructionsPath(home),
			want: filepath.Join(home, ".config", "opencode", "AGENTS.md"),
		},
		{
			name: "SkillsDir",
			got:  a.SkillsDir(home),
			want: filepath.Join(home, ".config", "opencode", "skills"),
		},
		{
			name: "SettingsPath",
			got:  a.SettingsPath(home),
			want: filepath.Join(home, ".config", "opencode", "opencode.json"),
		},
		{
			name: "MCPConfigPath",
			got:  a.MCPConfigPath(home, "context7"),
			want: filepath.Join(home, ".config", "opencode", "opencode.json"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.got != tt.want {
				t.Errorf("%s = %q, want %q", tt.name, tt.got, tt.want)
			}
		})
	}
}
