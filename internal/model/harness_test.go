package model

import "testing"

// ─────────────────────────────────────────────────────────────────────────────
// C-32: harness-scope-model — ScopeKind / IsStarterOnly()
// ─────────────────────────────────────────────────────────────────────────────

// TestModel_ScopeKind_ZeroValueIsGlobal asserts that:
//  1. A Harness with no Scope set (zero value) returns IsStarterOnly()==false.
//  2. A Harness with Scope==ScopeStarterOnly returns IsStarterOnly()==true.
//
// RED: fails to compile/run against current code — type ScopeKind and helper
// IsStarterOnly() do not exist yet.
func TestModel_ScopeKind_ZeroValueIsGlobal(t *testing.T) {
	// Case 1: zero value (field omitted) → global, not starter-only.
	zero := Harness{}
	if zero.IsStarterOnly() {
		t.Error("Harness{} (zero Scope): IsStarterOnly() = true, want false")
	}

	// Case 2: explicit ScopeGlobal → also not starter-only.
	explicit := Harness{Scope: ScopeGlobal}
	if explicit.IsStarterOnly() {
		t.Errorf("Harness{Scope: ScopeGlobal}: IsStarterOnly() = true, want false")
	}

	// Case 3 (triangulation): ScopeStarterOnly → must be starter-only.
	starterOnly := Harness{Scope: ScopeStarterOnly}
	if !starterOnly.IsStarterOnly() {
		t.Error("Harness{Scope: ScopeStarterOnly}: IsStarterOnly() = false, want true")
	}
}
