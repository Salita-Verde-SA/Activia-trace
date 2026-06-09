package verify

import (
	"fmt"
	"strings"
)

const readyMessage = "Installation verified. You're ready to start building."

// Report is the aggregated result of all health checks.
type Report struct {
	Checks    []CheckResult
	Passed    int
	Failed    int
	Skipped   int
	Warnings  int
	Ready     bool
	FinalNote string
}

// BuildReport aggregates check results into a Report.
// Ready is true only when Failed == 0 (warnings and skips are non-blocking).
func BuildReport(results []CheckResult) Report {
	report := Report{Checks: append([]CheckResult(nil), results...)}
	for _, result := range results {
		switch result.Status {
		case CheckStatusPassed:
			report.Passed++
		case CheckStatusFailed:
			report.Failed++
		case CheckStatusSkipped:
			report.Skipped++
		case CheckStatusWarning:
			report.Warnings++
		}
	}

	report.Ready = report.Failed == 0
	if report.Ready {
		report.FinalNote = readyMessage
	} else {
		report.FinalNote = "Installation completed with verification issues. Run repair on failed checks."
	}

	return report
}

// RenderReport returns a human-readable string representation of the report.
// Each check is rendered as one line; the final note closes the output.
func RenderReport(report Report) string {
	var b strings.Builder
	fmt.Fprintf(&b, "Verification checks: %d passed, %d failed, %d warnings, %d skipped\n",
		report.Passed, report.Failed, report.Warnings, report.Skipped)

	for _, check := range report.Checks {
		line := "[ ]"
		switch check.Status {
		case CheckStatusPassed:
			line = "[ok]"
		case CheckStatusFailed:
			line = "[!!]"
		case CheckStatusWarning:
			line = "[??]"
		case CheckStatusSkipped:
			line = "[--]"
		}

		fmt.Fprintf(&b, "%s %s", line, check.ID)
		if check.Description != "" {
			fmt.Fprintf(&b, " - %s", check.Description)
		}
		if check.Error != "" {
			fmt.Fprintf(&b, " (%s)", check.Error)
		}
		b.WriteString("\n")
	}

	b.WriteString(report.FinalNote)
	if !strings.HasSuffix(report.FinalNote, "\n") {
		b.WriteString("\n")
	}

	return b.String()
}
