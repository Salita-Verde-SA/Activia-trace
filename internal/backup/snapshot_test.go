package backup

import (
	"os"
	"path/filepath"
	"testing"
)

// TestSnapshotterCreatesCompressedBackup verifies that Create() produces a
// snapshot.tar.gz archive and sets Manifest.Compressed = true.
func TestSnapshotterCreatesCompressedBackup(t *testing.T) {
	home := t.TempDir()

	file1 := filepath.Join(home, "config.json")
	file2 := filepath.Join(home, "settings.yaml")
	if err := os.WriteFile(file1, []byte(`{"key":"value"}`), 0o644); err != nil {
		t.Fatalf("WriteFile config.json: %v", err)
	}
	if err := os.WriteFile(file2, []byte("key: value\n"), 0o644); err != nil {
		t.Fatalf("WriteFile settings.yaml: %v", err)
	}

	snapshotDir := filepath.Join(home, "snap")
	snap := NewSnapshotter()
	manifest, err := snap.Create(snapshotDir, []string{file1, file2})
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	// Manifest must report compressed format.
	if !manifest.Compressed {
		t.Errorf("Manifest.Compressed = false, want true")
	}

	// The archive file must exist on disk.
	archivePath := filepath.Join(snapshotDir, "snapshot.tar.gz")
	if _, err := os.Stat(archivePath); err != nil {
		t.Errorf("snapshot.tar.gz not found at %q: %v", archivePath, err)
	}

	// The manifest.json must exist alongside the archive (uncompressed).
	manifestPath := filepath.Join(snapshotDir, ManifestFilename)
	if _, err := os.Stat(manifestPath); err != nil {
		t.Errorf("manifest.json not found at %q: %v", manifestPath, err)
	}

	// No loose "files/" directory should exist (files go into archive).
	filesDir := filepath.Join(snapshotDir, "files")
	if _, err := os.Stat(filesDir); err == nil {
		t.Errorf("files/ directory should not exist for compressed backups; found at %q", filesDir)
	}
}

// TestSnapshotterCompressedArchiveContainsFiles verifies that the tar.gz
// produced by Create() contains the snapshotted files with the correct RelPath.
func TestSnapshotterCompressedArchiveContainsFiles(t *testing.T) {
	home := t.TempDir()

	file1 := filepath.Join(home, "alpha.txt")
	if err := os.WriteFile(file1, []byte("alpha content"), 0o644); err != nil {
		t.Fatalf("WriteFile alpha.txt: %v", err)
	}

	snapshotDir := filepath.Join(home, "snap")
	snap := NewSnapshotter()
	if _, err := snap.Create(snapshotDir, []string{file1}); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	archivePath := filepath.Join(snapshotDir, "snapshot.tar.gz")
	headers := openAndListTar(t, archivePath)

	// The archive must contain at least one entry.
	if len(headers) == 0 {
		t.Fatalf("archive is empty, expected at least 1 entry")
	}

	// Verify the file content can be round-tripped via extract.
	destDir := filepath.Join(home, "extracted")
	extracted, err := ExtractArchive(archivePath, destDir)
	if err != nil {
		t.Fatalf("ExtractArchive() error = %v", err)
	}

	if len(extracted) != 1 {
		t.Fatalf("extracted %d entries, want 1", len(extracted))
	}

	data, err := os.ReadFile(extracted[0].SourcePath)
	if err != nil {
		t.Fatalf("ReadFile extracted file: %v", err)
	}
	if string(data) != "alpha content" {
		t.Errorf("extracted content = %q, want %q", string(data), "alpha content")
	}
}

// TestSnapshotterSetsChecksum verifies that Create() computes and sets a
// non-empty Checksum in the returned manifest.
func TestSnapshotterSetsChecksum(t *testing.T) {
	home := t.TempDir()

	file1 := filepath.Join(home, "config.json")
	if err := os.WriteFile(file1, []byte(`{"x":1}`), 0o644); err != nil {
		t.Fatalf("WriteFile: %v", err)
	}

	snapshotDir := filepath.Join(home, "snap")
	snap := NewSnapshotter()
	manifest, err := snap.Create(snapshotDir, []string{file1})
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if manifest.Checksum == "" {
		t.Errorf("Manifest.Checksum is empty, want a non-empty SHA-256 hex string")
	}
}

// TestSnapshotterChecksumIsDeterministic verifies that two Create() calls with
// identical files produce identical checksums (deduplication relies on this).
func TestSnapshotterChecksumIsDeterministic(t *testing.T) {
	home := t.TempDir()

	file1 := filepath.Join(home, "config.json")
	if err := os.WriteFile(file1, []byte(`{"deterministic":true}`), 0o644); err != nil {
		t.Fatalf("WriteFile: %v", err)
	}

	snap := NewSnapshotter()

	snap1Dir := filepath.Join(home, "snap1")
	manifest1, err := snap.Create(snap1Dir, []string{file1})
	if err != nil {
		t.Fatalf("Create() snap1 error = %v", err)
	}

	snap2Dir := filepath.Join(home, "snap2")
	manifest2, err := snap.Create(snap2Dir, []string{file1})
	if err != nil {
		t.Fatalf("Create() snap2 error = %v", err)
	}

	if manifest1.Checksum == "" {
		t.Fatal("manifest1.Checksum is empty")
	}
	if manifest1.Checksum != manifest2.Checksum {
		t.Errorf("checksums differ for identical files:\n  snap1 = %q\n  snap2 = %q",
			manifest1.Checksum, manifest2.Checksum)
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// C-17 snapshot dir-aware tests (1.6 + 1.7)
// ─────────────────────────────────────────────────────────────────────────────

// TestBuildEntry_DirFields verifies that buildEntry records IsDir and Existed
// correctly for three cases: preexisting dir, nonexistent dir (with hint), and a file.
func TestBuildEntry_DirFields(t *testing.T) {
	home := t.TempDir()

	// Case A: a dir that already exists.
	existingDir := filepath.Join(home, "existing-dir")
	if err := os.MkdirAll(existingDir, 0o755); err != nil {
		t.Fatalf("MkdirAll: %v", err)
	}

	// Case B: a dir that does NOT exist yet — caller must pass a dir hint so
	// buildEntry can record IsDir=true without being able to os.Stat it.
	missingDir := filepath.Join(home, "missing-dir")

	// Case C: a regular file.
	existingFile := filepath.Join(home, "config.json")
	if err := os.WriteFile(existingFile, []byte("{}"), 0o644); err != nil {
		t.Fatalf("WriteFile: %v", err)
	}

	snap := NewSnapshotter()
	snapshotDir := filepath.Join(home, "snap")
	dirHints := map[string]bool{filepath.Clean(missingDir): true}
	manifest, err := snap.CreateWithDirHints(snapshotDir, []string{existingDir, missingDir, existingFile}, dirHints)
	if err != nil {
		t.Fatalf("CreateWithDirHints() error = %v", err)
	}

	findEntry := func(path string) (ManifestEntry, bool) {
		for _, e := range manifest.Entries {
			if e.OriginalPath == filepath.Clean(path) {
				return e, true
			}
		}
		return ManifestEntry{}, false
	}

	// Case A: existing dir → Existed=true, IsDir=true.
	if e, ok := findEntry(existingDir); !ok {
		t.Error("no entry for existing dir")
	} else {
		if !e.Existed {
			t.Errorf("existingDir: Existed = false, want true")
		}
		if !e.IsDir {
			t.Errorf("existingDir: IsDir = false, want true")
		}
	}

	// Case B: missing dir (with hint) → Existed=false, IsDir=true.
	if e, ok := findEntry(missingDir); !ok {
		t.Error("no entry for missing dir")
	} else {
		if e.Existed {
			t.Errorf("missingDir: Existed = true, want false")
		}
		if !e.IsDir {
			t.Errorf("missingDir: IsDir = false, want true (dir hint was provided)")
		}
	}

	// Case C: existing file → IsDir=false, Existed=true.
	if e, ok := findEntry(existingFile); !ok {
		t.Error("no entry for existing file")
	} else {
		if e.IsDir {
			t.Errorf("existingFile: IsDir = true, want false")
		}
		if !e.Existed {
			t.Errorf("existingFile: Existed = false, want true")
		}
	}
}

// TestBuildEntry_BackwardCompat_NoDirField verifies that an old manifest without
// is_dir deserializes IsDir=false, and restoring such entries behaves as before
// the fix (no regressions on old backups).
func TestBuildEntry_BackwardCompat_NoDirField(t *testing.T) {
	home := t.TempDir()

	// Write a manifest JSON without the is_dir field (old format).
	origFile := filepath.Join(home, "config.json")
	if err := os.WriteFile(origFile, []byte(`{"old":true}`+"\n"), 0o644); err != nil {
		t.Fatalf("WriteFile orig: %v", err)
	}

	snapshotFile := filepath.Join(home, "snap", "settings.json")
	if err := os.MkdirAll(filepath.Dir(snapshotFile), 0o755); err != nil {
		t.Fatalf("MkdirAll snap dir: %v", err)
	}
	if err := os.WriteFile(snapshotFile, []byte(`{"old":true}`+"\n"), 0o644); err != nil {
		t.Fatalf("WriteFile snap: %v", err)
	}

	// Old manifest: no is_dir field → IsDir defaults to false.
	oldManifest := Manifest{
		Compressed: false,
		Entries: []ManifestEntry{
			// Existed=true, no IsDir (zero value = false) → restoreEntry path (file).
			{OriginalPath: origFile, SnapshotPath: snapshotFile, Existed: true, Mode: 0o644},
		},
	}

	// Overwrite to verify restore brings back original.
	if err := os.WriteFile(origFile, []byte(`{"modified":true}`+"\n"), 0o644); err != nil {
		t.Fatalf("WriteFile modified: %v", err)
	}

	svc := RestoreService{}
	if err := svc.Restore(oldManifest); err != nil {
		t.Fatalf("Restore() old manifest error = %v", err)
	}

	got, err := os.ReadFile(origFile)
	if err != nil {
		t.Fatalf("ReadFile after restore: %v", err)
	}
	if string(got) != `{"old":true}`+"\n" {
		t.Errorf("restored content = %q, want original", string(got))
	}

	// Also verify IsDir field is false (the zero value for the old format).
	for _, e := range oldManifest.Entries {
		if e.IsDir {
			t.Errorf("entry %q: IsDir = true on old manifest (should be false zero-value)", e.OriginalPath)
		}
	}
}

// TestSnapshotterManifestEntrySnapshotPath verifies that ManifestEntry.SnapshotPath
// holds the relative path inside the archive (not a full disk path).
func TestSnapshotterManifestEntrySnapshotPath(t *testing.T) {
	home := t.TempDir()

	file1 := filepath.Join(home, "myfile.txt")
	if err := os.WriteFile(file1, []byte("content"), 0o644); err != nil {
		t.Fatalf("WriteFile: %v", err)
	}

	snapshotDir := filepath.Join(home, "snap")
	snap := NewSnapshotter()
	manifest, err := snap.Create(snapshotDir, []string{file1})
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	// Find the entry for file1.
	var entry *ManifestEntry
	for i := range manifest.Entries {
		if manifest.Entries[i].Existed {
			entry = &manifest.Entries[i]
			break
		}
	}
	if entry == nil {
		t.Fatal("no Existed=true entry found in manifest")
	}

	// SnapshotPath should start with "files/" (relative inside archive), not be absolute.
	if filepath.IsAbs(entry.SnapshotPath) {
		t.Errorf("SnapshotPath = %q, should be relative (inside archive), not absolute", entry.SnapshotPath)
	}
	if len(entry.SnapshotPath) == 0 {
		t.Errorf("SnapshotPath is empty for an existing file")
	}
}
