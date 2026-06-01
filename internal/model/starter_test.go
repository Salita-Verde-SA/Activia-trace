package model

import (
	"strings"
	"testing"
)

// ─────────────────────────────────────────────────────────────────────────────
// C-26: Starter domain type — field-level validation
// ─────────────────────────────────────────────────────────────────────────────

// TestStarterValidate_WellFormed asserts that a Starter with a non-empty ID
// and Name passes field-level validation without error.
func TestStarterValidate_WellFormed(t *testing.T) {
	s := Starter{
		ID:   "active-ia",
		Name: "Active IA",
	}
	if err := s.Validate(); err != nil {
		t.Errorf("expected no error for well-formed Starter, got: %v", err)
	}
}

// TestStarterValidate_EmptyID asserts that a Starter with an empty ID fails
// validation and that the error names the missing field.
func TestStarterValidate_EmptyID(t *testing.T) {
	s := Starter{
		ID:   "",
		Name: "Some Starter",
	}
	err := s.Validate()
	if err == nil {
		t.Fatal("expected error for Starter with empty ID, got nil")
	}
	if !strings.Contains(err.Error(), "id") {
		t.Errorf("expected error to mention 'id', got: %q", err.Error())
	}
}

// TestStarterValidate_EmptyName asserts that a Starter with an empty Name
// fails validation and that the error names the missing field.
func TestStarterValidate_EmptyName(t *testing.T) {
	s := Starter{
		ID:   "active-ia",
		Name: "",
	}
	err := s.Validate()
	if err == nil {
		t.Fatal("expected error for Starter with empty Name, got nil")
	}
	if !strings.Contains(err.Error(), "name") {
		t.Errorf("expected error to mention 'name', got: %q", err.Error())
	}
}
