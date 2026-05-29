// Package verify provides the post-install health-check engine.
//
// It exposes a Check type, a RunChecks executor, and a Report builder/renderer.
// Harness-aware check builders live in harness_checks.go.
// The verify hook constructor (wired into install.Options.VerifyHook) lives in hook.go.
package verify

import "context"

// CheckStatus is the outcome of running a single Check.
type CheckStatus string

const (
	CheckStatusPassed  CheckStatus = "passed"
	CheckStatusFailed  CheckStatus = "failed"
	CheckStatusSkipped CheckStatus = "skipped"
	CheckStatusWarning CheckStatus = "warning"
)

// Check is a single health check to run after installation.
// A nil Run marks the check as "not yet implemented" — it will be skipped.
// Soft checks produce a warning on failure, never a hard failure.
type Check struct {
	ID          string
	Description string
	Run         func(context.Context) error
	// Soft marks this check as non-blocking: errors produce a warning instead of a failure.
	Soft bool
}

// CheckResult holds the outcome of one Check execution.
type CheckResult struct {
	ID          string
	Description string
	Status      CheckStatus
	Error       string
}

// RunChecks executes each check in order and returns the results.
// Order is preserved: results[i] corresponds to checks[i].
func RunChecks(ctx context.Context, checks []Check) []CheckResult {
	results := make([]CheckResult, 0, len(checks))
	for _, check := range checks {
		result := CheckResult{ID: check.ID, Description: check.Description}
		if check.Run == nil {
			result.Status = CheckStatusSkipped
			result.Error = "check not implemented"
			results = append(results, result)
			continue
		}

		if err := check.Run(ctx); err != nil {
			if check.Soft {
				result.Status = CheckStatusWarning
			} else {
				result.Status = CheckStatusFailed
			}
			result.Error = err.Error()
			results = append(results, result)
			continue
		}

		result.Status = CheckStatusPassed
		results = append(results, result)
	}

	return results
}
