# Changelog

All notable changes to this project will be documented in this file.
Format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]
### Fixed
- Fixed `invalid_grant` error by implementing automatic Google OAuth token refresh and forcing token updates on sign-in.
- Added graceful re-authentication prompt when Google sessions are irrecoverably expired.
