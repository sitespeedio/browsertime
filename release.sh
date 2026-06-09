#!/bin/bash
# Releases run on GitHub Actions — see .github/workflows/release.yml. This
# script is a thin wrapper that triggers the workflow and (separately) syncs
# the browsertime help reference and version include into the sibling
# ../sitespeed.io checkout. That sibling write is the one piece of the
# release flow that can only happen on the maintainer's machine.

set -e

case "${1:-}" in
  patch|minor|major)
    gh workflow run release.yml -f releaseType="$1"
    echo "Release workflow triggered. Track it with: gh run watch"
    ;;
  sync-sitespeed-docs)
    if [ -d "../sitespeed.io" ]; then
      echo "Updating ../sitespeed.io browsertime docs and version include…"
      bin/browsertime.js --help > ../sitespeed.io/docs/documentation/browsertime/configuration/config.md
      bin/browsertime.js --version | tr -d '\n' > ../sitespeed.io/docs/_includes/version/browsertime.txt
      echo "  Remember to commit & push the changes in ../sitespeed.io"
    else
      echo "No sitespeed.io checkout at ../sitespeed.io — nothing to sync"
    fi
    ;;
  *)
    cat <<'EOF'
Usage: ./release.sh <patch|minor|major>
       ./release.sh sync-sitespeed-docs

The patch/minor/major form triggers the GitHub Actions release workflow
(.github/workflows/release.yml). The actual release — version bump,
TypeScript declaration regen, npm publish with provenance, SBOM
generation, GitHub release and Docker image build via
building-docker.yml — happens on GitHub from there.

After the release completes:
  git pull origin main
  ./release.sh sync-sitespeed-docs   # only if ../sitespeed.io is checked out

Trusted Publishing on npmjs.com must be configured for the browsertime
package to trust this workflow; without it the publish step fails.
EOF
    exit 1
    ;;
esac
