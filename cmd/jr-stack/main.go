// Command jr-stack is the JR Stack installer — a methodology-first harness
// installer for AI coding agents.
//
// Usage:
//
//	jr-stack install   Launch the interactive TUI install flow.
package main

import (
	"fmt"
	"os"

	"github.com/JuanCruzRobledo/jr-stack/assets"
	"github.com/JuanCruzRobledo/jr-stack/internal/agents"
	"github.com/JuanCruzRobledo/jr-stack/internal/catalog"
	"github.com/JuanCruzRobledo/jr-stack/internal/install"
	"github.com/JuanCruzRobledo/jr-stack/internal/model"
	"github.com/JuanCruzRobledo/jr-stack/internal/tui"
	"github.com/JuanCruzRobledo/jr-stack/internal/verify"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Usage: jr-stack <command>\n")
		fmt.Fprintf(os.Stderr, "Commands:\n")
		fmt.Fprintf(os.Stderr, "  install   Launch the interactive install flow\n")
		os.Exit(1)
	}

	switch os.Args[1] {
	case "install":
		if err := runInstall(); err != nil {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
			os.Exit(1)
		}
	default:
		fmt.Fprintf(os.Stderr, "unknown command: %q\n", os.Args[1])
		os.Exit(1)
	}
}

// agentRegistryAdapter wraps *agents.Registry to satisfy install.Registry.
// Both registry types have the same Get signature except for the return type
// name (agents.Adapter vs install.AgentAdapter), and agents.Adapter is a
// structural superset of install.AgentAdapter, so the wrapper is just a cast.
type agentRegistryAdapter struct{ r *agents.Registry }

func (a agentRegistryAdapter) Get(agent model.Agent) (install.AgentAdapter, bool) {
	adapter, ok := a.r.Get(agent)
	if !ok {
		return nil, false
	}
	return adapter, true
}

func runInstall() error {
	// 1. Load the embedded catalog.
	cat, err := catalog.Load()
	if err != nil {
		return fmt.Errorf("load catalog: %w", err)
	}

	// 2. Build the default agent registry (P0: claude + opencode).
	reg, err := agents.NewDefaultRegistry()
	if err != nil {
		return fmt.Errorf("create agent registry: %w", err)
	}

	// 3. Resolve home directory.
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("resolve home dir: %w", err)
	}

	// 4. Detect installed agents; intersect with registered adapters.
	detectedAgents := tui.DetectInstalledAgents(homeDir)
	availableAgents := tui.AvailableAgentsList(detectedAgents, reg.SupportedAgents())

	// Wrap the registry to satisfy install.Registry.
	regWrapper := agentRegistryAdapter{r: reg}

	// 5. Build the TUI deps with the embedded skills FS wired.
	deps := tui.ModelDeps{
		Catalog:         cat,
		Registry:        regWrapper,
		HomeDir:         homeDir,
		AvailableAgents: availableAgents,
		BuildPlanFn: func(c install.Catalog, intent install.Intent, opts install.Options) (install.Plan, error) {
			opts = install.WithEmbeddedSkillsFS(opts, assets.SkillsFS)

			// Wire the post-install verify hook.
			// Resolve adapters for the intent's agents; collect selected harnesses.
			// verify.Adapter is a structural subset of install.AgentAdapter — no cast needed.
			verifyAdapters := resolveVerifyAdapters(intent.Agents, reg)
			selectedHarnesses := collectSelectedHarnesses(c, intent)
			opts.VerifyHook = verify.BuildHook(selectedHarnesses, verifyAdapters, opts.HomeDir)

			return install.BuildPlan(c, intent, opts)
		},
	}

	// 6. Launch the TUI program.
	p := tui.NewProgram(deps)
	if _, err := p.Run(); err != nil {
		return fmt.Errorf("tui: %w", err)
	}
	return nil
}

// resolveVerifyAdapters resolves the concrete adapters for the given agents from
// the registry and narrows them to verify.Adapter via structural typing.
// agents.Adapter is a superset of verify.Adapter, so the assignment is valid.
func resolveVerifyAdapters(agentList []model.Agent, reg *agents.Registry) []verify.Adapter {
	out := make([]verify.Adapter, 0, len(agentList))
	for _, a := range agentList {
		adapter, ok := reg.Get(a)
		if !ok {
			continue
		}
		out = append(out, adapter)
	}
	return out
}

// collectSelectedHarnesses returns the harnesses that would be selected for the
// given intent. It mirrors the selection logic in install.BuildPlan (selectHarnesses),
// without the dependency resolution step — just the top-level set selected by mode/custom.
func collectSelectedHarnesses(c install.Catalog, intent install.Intent) []model.Harness {
	switch intent.Mode {
	case model.ModeCustom:
		var out []model.Harness
		for _, id := range intent.Custom {
			if h, ok := c.ByID(id); ok {
				out = append(out, h)
			}
		}
		return filterHarnessesByAgents(out, intent.Agents)
	default:
		candidates := c.ForMode(intent.Mode)
		return filterHarnessesByAgents(candidates, intent.Agents)
	}
}

// filterHarnessesByAgents returns harnesses that support at least one of the
// given agents. If agents is empty, all harnesses are returned.
func filterHarnessesByAgents(harnesses []model.Harness, agentList []model.Agent) []model.Harness {
	if len(agentList) == 0 {
		return harnesses
	}
	var out []model.Harness
	for _, h := range harnesses {
		for _, a := range agentList {
			if h.SupportsAgent(a) {
				out = append(out, h)
				break
			}
		}
	}
	return out
}
