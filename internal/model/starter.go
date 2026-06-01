package model

import "fmt"

// MCP represents a project-scope MCP entry in a starter.
//
// (TBD) The exact fields (Command, Args, Transport, etc.) are decided in C-28
// when .mcp.json writing is implemented. For now this type carries only the
// name so the field can transport the datum without inventing the final shape.
type MCP struct {
	Name string `yaml:"name"`
}

// Starter is a curated, composable bundle of harnesses and project-scope MCPs.
// It is a distinct domain concept from Harness: while a Harness is an
// installable module, a Starter is a curation layer (think Spring Boot starters)
// that groups harnesses for a specific project domain.
//
// Fields:
//   - ID:          unique identifier within the catalog (e.g. "active-ia").
//   - Name:        human-readable display name.
//   - Description: optional longer description.
//   - Harnesses:   list of harness IDs from the catalog that this starter directly bundles.
//   - Includes:    list of other starter IDs this starter composes (composable via includes).
//   - MCPs:        placeholder list of project-scope MCPs. Writing .mcp.json is C-28.
//                  (TBD) shape will be enriched in C-28 without breaking this model.
type Starter struct {
	ID          string   `yaml:"id"`
	Name        string   `yaml:"name"`
	Description string   `yaml:"description,omitempty"`
	Harnesses   []string `yaml:"harnesses,omitempty"`
	Includes    []string `yaml:"includes,omitempty"`
	MCPs        []MCP    `yaml:"mcps,omitempty"` // (TBD) shape — see MCP comment above
}

// Validate performs field-level validation on this Starter's own fields.
// It does NOT validate references to harnesses or other starters in the catalog
// (that is the catalog's responsibility). Returns an error naming the offending
// field when validation fails.
func (s Starter) Validate() error {
	if s.ID == "" {
		return fmt.Errorf("starter: missing required field 'id'")
	}
	if s.Name == "" {
		return fmt.Errorf("starter %q: missing required field 'name'", s.ID)
	}
	return nil
}
