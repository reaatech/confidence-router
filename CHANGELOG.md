# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-04-22

### Added
- Core decision engine with route / clarify / fallback logic
- Configurable confidence thresholds with validation
- 47 built-in language configurations for clarification prompts
- Pluggable classifier registry with fallback chain support
- Built-in keyword classifier
- Built-in embedding similarity classifier
- Built-in LLM classifier with OpenAI/Anthropic support
- Threshold optimization via grid-search evaluation harness
- Batch processing support
- Comprehensive test suite with >95% coverage (>98% statement coverage achieved)
- Dual ESM/CJS package distribution
- TypeScript strict-mode support
- GitHub Actions CI workflow
- Usage examples for basic routing, built-in classifiers, custom classifiers, evaluation, and multi-language prompts
