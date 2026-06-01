package claude_test

import (
	"path/filepath"
	"testing"

	"github.com/JuanCruzRobledo/jr-stack/internal/agents/claude"
	"github.com/JuanCruzRobledo/jr-stack/internal/model"
)

// TestClaudeAdapter_ProjectTarget verifies that the Claude adapter resolves
// the correct paths when the install target is Project.
//
// Claude project layout (D2):
//   <root>/.claude/skills
//   <root>/.claude/CLAUDE.md
//   <root>/.claude/settings.json
//   <root>/.claude/mcp/<server>.json
//
// This is the same subdirectory layout as machine — only the base changes.
func TestClaudeAdapter_ProjectTarget(t *testing.T) {
	a := claude.NewAdapter()
	root := "/project/myapp"

	paths := a.PathsFor(root, model.Project)

	tests := []struct {
		name string
		got  string
		want string
	}{
		{
			name: "SkillsDir",
			got:  paths.SkillsDir,
			want: filepath.Join(root, ".claude", "skills"),
		},
		{
			name: "InstructionsPath",
			got:  paths.InstructionsPath,
			want: filepath.Join(root, ".claude", "CLAUDE.md"),
		},
		{
			name: "SettingsPath",
			got:  paths.SettingsPath,
			want: filepath.Join(root, ".claude", "settings.json"),
		},
		{
			name: "MCPConfigPath(context7)",
			got:  paths.MCPConfigPath("context7"),
			want: filepath.Join(root, ".claude", "mcp", "context7.json"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.got != tt.want {
				t.Errorf("got %q, want %q", tt.got, tt.want)
			}
		})
	}
}

// TestClaudeAdapter_MachineTargetViaPathsFor verifies that PathsFor with
// Machine target returns exactly the same paths as the individual methods.
// This is the zero-regression guard from the project side.
func TestClaudeAdapter_MachineTargetViaPathsFor(t *testing.T) {
	a := claude.NewAdapter()
	home := testHome

	paths := a.PathsFor(home, model.Machine)

	tests := []struct {
		name string
		got  string
		want string
	}{
		{
			name: "SkillsDir",
			got:  paths.SkillsDir,
			want: a.SkillsDir(home),
		},
		{
			name: "InstructionsPath",
			got:  paths.InstructionsPath,
			want: a.InstructionsPath(home),
		},
		{
			name: "SettingsPath",
			got:  paths.SettingsPath,
			want: a.SettingsPath(home),
		},
		{
			name: "MCPConfigPath(context7)",
			got:  paths.MCPConfigPath("context7"),
			want: a.MCPConfigPath(home, "context7"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.got != tt.want {
				t.Errorf("got %q, want %q", tt.got, tt.want)
			}
		})
	}
}
