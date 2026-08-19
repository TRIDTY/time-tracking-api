# Time Tracking API

Backend de Controle de Ponto Eletrônico construído com Java 21, Spring Boot 3, Spring Security (JWT) e PostgreSQL.

## Stack

- Java 21 / Maven
- Spring Boot 3.5 (Web, Data JPA, Security, Validation)
- PostgreSQL (via Docker Compose)
- JWT stateless (jjwt)

## Como rodar

```bash
docker compose up -d          # sobe o PostgreSQL
./mvnw spring-boot:run        # ou: mvn spring-boot:run
```

O servidor sobe em `http://localhost:8080`.

## Endpoints

### Autenticação

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | público | Cria usuário (`role`: `ROLE_EMPLOYEE` ou `ROLE_MANAGER`) |
| POST | `/api/auth/login` | público | Retorna token JWT |

### Registros de ponto

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/records` | autenticado | Registra batida (`type`: `CLOCK_IN`/`CLOCK_OUT`, `latitude`, `longitude` obrigatórios). Horário gerado pelo servidor em UTC. |
| GET | `/api/records/me` | autenticado | Registros do próprio usuário, mais recentes primeiro (paginado) |
| GET | `/api/admin/records` | ROLE_MANAGER | Registros de todos, com paginação e filtros opcionais `userId`, `from`, `to` (ISO-8601) |

## Exemplos

```bash
# Registrar usuário
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana","email":"ana@example.com","password":"secret123","role":"ROLE_EMPLOYEE"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.com","password":"secret123"}'

# Bater ponto
curl -X POST http://localhost:8080/api/records \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"type":"CLOCK_IN","latitude":-23.5505,"longitude":-46.6333}'

# Meus registros
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/records/me

# (Manager) todos os registros com filtros
curl -H "Authorization: Bearer $MANAGER_TOKEN" \
  'http://localhost:8080/api/admin/records?userId=1&from=2026-01-01T00:00:00Z&to=2026-12-31T23:59:59Z&page=0&size=20'
```

Erros seguem o padrão RFC 7807 (Problem Details).
