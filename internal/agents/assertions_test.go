// Package agents_test contains compile-time assertions that verify each
// concrete adapter satisfies every harness installer's local interface.
// These catch interface drift without requiring runtime execution.
package agents_test

import (
	claudeadapter "github.com/JuanCruzRobledo/jr-stack/internal/agents/claude"
	opencodeadapter "github.com/JuanCruzRobledo/jr-stack/internal/agents/opencode"
	"github.com/JuanCruzRobledo/jr-stack/internal/harness/config"
	"github.com/JuanCruzRobledo/jr-stack/internal/harness/config/permissions"
	"github.com/JuanCruzRobledo/jr-stack/internal/harness/external"
	"github.com/JuanCruzRobledo/jr-stack/internal/harness/skill"
)

// Task 5.1 — claude adapter satisfies all four installer interfaces.
var _ skill.AgentAdapter = (*claudeadapter.Adapter)(nil)
var _ config.AgentAdapter = (*claudeadapter.Adapter)(nil)
var _ permissions.PermissionsAdapter = (*claudeadapter.Adapter)(nil)
var _ external.AgentAdapter = (*claudeadapter.Adapter)(nil)

// Task 5.2 — opencode adapter satisfies all four installer interfaces.
var _ skill.AgentAdapter = (*opencodeadapter.Adapter)(nil)
var _ config.AgentAdapter = (*opencodeadapter.Adapter)(nil)
var _ permissions.PermissionsAdapter = (*opencodeadapter.Adapter)(nil)
var _ external.AgentAdapter = (*opencodeadapter.Adapter)(nil)
