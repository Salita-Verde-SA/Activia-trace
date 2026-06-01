package model

// AgentPaths holds the resolved filesystem paths for a given agent and install
// target. It is returned by the Adapter.PathsFor method and used by the install
// pipeline to route writes to the correct location without knowing per-agent
// directory layouts.
type AgentPaths struct {
	// InstructionsPath is the path to the agent's primary instructions file
	// (e.g. CLAUDE.md, AGENTS.md).
	InstructionsPath string
	// SkillsDir is the path to the agent's skills directory.
	SkillsDir string
	// SettingsPath is the path to the agent's settings/config file.
	SettingsPath string
	// mcpConfigFn computes the MCP config path for a given server name.
	// It encapsulates the per-agent, per-target logic.
	// Set via WithMCPConfigFn; nil returns empty string.
	mcpConfigFn func(serverName string) string
}

// MCPConfigPath returns the resolved path for an MCP server config,
// using the agent-specific, target-aware logic captured at construction time.
//
//   - Claude (StrategySeparateFile): <agentDir>/mcp/<serverName>.json
//   - OpenCode (StrategyMergeIntoSettings): <agentDir>/opencode.json
func (p AgentPaths) MCPConfigPath(serverName string) string {
	if p.mcpConfigFn == nil {
		return ""
	}
	return p.mcpConfigFn(serverName)
}

// WithMCPConfigFn returns a copy of p with the MCP config path function set.
// Adapter implementations call this in PathsFor to wire the per-agent MCP logic.
func (p AgentPaths) WithMCPConfigFn(fn func(serverName string) string) AgentPaths {
	p.mcpConfigFn = fn
	return p
}
