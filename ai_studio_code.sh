#!/usr/bin/env bash
set -e

echo "Building production assets for GitHub Pages..."
npm run build

echo "Staging files..."
git add .

echo "Committing updates..."
git commit -m "Update Kin Media Production with live Instagram video reels and authentic portfolio" || echo "No changes to commit"

echo "Pushing to GitHub..."
git push origin main

echo "Done! If your GitHub repository is configured with Settings > Pages > Source: GitHub Actions, your site will deploy automatically."