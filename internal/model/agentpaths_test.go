package model

import "testing"

// ─────────────────────────────────────────────────────────────────────────────
// C-28: MCPStrategy enum lives in model (D1a — avoids model↔external cycle)
// ─────────────────────────────────────────────────────────────────────────────

// TestAgentPaths_MCPStrategy_Field asserts that AgentPaths carries an MCPStrategy
// field. This test forces the enum-home decision: MCPStrategy MUST be defined in
// internal/model (not internal/harness/external) to avoid a cyclic import.
// If the strategy field is missing or of the wrong type, this test will not compile.
func TestAgentPaths_MCPStrategy_Field(t *testing.T) {
	// Verify enum values are defined in model.
	var s MCPStrategy
	if s != MCPStrategySeparateFile {
		t.Errorf("zero value of MCPStrategy should be MCPStrategySeparateFile, got %v", s)
	}

	// Verify AgentPaths carries the field.
	p := AgentPaths{
		MCPStrategy: MCPStrategyMergeIntoSettings,
	}
	if p.MCPStrategy != MCPStrategyMergeIntoSettings {
		t.Errorf("AgentPaths.MCPStrategy = %v, want MCPStrategyMergeIntoSettings", p.MCPStrategy)
	}
}

// TestAgentPaths_WithMCPStrategy asserts the WithMCPStrategy builder sets the field.
func TestAgentPaths_WithMCPStrategy(t *testing.T) {
	p := AgentPaths{}.WithMCPStrategy(MCPStrategySingleFileMerge)
	if p.MCPStrategy != MCPStrategySingleFileMerge {
		t.Errorf("WithMCPStrategy: got %v, want MCPStrategySingleFileMerge", p.MCPStrategy)
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// C-31: CommandsDir field + WithCommandsDir builder
// ─────────────────────────────────────────────────────────────────────────────

// TestAgentPaths_CommandsDir_Field asserts that AgentPaths carries a CommandsDir
// field and that WithCommandsDir round-trips the value.
// RED: this fails until CommandsDir and WithCommandsDir are added to AgentPaths.
func TestAgentPaths_CommandsDir_Field(t *testing.T) {
	const dir = "/home/user/.claude/commands"

	// Direct field set round-trips.
	p := AgentPaths{CommandsDir: dir}
	if p.CommandsDir != dir {
		t.Errorf("AgentPaths.CommandsDir = %q, want %q", p.CommandsDir, dir)
	}

	// WithCommandsDir builder round-trips.
	p2 := AgentPaths{}.WithCommandsDir(dir)
	if p2.CommandsDir != dir {
		t.Errorf("WithCommandsDir(%q).CommandsDir = %q, want %q", dir, p2.CommandsDir, dir)
	}
}

// TestAgentPaths_CommandsDir_ZeroValue asserts that the zero value of
// AgentPaths.CommandsDir is an empty string (no-commands / skip behavior).
func TestAgentPaths_CommandsDir_ZeroValue(t *testing.T) {
	var p AgentPaths
	if p.CommandsDir != "" {
		t.Errorf("zero-value AgentPaths.CommandsDir = %q, want empty string", p.CommandsDir)
	}

	// WithCommandsDir with empty string leaves it empty.
	p2 := AgentPaths{}.WithCommandsDir("")
	if p2.CommandsDir != "" {
		t.Errorf("WithCommandsDir(%q).CommandsDir = %q, want empty string", "", p2.CommandsDir)
	}
}
