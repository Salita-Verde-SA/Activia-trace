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
