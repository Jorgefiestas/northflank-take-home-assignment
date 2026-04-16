# Northflank Take-Home Assignment

## Overview

This project implements a REST API that integrates with GitHub and Kubernetes to deploy nginx based on configuration stored in a repository.

The API allows users to:

- Browse their GitHub repositories and branches
- Read and update YAML configuration files
- Deploy and delete nginx instances on a Kubernetes cluster
- Automatically configure deployments based on repository-defined settings

---

## Tech Stack

- Node.js
- TypeScript
- Fastify
- Octokit (GitHub API)
- YAML
- Kubernetes (via kubectl or client)

---

## Project Structure

```
src/
modules/
    github/
    kubernetes/
    deployment/
shared/
    error/
    utils/
server.ts
```

---

## Setup

### 1. Clone the repository

```
git clone git@github.com:Jorgefiestas/northflank-take-home-assignment.git
cd northflank-assignment
```

### 2. Install dependencies

```
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```
GITHUB_TOKEN=your_personal_access_token
```

You can generate a token at:
https://github.com/settings/tokens

---

### 4. Run the server

```
npm run dev
```

Server will start on:

```
[http://localhost:3000](http://localhost:3000)
```

---

## API Endpoints

### GitHub

#### List repositories

```
GET /github/repos
```

#### List branches

```
GET /github/repos/:owner/:repo/branches
```

#### Read YAML file

```
GET /github/repos/:owner/:repo/file
```

Query parameters:

- `branch`
- `path`

---

### YAML Management

#### Update YAML file

```
PUT /github/repos/:owner/:repo/file
```

Body:

```
{
    "name": "string",
    "replicas": number,
    "annotations": { "key": "value" }
}

```

---

### Kubernetes

#### Create nginx deployment

```
POST /kubernetes/deploy
```

Body:

```
{
    "name": "string",
    "namespace": "string",
    "replicas": number
}

```

#### Delete deployment

```
DELETE /kubernetes/deploy
```

Body:

```
{
    "name": "string",
    "namespace": "string"
}
```

---

### Deployment from GitHub

#### Deploy from YAML

```
POST /deployment/from-github
```

Body:

```
{
    "owner": "string",
    "repo": "string",
    "branch": "string",
    "path": "string"
}
```

This will:

- Fetch YAML from GitHub
- Parse configuration
- Create Kubernetes deployment and service

---

#### Deploy with ConfigMap (content support)

If the YAML includes:

```
content: "custom html"
```

A ConfigMap will be created and mounted into nginx.

---

## YAML Format

Expected structure:

```
name: string
replicas: number
annotations:
key: value
content: optional string
```
