// Package claude provides the JR Stack agent adapter for Claude Code.
package claude

import (
	"path/filepath"

	"github.com/JuanCruzRobledo/jr-stack/internal/harness/external"
	"github.com/JuanCruzRobledo/jr-stack/internal/model"
)

// Adapter resolves Claude Code-specific filesystem paths and config strategies.
// It satisfies skill.AgentAdapter, config.AgentAdapter,
// permissions.PermissionsAdapter, and external.AgentAdapter simultaneously.
type Adapter struct{}

// NewAdapter returns a ready-to-use Claude Code adapter.
func NewAdapter() *Adapter {
	return &Adapter{}
}

// Agent returns the model.Agent identifier for Claude Code.
func (a *Adapter) Agent() model.Agent {
	return model.AgentClaude
}

// InstructionsPath returns the path to Claude Code's primary instructions file.
// Example: /home/user/.claude/CLAUDE.md
func (a *Adapter) InstructionsPath(homeDir string) string {
	return filepath.Join(homeDir, ".claude", "CLAUDE.md")
}

// SkillsDir returns the path to Claude Code's skills directory.
// Example: /home/user/.claude/skills
func (a *Adapter) SkillsDir(homeDir string) string {
	return filepath.Join(homeDir, ".claude", "skills")
}

// SettingsPath returns the path to Claude Code's settings file.
// Example: /home/user/.claude/settings.json
func (a *Adapter) SettingsPath(homeDir string) string {
	return filepath.Join(homeDir, ".claude", "settings.json")
}

// MCPConfigPath returns the path where an MCP server config file should be
// written for Claude Code. Claude uses one JSON file per server.
// Example: /home/user/.claude/mcp/context7.json
func (a *Adapter) MCPConfigPath(homeDir, serverName string) string {
	return filepath.Join(homeDir, ".claude", "mcp", serverName+".json")
}

// MCPStrategy returns external.StrategySeparateFile — Claude Code writes one
// JSON file per MCP server under ~/.claude/mcp/<server>.json.
func (a *Adapter) MCPStrategy() external.MCPStrategy {
	return external.StrategySeparateFile
}

// VariantKey returns "claude", used to select the claude/ asset directory in
// the config installer.
func (a *Adapter) VariantKey() string {
	return "claude"
}

// PathsFor returns the resolved AgentPaths for the given base directory and
// install target. For Machine, the result is identical to the existing per-method
// outputs (zero regression). For Project, the base uses the same .claude/
// subdirectory layout but anchored to the project root instead of home.
//
// Claude project layout (D2):
//   <root>/.claude/skills
//   <root>/.claude/CLAUDE.md
//   <root>/.claude/settings.json
//   <root>/.claude/mcp/<server>.json
func (a *Adapter) PathsFor(base string, t model.InstallTarget) model.AgentPaths {
	// Claude uses the same .claude/ subdirectory layout for both machine and
	// project targets. The only difference is the base directory.
	// Machine: base = homeDir  → identical to the pre-C-27 per-method results.
	// Project: base = projectRoot → writes under <root>/.claude/...
	claudeDir := filepath.Join(base, ".claude")
	return model.AgentPaths{
		InstructionsPath: filepath.Join(claudeDir, "CLAUDE.md"),
		SkillsDir:        filepath.Join(claudeDir, "skills"),
		SettingsPath:     filepath.Join(claudeDir, "settings.json"),
	}.WithMCPConfigFn(func(serverName string) string {
		return filepath.Join(claudeDir, "mcp", serverName+".json")
	})
}
