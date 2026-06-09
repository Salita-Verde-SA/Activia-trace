package planner

import (
	"errors"
	"fmt"
	"slices"
)

// ErrDependencyCycle is returned when the dependency graph contains a cycle.
var ErrDependencyCycle = errors.New("dependency cycle detected")

// TopologicalSort returns the harness IDs in topological order using Kahn's
// algorithm. When multiple nodes are ready at the same time, they are sorted
// alphabetically for determinism.
//
// deps maps each harness ID to its direct dependency IDs. A harness with no
// dependencies must appear in the map with a nil or empty slice.
//
// Returns ErrDependencyCycle if a cycle is detected.
func TopologicalSort(deps map[string][]string) ([]string, error) {
	// Collect all nodes (including deps that may only appear as values).
	nodes := make(map[string]struct{}, len(deps))
	inDegree := make(map[string]int, len(deps))
	children := make(map[string][]string, len(deps))

	for id, idDeps := range deps {
		nodes[id] = struct{}{}
		if _, ok := inDegree[id]; !ok {
			inDegree[id] = 0
		}

		for _, dep := range idDeps {
			nodes[dep] = struct{}{}
			inDegree[id]++
			children[dep] = append(children[dep], id)
			if _, ok := inDegree[dep]; !ok {
				inDegree[dep] = 0
			}
		}
	}

	// Seed the queue with zero-in-degree nodes, sorted for determinism.
	queue := make([]string, 0, len(nodes))
	for node := range nodes {
		if inDegree[node] == 0 {
			queue = append(queue, node)
		}
	}
	slices.Sort(queue)

	ordered := make([]string, 0, len(nodes))
	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]
		ordered = append(ordered, node)

		slices.Sort(children[node])
		for _, child := range children[node] {
			inDegree[child]--
			if inDegree[child] == 0 {
				queue = append(queue, child)
				slices.Sort(queue)
			}
		}
	}

	if len(ordered) != len(nodes) {
		return nil, fmt.Errorf("%w: unresolved graph", ErrDependencyCycle)
	}

	return ordered, nil
}
