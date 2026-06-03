// Package main — tests for C-29 "starter" routing in the dispatch switch
// (Task 6.1 RED). Tests run the runStarterDispatch function extracted from
// main() to assert correct routing without spinning up the full binary.
package main

import (
	"bytes"
	"strings"
	"testing"

	"github.com/JuanCruzRobledo/jr-stack/internal/backup"
	"github.com/JuanCruzRobledo/jr-stack/internal/catalog"
	"github.com/JuanCruzRobledo/jr-stack/internal/install"
	"github.com/JuanCruzRobledo/jr-stack/internal/model"
)

// TestStarterDispatch_AddSubcommandRoutes asserts that "starter add <id>"
// dispatches to the handler and, for an unknown id, exits non-zero with a list.
//
// RED: fails because runStarterDispatch does not exist yet.
func TestStarterDispatch_AddSubcommandRoutes(t *testing.T) {
	cat, err := catalog.Load()
	if err != nil {
		t.Fatalf("catalog.Load() error = %v", err)
	}

	reg := starterAddTestReg{adapters: map[model.Agent]install.AgentAdapter{
		model.AgentClaude:   starterAddTestAdapter{agent: model.AgentClaude},
		model.AgentOpenCode: starterAddTestAdapter{agent: model.AgentOpenCode},
	}}

	restoreSnap := install.SetSnapshotCreate(func(dir string, paths []string) (backup.Manifest, error) {
		return backup.Manifest{}, nil
	})
	defer restoreSnap()

	projectRoot := t.TempDir()
	args := []string{"add", "ux-ui", "--project", projectRoot, "--dry-run", "--yes"}

	var out bytes.Buffer
	exitCode := runStarterDispatch(args, cat, reg, &out)
	if exitCode != 0 {
		t.Errorf("'starter add ux-ui --dry-run' must exit 0, got %d; output:\n%s", exitCode, out.String())
	}
}

// TestStarterDispatch_UnknownSubcommand asserts that "starter <unknown>" exits
// non-zero with a usage error naming the "add" subcommand.
//
// RED: fails because runStarterDispatch does not exist yet.
func TestStarterDispatch_UnknownSubcommand(t *testing.T) {
	cat, err := catalog.Load()
	if err != nil {
		t.Fatalf("catalog.Load() error = %v", err)
	}

	reg := starterAddTestReg{adapters: map[model.Agent]install.AgentAdapter{
		model.AgentClaude: starterAddTestAdapter{agent: model.AgentClaude},
	}}

	var out bytes.Buffer
	exitCode := runStarterDispatch([]string{"list"}, cat, reg, &out)
	if exitCode == 0 {
		t.Fatal("unknown subcommand must exit non-zero")
	}

	output := out.String()
	if !strings.Contains(output, "add") {
		t.Errorf("usage error must mention the 'add' subcommand; got:\n%s", output)
	}
}

// TestStarterDispatch_NoSubcommand asserts that "starter" with no subcommand
// exits non-zero with a usage error.
//
// RED: fails because runStarterDispatch does not exist yet.
func TestStarterDispatch_NoSubcommand(t *testing.T) {
	cat, err := catalog.Load()
	if err != nil {
		t.Fatalf("catalog.Load() error = %v", err)
	}

	reg := starterAddTestReg{adapters: map[model.Agent]install.AgentAdapter{
		model.AgentClaude: starterAddTestAdapter{agent: model.AgentClaude},
	}}

	var out bytes.Buffer
	exitCode := runStarterDispatch([]string{}, cat, reg, &out)
	if exitCode == 0 {
		t.Fatal("no subcommand must exit non-zero")
	}
}

// TestStarterDispatch_AddMissingID asserts that "starter add" without an id
// exits non-zero (the handler/parser returns an error).
//
// RED: fails because runStarterDispatch does not exist yet.
func TestStarterDispatch_AddMissingID(t *testing.T) {
	cat, err := catalog.Load()
	if err != nil {
		t.Fatalf("catalog.Load() error = %v", err)
	}

	reg := starterAddTestReg{adapters: map[model.Agent]install.AgentAdapter{
		model.AgentClaude: starterAddTestAdapter{agent: model.AgentClaude},
	}}

	var out bytes.Buffer
	// "add" with no further args → missing id
	exitCode := runStarterDispatch([]string{"add"}, cat, reg, &out)
	if exitCode == 0 {
		t.Fatal("'starter add' with no id must exit non-zero")
	}
}
