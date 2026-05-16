# Changelog

All notable changes to this project will be documented in this file.
Format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]
### Added
- "Wipe All Data" button to the dashboard for easier debugging and testing.

### Fixed
- Improved dashboard layout responsiveness for action buttons on mobile devices.
- Optimized performance and robustness of Indonesian transaction date parsing.
- Transaction date parsing for bank emails with Indonesian month names (e.g., "Mei", "Agt", "Oktober").
- `invalid_grant` error by implementing automatic Google OAuth token refresh and forcing token updates on sign-in.
- Graceful re-authentication prompt when Google sessions are irrecoverably expired.

### Security
- Added production environment guard to "Wipe All Data" action to prevent accidental data deletion.
