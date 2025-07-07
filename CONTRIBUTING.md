# Contributing to SelenoVision

Thank you for your interest in contributing to SelenoVision! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for all contributors.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB
- Git
- Docker (optional)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/skmirajulislam/SelenoVision.git
   cd SelenoVision
   ```

## Development Setup

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Configure your .env file
python app.py
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Configure your environment variables
npm run dev
```

### Luna Processor Setup

```bash
cd luna
pip install -r requirements.txt
# Configure luna_config.py if needed
```

## Contributing Guidelines

### Types of Contributions

- **Bug fixes**: Fix existing issues
- **Feature enhancements**: Improve existing functionality
- **New features**: Add new capabilities
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Performance**: Optimize existing code

### Before Contributing

1. Check existing issues and pull requests
2. Create an issue for new features or major changes
3. Discuss your approach before implementing
4. Ensure your changes align with project goals

## Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Changes

- Write clean, readable code
- Follow coding standards
- Add tests for new functionality
- Update documentation as needed

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add comprehensive analysis visualization

- Add comprehensive_analysis.png to database model
- Include image in Cloudinary upload process
- Display image in frontend Visualizations section
- Add download functionality for new image type

Closes #123"
```

### Commit Message Format

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create a pull request with:
- Clear title and description
- Reference related issues
- Screenshots for UI changes
- Testing instructions

### 5. Code Review

- Address reviewer feedback
- Keep PR updated with main branch
- Ensure all checks pass

## Issue Reporting

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs if applicable
- Environment details (OS, browser, versions)

### Feature Requests

Include:
- Clear description of the feature
- Use case and benefits
- Potential implementation approach
- Mockups or examples if applicable

### Issue Templates

Use the provided issue templates:
- Bug Report
- Feature Request
- Documentation Improvement

## Coding Standards

### Python (Backend/Luna)

```python
# Use Black for formatting
black .

# Use flake8 for linting
flake8 .

# Use type hints
def process_image(image_path: str) -> Dict[str, Any]:
    """Process lunar image and return analysis results."""
    pass
```

### JavaScript/TypeScript (Frontend)

```typescript
// Use Prettier for formatting
npm run format

// Use ESLint for linting
npm run lint

// Use TypeScript for type safety
interface ProcessingResult {
  job_id: string;
  status: 'completed' | 'processing' | 'failed';
  cloudinary_urls: CloudinaryUrls;
}
```

### General Guidelines

- Write self-documenting code
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Follow existing patterns in the codebase

## Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
python -m pytest tests/ --cov=app
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

### Integration Tests

```bash
# Run full test suite
npm run test:e2e
```

### Test Guidelines

- Write tests for new features
- Maintain existing test coverage
- Use descriptive test names
- Mock external dependencies
- Test both success and error cases

## Documentation

### Code Documentation

- Document all public functions/classes
- Use docstrings for Python
- Use JSDoc for JavaScript/TypeScript
- Include examples in documentation

### README Updates

- Update README for new features
- Keep installation instructions current
- Add new configuration options
- Update API documentation

### API Documentation

- Document new endpoints
- Include request/response examples
- Update OpenAPI/Swagger specs
- Test documentation examples

## Development Workflow

### Daily Development

1. Pull latest changes:
   ```bash
   git checkout main
   git pull upstream main
   ```

2. Create feature branch:
   ```bash
   git checkout -b feature/new-feature
   ```

3. Make changes and test locally

4. Commit and push changes

5. Create pull request

### Release Process

1. Update version numbers
2. Update CHANGELOG.md
3. Create release branch
4. Test release candidate
5. Merge to main
6. Tag release
7. Deploy to production

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Email**: [maintainer-email] for private matters

### Resources

- [Project Documentation](README.md)
- [API Documentation](docs/api.md)
- [Architecture Overview](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)

## Recognition

Contributors will be:
- Listed in the Contributors section
- Mentioned in release notes
- Invited to join the maintainers team (for significant contributions)

## License

By contributing to SelenoVision, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to SelenoVision!
