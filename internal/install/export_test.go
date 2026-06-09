package install

// This file exports unexported symbols for use in the install_test package.
// It is compiled ONLY during `go test` and must not be imported by production code.

// CopyBinaryRenameReplace is the exported test shim for copyBinaryRenameReplace.
var CopyBinaryRenameReplace = copyBinaryRenameReplace
