# Justfile for MCP Manager

set shell := ["bash", "-c"]

# Default recipe
default:
	@just --list

# Build the Electron app
build:
	bun install && bun run build

# Run the app in development mode
dev:
	bun run dev

# Package the app into a DMG and Zip for macOS
package: build
	bun x electron-builder --mac

# Install the app to /Applications
install: package
	@echo "Installing MCP Manager to /Applications..."
	@rm -rf "/Applications/MCP Manager.app"
	@cp -R "release/mac-arm64/MCP Manager.app" /Applications/
	@echo "Successfully installed to /Applications/MCP Manager.app"

# Publish a new release to GitHub
publish:
	@chmod +x publish.sh
	./publish.sh
