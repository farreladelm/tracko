# Changelog

All notable changes to this project will be documented in this file.
Format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Added hybrid Gmail bank notification parsing using local regex templates.
- Added self-learning bank notification engine that dynamically compiles and matches regex patterns using Gemini.
- Added automatic default category seeding on user registration / first sign in.
- Added Playwright end-to-end integration test suite for Gmail sync flows.

### Changed
- Optimized database query load by replacing N+1 category lookups with in-memory array filtering.
