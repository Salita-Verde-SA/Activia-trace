package planner

import (
	"errors"
	"reflect"
	"testing"
)

func TestTopologicalSortOrdersDependenciesFirst(t *testing.T) {
	// engram has no deps; sdd depends on engram; skills depends on sdd; context7 has no deps.
	deps := map[string][]string{
		"engram":   nil,
		"sdd":      {"engram"},
		"skills":   {"sdd"},
		"context7": nil,
	}

	ordered, err := TopologicalSort(deps)
	if err != nil {
		t.Fatalf("TopologicalSort() returned error: %v", err)
	}

	// Alphabetical tie-breaking among no-dep nodes: context7 before engram.
	want := []string{"context7", "engram", "sdd", "skills"}
	if !reflect.DeepEqual(ordered, want) {
		t.Fatalf("TopologicalSort() = %v, want %v", ordered, want)
	}
}

func TestTopologicalSortDeterministicTieBreaking(t *testing.T) {
	// Three independent harnesses — result must always be alphabetical.
	deps := map[string][]string{
		"zebra": nil,
		"alpha": nil,
		"beta":  nil,
	}

	ordered, err := TopologicalSort(deps)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	want := []string{"alpha", "beta", "zebra"}
	if !reflect.DeepEqual(ordered, want) {
		t.Fatalf("TopologicalSort() = %v, want %v (alphabetical)", ordered, want)
	}
}

func TestTopologicalSortDetectsTwoNodeCycle(t *testing.T) {
	deps := map[string][]string{
		"a": {"b"},
		"b": {"a"},
	}

	_, err := TopologicalSort(deps)
	if err == nil {
		t.Fatal("TopologicalSort() expected error for cycle, got nil")
	}
	if !errors.Is(err, ErrDependencyCycle) {
		t.Fatalf("TopologicalSort() error = %v, want ErrDependencyCycle", err)
	}
}

func TestTopologicalSortDetectsThreeNodeCycle(t *testing.T) {
	deps := map[string][]string{
		"a": {"b"},
		"b": {"c"},
		"c": {"a"},
	}

	_, err := TopologicalSort(deps)
	if err == nil {
		t.Fatal("TopologicalSort() expected error for three-node cycle, got nil")
	}
	if !errors.Is(err, ErrDependencyCycle) {
		t.Fatalf("TopologicalSort() error = %v, want ErrDependencyCycle", err)
	}
}

func TestTopologicalSortSingleNode(t *testing.T) {
	deps := map[string][]string{
		"only": nil,
	}

	ordered, err := TopologicalSort(deps)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !reflect.DeepEqual(ordered, []string{"only"}) {
		t.Fatalf("TopologicalSort() = %v, want [only]", ordered)
	}
}
