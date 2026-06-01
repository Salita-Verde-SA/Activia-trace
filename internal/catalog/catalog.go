// Package catalog loads and validates the embedded master catalog of
// harnesses that the installer can install or configure.
package catalog

import (
	_ "embed"
	"fmt"

	"github.com/JuanCruzRobledo/jr-stack/internal/model"
	"gopkg.in/yaml.v3"
)

//go:embed harnesses.yaml
var rawCatalog []byte

// Catalog is the parsed, validated set of available harnesses and starters.
type Catalog struct {
	Harnesses []model.Harness  `yaml:"harnesses"`
	Starters  []model.Starter  `yaml:"starters"`

	index        map[string]model.Harness
	starterIndex map[string]model.Starter
}

// Load parses the embedded catalog and validates it. It is the single entry
// point: a malformed catalog is a build/release error, so this fails loudly.
func Load() (*Catalog, error) {
	return parse(rawCatalog)
}

func parse(data []byte) (*Catalog, error) {
	var c Catalog
	if err := yaml.Unmarshal(data, &c); err != nil {
		return nil, fmt.Errorf("catalog: parse: %w", err)
	}
	c.index = make(map[string]model.Harness, len(c.Harnesses))
	// Infer Source.Method for skill harnesses that omit it.
	for i, h := range c.Harnesses {
		if h.Type == model.HarnessSkill && h.Source != nil && h.Source.Method == "" {
			// Both first-party and third-party skills clone (npx support removed).
			c.Harnesses[i].Source.Method = "clone"
		}
	}
	for _, h := range c.Harnesses {
		c.index[h.ID] = h
	}
	// Build starter index.
	c.starterIndex = make(map[string]model.Starter, len(c.Starters))
	for _, s := range c.Starters {
		c.starterIndex[s.ID] = s
	}
	if err := c.validate(); err != nil {
		return nil, err
	}
	return &c, nil
}

func (c *Catalog) validate() error {
	seen := make(map[string]bool, len(c.Harnesses))
	for _, h := range c.Harnesses {
		switch {
		case h.ID == "":
			return fmt.Errorf("catalog: harness with empty id")
		case seen[h.ID]:
			return fmt.Errorf("catalog: duplicate harness id %q", h.ID)
		case !h.Type.IsValid():
			return fmt.Errorf("catalog: harness %q has invalid type %q", h.ID, h.Type)
		case len(h.InstallModes) == 0:
			return fmt.Errorf("catalog: harness %q has no install_modes", h.ID)
		}
		seen[h.ID] = true

		for _, m := range h.InstallModes {
			if !m.IsValid() {
				return fmt.Errorf("catalog: harness %q has invalid mode %q", h.ID, m)
			}
		}
		switch h.Type {
		case model.HarnessSkill:
			if h.Source == nil || h.Source.Repo == "" {
				return fmt.Errorf("catalog: skill harness %q needs a source.repo", h.ID)
			}
			switch h.Source.Method {
			case "clone", "embed":
				// valid
			default:
				return fmt.Errorf("catalog: skill harness %q has unknown source.method %q (want clone|embed)", h.ID, h.Source.Method)
			}
		case model.HarnessExternal:
			if h.External == nil || h.External.Method == "" {
				return fmt.Errorf("catalog: external harness %q needs an external.method", h.ID)
			}
		}
		for _, dep := range h.DependsOn {
			if _, ok := c.index[dep]; !ok {
				return fmt.Errorf("catalog: harness %q depends on unknown harness %q", h.ID, dep)
			}
		}
	}
	return c.validateStarters()
}

// validateStarters checks all starters in the catalog:
//   - each starter's own fields are valid (via Starter.Validate())
//   - no empty ids
//   - no duplicate ids
//   - every Harnesses[i] references an existing harness id
//   - every Includes[i] references an existing starter id
//   - no cycles in the includes graph (DFS tri-state: unvisited / in-stack / done)
//
// A malformed starters section is a build/release error, same as harnesses.
func (c *Catalog) validateStarters() error {
	seen := make(map[string]bool, len(c.Starters))
	for _, s := range c.Starters {
		// Field-level validation.
		if err := s.Validate(); err != nil {
			return fmt.Errorf("catalog: starter validation: %w", err)
		}
		// Duplicate id check.
		if seen[s.ID] {
			return fmt.Errorf("catalog: duplicate starter id %q", s.ID)
		}
		seen[s.ID] = true

		// Harness references must exist.
		for _, hid := range s.Harnesses {
			if _, ok := c.index[hid]; !ok {
				return fmt.Errorf("catalog: starter %q references unknown harness %q", s.ID, hid)
			}
		}
		// Include references must exist.
		for _, inc := range s.Includes {
			if _, ok := c.starterIndex[inc]; !ok {
				return fmt.Errorf("catalog: starter %q includes unknown starter %q", s.ID, inc)
			}
		}
	}
	// Cycle detection — DFS with tri-state marking over the includes graph.
	// States: 0 = unvisited, 1 = in-stack (being explored), 2 = done.
	state := make(map[string]int, len(c.Starters))
	var dfs func(id string) error
	dfs = func(id string) error {
		switch state[id] {
		case 1:
			return fmt.Errorf("catalog: cycle detected in starter includes involving %q", id)
		case 2:
			return nil
		}
		state[id] = 1 // mark as in-stack
		s := c.starterIndex[id]
		for _, inc := range s.Includes {
			if err := dfs(inc); err != nil {
				return err
			}
		}
		state[id] = 2 // mark as done
		return nil
	}
	for _, s := range c.Starters {
		if err := dfs(s.ID); err != nil {
			return err
		}
	}
	return nil
}

// ByID returns the harness with the given id.
func (c *Catalog) ByID(id string) (model.Harness, bool) {
	h, ok := c.index[id]
	return h, ok
}

// ForMode returns the harnesses that belong to the given install mode, in
// catalog order.
func (c *Catalog) ForMode(m model.InstallMode) []model.Harness {
	var out []model.Harness
	for _, h := range c.Harnesses {
		if h.InMode(m) {
			out = append(out, h)
		}
	}
	return out
}

// ForAgent returns the harnesses that apply to the given agent, in catalog
// order.
func (c *Catalog) ForAgent(a model.Agent) []model.Harness {
	var out []model.Harness
	for _, h := range c.Harnesses {
		if h.SupportsAgent(a) {
			out = append(out, h)
		}
	}
	return out
}

// StarterByID returns the starter with the given id and a found flag.
func (c *Catalog) StarterByID(id string) (model.Starter, bool) {
	s, ok := c.starterIndex[id]
	return s, ok
}

// ResolveStarter expands the starter with the given id into its TOTAL set of
// harnesses by resolving includes recursively. The result is deduplicated
// (each harness appears at most once) and preserves first-appearance order for
// deterministic output. Returns an error if the id is unknown.
//
// Because validateStarters() already rejected cycles and broken references
// during Load(), this traversal is guaranteed to terminate and to find every
// referenced harness in the index.
func (c *Catalog) ResolveStarter(id string) ([]model.Harness, error) {
	if _, ok := c.starterIndex[id]; !ok {
		return nil, fmt.Errorf("catalog: starter %q not found", id)
	}
	var out []model.Harness
	seen := make(map[string]bool)

	var resolve func(sid string)
	resolve = func(sid string) {
		s := c.starterIndex[sid]
		// First recurse into included starters so that their harnesses appear
		// before the current starter's own harnesses (depth-first, pre-order).
		// This preserves a stable, deterministic ordering.
		for _, inc := range s.Includes {
			resolve(inc)
		}
		for _, hid := range s.Harnesses {
			if !seen[hid] {
				seen[hid] = true
				if h, ok := c.index[hid]; ok {
					out = append(out, h)
				}
			}
		}
	}

	resolve(id)
	return out, nil
}
