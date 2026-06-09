package model

// InstallTarget selects whether harness writes are resolved against
// the user's home directory (machine) or against a project root (project).
//
// The zero-value is Machine so that all existing call sites that do not
// specify a target keep the current machine behaviour without any change.
type InstallTarget int

const (
	// Machine is the default target: harness paths resolve under the user's
	// home directory, matching the pre-C-27 behaviour exactly.
	Machine InstallTarget = iota
	// Project directs harness writes under a project root directory.
	// The exact subdirectory layout is determined by the agent adapter
	// (e.g. Claude uses <root>/.claude/..., OpenCode uses <root>/.opencode/...).
	Project
)

// String returns a human-readable name for the target.
func (t InstallTarget) String() string {
	switch t {
	case Project:
		return "project"
	default:
		return "machine"
	}
}
