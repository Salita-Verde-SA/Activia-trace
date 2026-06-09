// Package agents provides per-agent adapters that resolve filesystem paths
// (instructions file, skills directory, settings, MCP config) and strategy
// enums (MCP strategy, variant key) so that no installer ever hardcodes
// agent-specific paths.
//
// # Design rationale — Interface Segregation (ISP)
//
// Each harness installer (skill, config, permissions, external) declares its
// own minimal local AgentAdapter interface.  The concrete adapters in this
// package implement all four narrow interfaces simultaneously, verified at
// compile time via var _ assertions in the test files.  Installers are never
// forced to import this package; callers (TUI, pipeline) resolve an adapter
// from the Registry and pass it wherever a local interface is accepted.
//
// # Extension recipe
//
// To add a new agent (e.g. gemini):
//  1. Create internal/agents/gemini/adapter.go implementing the seven methods.
//  2. Add one case to NewAdapter in factory.go.
//  3. Add one entry to NewDefaultRegistry in factory.go.
//
// No installer, no interface, and no existing adapter needs to change.
package agents
