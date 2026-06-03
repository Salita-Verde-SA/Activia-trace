package external

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/JuanCruzRobledo/jr-stack/internal/filemerge"
	"github.com/JuanCruzRobledo/jr-stack/internal/model"
)

// ── fakeAdapter ───────────────────────────────────────────────────────────

type fakeAdapter struct {
	agent      model.Agent
	configPath string // resolved per-test to a temp path
	strategy   MCPStrategy
}

func (f *fakeAdapter) Agent() model.Agent { return f.agent }
func (f *fakeAdapter) MCPConfigPath(homeDir, serverName string) string {
	if f.configPath != "" {
		return f.configPath
	}
	return filepath.Join(homeDir, "."+string(f.agent), serverName+".json")
}
func (f *fakeAdapter) MCPStrategy() MCPStrategy { return f.strategy }

// ── MCP overlay generation ────────────────────────────────────────────────

func TestBuildOverlay_OpenCode_MergeIntoSettings(t *testing.T) {
	h := harnessWithMethod("mcp", "", "https://mcp.context7.com")
	h.ID = "context7"
	adapter := &fakeAdapter{agent: model.AgentOpenCode, strategy: StrategyMergeIntoSettings}

	overlay := buildOverlay(h, adapter)

	mcp, ok := overlay["mcp"].(map[string]any)
	if !ok {
		t.Fatalf("overlay missing 'mcp' key, got keys: %v", mapKeys(overlay))
	}

	server, ok := mcp["context7"].(map[string]any)
	if !ok {
		t.Fatalf("overlay['mcp'] missing 'context7' key")
	}

	if server["type"] != "remote" {
		t.Errorf("type = %v, want remote", server["type"])
	}
	if !strings.Contains(server["url"].(string), "https://mcp.context7.com") {
		t.Errorf("url = %v, want to contain https://mcp.context7.com", server["url"])
	}
	if server["enabled"] != true {
		t.Errorf("enabled = %v, want true", server["enabled"])
	}
}

func TestBuildOverlay_NoHardcodedConstants(t *testing.T) {
	// A completely different harness — the overlay must use its ID and URL,
	// never any hardcoded "context7" or "engram" string.
	h := model.Harness{
		ID:   "custom-mcp",
		Type: model.HarnessExternal,
		External: &model.External{
			Method: "mcp",
			URL:    "https://mcp.example.com",
		},
	}
	adapter := &fakeAdapter{agent: model.AgentOpenCode, strategy: StrategyMergeIntoSettings}
	overlay := buildOverlay(h, adapter)

	mcp, ok := overlay["mcp"].(map[string]any)
	if !ok {
		t.Fatal("overlay missing 'mcp' key")
	}
	if _, exists := mcp["custom-mcp"]; !exists {
		t.Errorf("overlay key should be harness ID 'custom-mcp', got keys: %v", mapKeys(mcp))
	}
	if _, exists := mcp["context7"]; exists {
		t.Error("overlay must not contain hardcoded 'context7' key")
	}
}

func TestBuildOverlay_SeparateFile(t *testing.T) {
	h := harnessWithMethod("mcp", "", "https://mcp.example.com")
	h.ID = "my-server"
	adapter := &fakeAdapter{agent: model.AgentClaude, strategy: StrategySeparateFile}

	overlay := buildOverlay(h, adapter)

	urlVal, ok := overlay["url"].(string)
	if !ok {
		t.Fatalf("SeparateFile overlay should have 'url' at top level, got: %v", overlay)
	}
	if !strings.Contains(urlVal, "https://mcp.example.com") {
		t.Errorf("url = %q, want to contain https://mcp.example.com", urlVal)
	}
}

// ── MCP install: idempotency ───────────────────────────────────────────────

func TestInstallMCP_Idempotent(t *testing.T) {
	homeDir := t.TempDir()

	// Stub backup so it doesn't create real backup directories.
	origSnap := snapshotterCreate
	snapshotterCreate = func(dir string, paths []string) error { return nil }
	defer func() { snapshotterCreate = origSnap }()

	h := model.Harness{
		ID:   "context7",
		Type: model.HarnessExternal,
		External: &model.External{
			Method: "mcp",
			URL:    "https://mcp.context7.com",
		},
	}

	configPath := filepath.Join(homeDir, "opencode.json")
	adapter := &fakeAdapter{
		agent:      model.AgentOpenCode,
		configPath: configPath,
		strategy:   StrategyMergeIntoSettings,
	}

	// First install.
	result1, err := installMCP(context.Background(), h, []AgentAdapter{adapter}, homeDir)
	if err != nil {
		t.Fatalf("first install failed: %v", err)
	}
	if len(result1.ConfigFiles) == 0 {
		t.Error("first install should have written a config file")
	}

	// Second install on same config — should be idempotent.
	result2, err := installMCP(context.Background(), h, []AgentAdapter{adapter}, homeDir)
	if err != nil {
		t.Fatalf("second install failed: %v", err)
	}
	if !result2.AlreadyInstalled {
		t.Error("second install: AlreadyInstalled should be true")
	}
	if len(result2.ConfigFiles) != 0 {
		t.Errorf("second install: ConfigFiles should be empty, got %v", result2.ConfigFiles)
	}
}

// ── MCP install: backup called when file exists ────────────────────────────

func TestInstallMCP_BackupCalledWhenFileExists(t *testing.T) {
	homeDir := t.TempDir()
	configPath := filepath.Join(homeDir, "existing.json")

	// Write an existing config.
	os.WriteFile(configPath, []byte(`{"other":"value"}`), 0o644)

	var backupCalled bool
	origSnap := snapshotterCreate
	snapshotterCreate = func(dir string, paths []string) error {
		backupCalled = true
		return nil
	}
	defer func() { snapshotterCreate = origSnap }()

	h := model.Harness{
		ID:   "context7",
		Type: model.HarnessExternal,
		External: &model.External{
			Method: "mcp",
			URL:    "https://mcp.context7.com",
		},
	}
	adapter := &fakeAdapter{
		agent:      model.AgentClaude,
		configPath: configPath,
		strategy:   StrategySeparateFile,
	}

	_, err := installMCP(context.Background(), h, []AgentAdapter{adapter}, homeDir)
	if err != nil {
		t.Fatalf("installMCP failed: %v", err)
	}
	if !backupCalled {
		t.Error("backup was not called for an existing config file")
	}
}

func TestInstallMCP_NoBackupWhenFileAbsent(t *testing.T) {
	homeDir := t.TempDir()
	configPath := filepath.Join(homeDir, "does-not-exist.json")

	var backupCalled bool
	origSnap := snapshotterCreate
	snapshotterCreate = func(dir string, paths []string) error {
		backupCalled = true
		return nil
	}
	defer func() { snapshotterCreate = origSnap }()

	h := model.Harness{
		ID:   "context7",
		Type: model.HarnessExternal,
		External: &model.External{Method: "mcp", URL: "https://mcp.context7.com"},
	}
	adapter := &fakeAdapter{
		agent:      model.AgentClaude,
		configPath: configPath,
		strategy:   StrategySeparateFile,
	}

	_, err := installMCP(context.Background(), h, []AgentAdapter{adapter}, homeDir)
	if err != nil {
		t.Fatalf("installMCP failed: %v", err)
	}
	if backupCalled {
		t.Error("backup should not be called when the file doesn't exist")
	}
}

// ── MCP install: config content validation ────────────────────────────────

func TestInstallMCP_WrittenContentIsValid(t *testing.T) {
	homeDir := t.TempDir()
	configPath := filepath.Join(homeDir, "opencode.json")

	origSnap := snapshotterCreate
	snapshotterCreate = func(dir string, paths []string) error { return nil }
	defer func() { snapshotterCreate = origSnap }()

	h := model.Harness{
		ID:   "context7",
		Type: model.HarnessExternal,
		External: &model.External{
			Method: "mcp",
			URL:    "https://mcp.context7.com",
		},
	}
	adapter := &fakeAdapter{
		agent:      model.AgentOpenCode,
		configPath: configPath,
		strategy:   StrategyMergeIntoSettings,
	}

	_, err := installMCP(context.Background(), h, []AgentAdapter{adapter}, homeDir)
	if err != nil {
		t.Fatalf("installMCP failed: %v", err)
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		t.Fatalf("read config: %v", err)
	}

	var result map[string]any
	if err := json.Unmarshal(data, &result); err != nil {
		t.Fatalf("written config is not valid JSON: %v\ncontent: %s", err, data)
	}

	mcp, ok := result["mcp"].(map[string]any)
	if !ok {
		t.Fatalf("config should have 'mcp' key")
	}
	if _, exists := mcp["context7"]; !exists {
		t.Errorf("config['mcp'] should have 'context7' key, keys: %v", mapKeys(mcp))
	}
}

// ── MCP install: no adapters ──────────────────────────────────────────────

func TestInstallMCP_NoAdapters(t *testing.T) {
	h := harnessWithMethod("mcp", "", "https://mcp.example.com")
	result, err := installMCP(context.Background(), h, nil, t.TempDir())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !result.AlreadyInstalled {
		t.Error("empty adapters should return AlreadyInstalled=true")
	}
}

// ── buildMCPOverlay: Claude project single-file strategy (C-28) ───────────

// TestBuildMCPOverlay_ClaudeProject asserts that buildMCPOverlay returns the
// correct overlay for a model.MCP with Command, Args, and Env:
//   {"mcpServers": {"<Name>": {"command": ..., "args": [...], "env": {...}}}}
//
// No hardcoded server name constants — the overlay key is MCP.Name.
func TestBuildMCPOverlay_ClaudeProject(t *testing.T) {
	mcp := model.MCP{
		Name:    "context7",
		Command: "npx",
		Args:    []string{"-y", "@upstash/context7-mcp"},
		Env:     map[string]string{"DEBUG": "1"},
	}

	overlay := buildMCPOverlay(mcp)

	servers, ok := overlay["mcpServers"].(map[string]any)
	if !ok {
		t.Fatalf("overlay missing 'mcpServers' key, got: %v", overlay)
	}

	server, ok := servers["context7"].(map[string]any)
	if !ok {
		t.Fatalf("mcpServers missing 'context7' key, got keys: %v", mapKeys(servers))
	}

	if server["command"] != "npx" {
		t.Errorf("command = %v, want npx", server["command"])
	}

	args, ok := server["args"].([]string)
	if !ok || len(args) != 2 || args[0] != "-y" || args[1] != "@upstash/context7-mcp" {
		t.Errorf("args = %v, want [-y @upstash/context7-mcp]", server["args"])
	}

	env, ok := server["env"].(map[string]string)
	if !ok || env["DEBUG"] != "1" {
		t.Errorf("env = %v, want {DEBUG:1}", server["env"])
	}
}

// TestBuildMCPOverlay_NoHardcodedName asserts the overlay uses MCP.Name as the
// server key, not any hardcoded string.
func TestBuildMCPOverlay_NoHardcodedName(t *testing.T) {
	mcp := model.MCP{Name: "my-custom-server", Command: "uvx", Args: []string{"mcp-server-fetch"}}

	overlay := buildMCPOverlay(mcp)

	servers, ok := overlay["mcpServers"].(map[string]any)
	if !ok {
		t.Fatal("overlay missing 'mcpServers'")
	}
	if _, exists := servers["my-custom-server"]; !exists {
		t.Errorf("mcpServers should have key 'my-custom-server', got: %v", mapKeys(servers))
	}
	if _, exists := servers["context7"]; exists {
		t.Error("mcpServers must not contain hardcoded 'context7'")
	}
}

// TestBuildMCPOverlay_EnvAbsent asserts that when Env is nil, the env key is
// absent from the overlay (no spurious empty map written to .mcp.json).
func TestBuildMCPOverlay_EnvAbsent(t *testing.T) {
	mcp := model.MCP{Name: "simple", Command: "node", Args: []string{"server.js"}}

	overlay := buildMCPOverlay(mcp)

	servers := overlay["mcpServers"].(map[string]any)
	server := servers["simple"].(map[string]any)

	if _, hasEnv := server["env"]; hasEnv {
		t.Error("env key must not appear when MCP.Env is nil")
	}
}

// ── Idempotent merge for the Claude project case (C-28, 4.4) ─────────────

// TestBuildMCPOverlay_IdempotentMerge asserts that merging the same server
// twice into a .mcp.json yields a single mcpServers.<Name> entry (no duplicate).
// This exercises the filemerge.MergeJSONObjects path used by the installer.
func TestBuildMCPOverlay_IdempotentMerge(t *testing.T) {
	homeDir := t.TempDir()
	configPath := filepath.Join(homeDir, ".mcp.json")

	// Stub backup so it doesn't create real backup directories.
	origSnap := snapshotterCreate
	snapshotterCreate = func(dir string, paths []string) error { return nil }
	defer func() { snapshotterCreate = origSnap }()

	mcp := model.MCP{
		Name:    "context7",
		Command: "npx",
		Args:    []string{"-y", "@upstash/context7-mcp"},
	}

	writeOverlay := func() {
		overlay := buildMCPOverlay(mcp)
		overlayJSON, err := json.Marshal(overlay)
		if err != nil {
			t.Fatalf("json.Marshal: %v", err)
		}
		base := readExistingJSON(configPath)
		merged, err := filemerge.MergeJSONObjects(base, overlayJSON)
		if err != nil {
			t.Fatalf("MergeJSONObjects: %v", err)
		}
		if _, err := filemerge.WriteFileAtomic(configPath, merged, 0o644); err != nil {
			t.Fatalf("WriteFileAtomic: %v", err)
		}
	}

	// First write.
	writeOverlay()
	// Second write (same entry) — idempotent.
	writeOverlay()

	data, err := os.ReadFile(configPath)
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}

	var result map[string]any
	if err := json.Unmarshal(data, &result); err != nil {
		t.Fatalf("written config not valid JSON: %v\n%s", err, data)
	}

	servers, ok := result["mcpServers"].(map[string]any)
	if !ok {
		t.Fatalf("missing mcpServers in %v", result)
	}

	if _, exists := servers["context7"]; !exists {
		t.Errorf("mcpServers should have 'context7', got: %v", mapKeys(servers))
	}

	// Exactly one entry — no duplication from the second write.
	if len(servers) != 1 {
		t.Errorf("mcpServers has %d entries, want exactly 1: %v", len(servers), mapKeys(servers))
	}
}

// ── helpers ───────────────────────────────────────────────────────────────

func mapKeys(m map[string]any) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}
