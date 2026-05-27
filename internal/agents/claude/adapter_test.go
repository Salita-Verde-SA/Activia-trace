package claude_test

import (
	"path/filepath"
	"testing"

	"github.com/JuanCruzRobledo/jr-stack/internal/agents/claude"
	"github.com/JuanCruzRobledo/jr-stack/internal/harness/external"
	"github.com/JuanCruzRobledo/jr-stack/internal/model"
)

const testHome = "/home/testuser"

func TestClaudeAdapter_Agent(t *testing.T) {
	a := claude.NewAdapter()
	if got := a.Agent(); got != model.AgentClaude {
		t.Errorf("Agent() = %q, want %q", got, model.AgentClaude)
	}
}

func TestClaudeAdapter_VariantKey(t *testing.T) {
	a := claude.NewAdapter()
	if got := a.VariantKey(); got != "claude" {
		t.Errorf("VariantKey() = %q, want %q", got, "claude")
	}
}

func TestClaudeAdapter_MCPStrategy(t *testing.T) {
	a := claude.NewAdapter()
	if got := a.MCPStrategy(); got != external.StrategySeparateFile {
		t.Errorf("MCPStrategy() = %v, want StrategySeparateFile", got)
	}
}

func TestClaudeAdapter_PathMethods(t *testing.T) {
	a := claude.NewAdapter()
	home := testHome

	tests := []struct {
		name string
		got  string
		want string
	}{
		{
			name: "InstructionsPath",
			got:  a.InstructionsPath(home),
			want: filepath.Join(home, ".claude", "CLAUDE.md"),
		},
		{
			name: "SkillsDir",
			got:  a.SkillsDir(home),
			want: filepath.Join(home, ".claude", "skills"),
		},
		{
			name: "SettingsPath",
			got:  a.SettingsPath(home),
			want: filepath.Join(home, ".claude", "settings.json"),
		},
		{
			name: "MCPConfigPath",
			got:  a.MCPConfigPath(home, "context7"),
			want: filepath.Join(home, ".claude", "mcp", "context7.json"),
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
