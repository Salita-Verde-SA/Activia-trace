package command

import (
	"bytes"
	"fmt"
	"os"
)

// checkIdempotent inspects the destination file at destPath and compares
// its content against newContent.
//
// Returns:
//   - identical=true when the existing content matches — caller must no-op.
//   - identical=false, nil error when different (or absent) — caller must backup then overwrite.
//   - identical=false, non-nil error when the existing file cannot be read.
//
// Mirrors internal/harness/skill/idempotent.go checkIdempotent.
func checkIdempotent(destPath string, newContent []byte) (identical bool, err error) {
	data, err := os.ReadFile(destPath)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil // fresh install — not identical, no error
		}
		return false, fmt.Errorf("command: read existing file %q: %w", destPath, err)
	}
	return bytes.Equal(data, newContent), nil
}
