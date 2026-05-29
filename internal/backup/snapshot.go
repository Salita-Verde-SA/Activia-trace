package backup

import (
	"crypto/sha256"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const ManifestFilename = "manifest.json"

// ArchiveFilename is the name of the compressed archive inside a backup directory.
const ArchiveFilename = "snapshot.tar.gz"

// emptyFilesChecksum is the sentinel checksum used when no files exist.
// This allows consecutive zero-file backups to be correctly deduplicated.
var emptyFilesChecksum = fmt.Sprintf("%x", sha256.Sum256(nil))

type Snapshotter struct {
	now func() time.Time
}

func NewSnapshotter() Snapshotter {
	return Snapshotter{now: time.Now}
}

func (s Snapshotter) Create(snapshotDir string, paths []string) (Manifest, error) {
	return s.CreateWithDirHints(snapshotDir, paths, nil)
}

// CreateWithDirHints is like Create but accepts a set of paths known to be
// directories (even if they do not exist on disk yet). This allows the snapshot
// to record IsDir=true for directories that will be created by the install,
// so the restore can use RemoveAll instead of Remove when rolling back.
//
// dirHints is a set of absolute paths (keys are the path strings, value is
// unused). Paths listed in dirHints that do not exist on disk are recorded as
// Existed=false, IsDir=true in the manifest.
func (s Snapshotter) CreateWithDirHints(snapshotDir string, paths []string, dirHints map[string]bool) (Manifest, error) {
	if err := os.MkdirAll(snapshotDir, 0o755); err != nil {
		return Manifest{}, fmt.Errorf("create snapshot directory %q: %w", snapshotDir, err)
	}

	manifest := Manifest{
		ID:         filepath.Base(snapshotDir),
		CreatedAt:  s.now().UTC(),
		RootDir:    snapshotDir,
		Entries:    make([]ManifestEntry, 0, len(paths)),
		Compressed: true,
	}

	// Collect archive entries and build manifest entries in one pass.
	var archiveEntries []ArchiveEntry
	var existingPaths []string

	for _, path := range paths {
		isDirHint := dirHints[filepath.Clean(path)]
		entry, archiveEntry, err := s.buildEntry(path, isDirHint)
		if err != nil {
			return Manifest{}, err
		}
		manifest.Entries = append(manifest.Entries, entry)
		if entry.Existed && !entry.IsDir {
			manifest.FileCount++
			archiveEntries = append(archiveEntries, archiveEntry)
			existingPaths = append(existingPaths, archiveEntry.SourcePath)
		}
	}

	// Create the tar.gz archive with all existing files.
	// Skip archive creation when there are no files to back up.
	if len(archiveEntries) == 0 {
		manifest.Compressed = false
	} else {
		archivePath := filepath.Join(snapshotDir, ArchiveFilename)
		if err := CreateArchive(archivePath, archiveEntries); err != nil {
			return Manifest{}, fmt.Errorf("create archive %q: %w", archivePath, err)
		}
	}

	// Compute checksum from the source files for deduplication.
	// When there are no files, use the SHA-256 of the empty string as a stable
	// sentinel so consecutive zero-file backups are correctly detected as duplicates.
	var checksum string
	if len(existingPaths) == 0 {
		checksum = emptyFilesChecksum
	} else {
		var csErr error
		checksum, csErr = ComputeChecksum(existingPaths)
		if csErr != nil {
			// Non-fatal: skip checksum rather than failing the entire backup.
			log.Printf("backup: compute checksum: %v", csErr)
			checksum = ""
		}
	}
	manifest.Checksum = checksum

	// Write manifest.json outside the archive.
	if err := WriteManifest(filepath.Join(snapshotDir, ManifestFilename), manifest); err != nil {
		return Manifest{}, err
	}

	return manifest, nil
}

// buildEntry inspects a single source path and returns the ManifestEntry and
// (when the file exists and is not a directory) the ArchiveEntry to include in
// the archive.
//
// isDirHint must be true when the caller knows the path is intended to be a
// directory even if it does not exist on disk yet (e.g. a SkillsDir that will
// be created by the install step). When the path exists on disk the actual
// os.Stat result takes precedence over isDirHint.
func (s Snapshotter) buildEntry(sourcePath string, isDirHint bool) (ManifestEntry, ArchiveEntry, error) {
	cleanSource := filepath.Clean(sourcePath)
	entry := ManifestEntry{OriginalPath: cleanSource}

	info, err := os.Stat(cleanSource)
	if err != nil {
		if os.IsNotExist(err) {
			// Path does not exist yet. Record IsDir from the hint so the restore
			// can choose RemoveAll (dir) vs Remove (file) when rolling back.
			entry.IsDir = isDirHint
			return entry, ArchiveEntry{}, nil
		}
		return ManifestEntry{}, ArchiveEntry{}, fmt.Errorf("stat source path %q: %w", cleanSource, err)
	}

	if info.IsDir() {
		// Directory exists on disk. Record Existed=true, IsDir=true so the
		// restore takes the NO-OP branch (SAFETY: never wipe preexisting dirs).
		entry.Existed = true
		entry.IsDir = true
		return entry, ArchiveEntry{}, nil
	}

	// Regular file: build the relative path inside the archive.
	relative := strings.TrimPrefix(cleanSource, filepath.VolumeName(cleanSource))
	relative = strings.TrimPrefix(relative, string(filepath.Separator))
	if relative == "" {
		relative = "root"
	}

	relPath := filepath.ToSlash(filepath.Join("files", relative))

	archiveEntry := ArchiveEntry{
		RelPath:    relPath,
		SourcePath: cleanSource,
		Mode:       info.Mode(),
	}

	entry.SnapshotPath = relPath
	entry.Existed = true
	entry.Mode = uint32(info.Mode())

	return entry, archiveEntry, nil
}
