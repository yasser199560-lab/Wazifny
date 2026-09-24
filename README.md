# Wazifny

Wazifny is a job-matching platform with a Next.js frontend and a FastAPI backend. It supports talent and employer workflows, job search, applications, profiles, and optional AI-assisted features.

## Security notice

This repository is documentation and source code only. Never commit, paste, or publish:

- Database connection strings or database credentials
- JWT secrets, API keys, access tokens, private keys, or certificates
- Email-provider credentials or private deployment configuration
- Real user data, CVs, uploaded files, logs, or production exports
- Working passwords, including development or administrator passwords

Keep secrets in local environment files or a managed secret store. Use [backend/.env.example](backend/.env.example) as a template, replace every placeholder locally, and verify that secret files are ignored before creating a commit. If a secret has ever been exposed, revoke it and create a replacement immediately.

## Project structure

```text
wazifny/
|-- frontend/    Next.js application
|-- backend/     FastAPI application
`-- docs/        Project documentation
```

The backend uses MongoDB. AI providers and email delivery are optional integrations configured only through environment variables.

## Local development

### Backend

```bash
cd backend
python -m venv .venv

# macOS/Linux
source .venv/bin/activate

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
Copy-Item .env.example .env       # Windows PowerShell
# macOS/Linux: cp .env.example .env
```

Edit `.env` locally. Use a strong, randomly generated `JWT_SECRET_KEY`, a least-privilege database user, and a database network policy that permits only trusted environments. Do not use production credentials for local development.

Start the API:

```bash
uvicorn app.main:app --reload
```

The local API is normally available at `http://localhost:8000`. Keep development-only API documentation and debug settings disabled in production.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Configure the frontend API URL in a local environment file according to the frontend configuration used by your deployment. Never expose private keys through a variable prefixed with `NEXT_PUBLIC_` or otherwise bundled into browser code.

Useful commands:

```bash
npm run lint
npm run build
npm start
```

## Production checklist

Before deployment:

1. Set `ENVIRONMENT` to the production value and use a strong unique JWT secret.
2. Restrict `CORS_ORIGINS` to the exact trusted frontend origins; do not use `*` with authenticated requests.
3. Use HTTPS for the frontend, API, password-reset links, and email-provider callbacks.
4. Use separate production credentials and databases, with least-privilege database access.
5. Store secrets in the deployment platform's secret manager, not in the repository or image.
6. Verify email domains with SPF/DKIM and use a sender address on the verified domain.
7. Disable or protect interactive API documentation if it is not required publicly.
8. Configure rate limiting, secure cookies/token storage, request-size limits, file validation, backups, and monitoring at the edge and application layers.
9. Review authorization for every role and resource before exposing the application publicly.
10. Run dependency, secret, and vulnerability scans in CI, and review logs to ensure they contain no tokens, passwords, CV contents, or sensitive personal data.

## Data and AI handling

CVs, profiles, applications, and messages may contain personal information. Treat them as confidential, collect only what is needed, restrict access by role, and define retention and deletion procedures before production use. AI output is advisory and must be validated by an authorized person; do not send confidential data to an AI provider unless the provider, contract, and data-processing configuration are approved for that use.

## Contributions

Before opening a pull request, inspect the diff for secrets and personal data, run the available lint/build checks, and confirm that environment files and generated artifacts are not included. Report security issues privately to the project owner rather than publishing exploit details.

## License

No license is specified yet. Do not redistribute or deploy this code as a third-party product without permission from the project owner.
