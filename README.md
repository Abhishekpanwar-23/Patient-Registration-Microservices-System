# Patient Registration System — Microservices Architecture

This project implements a microservice-based patient registration workflow using RabbitMQ for asynchronous messaging and MongoDB for persistent storage, along with a simple frontend UI to interact with the system.

---

## Overview

The system allows:
- Registering new patients via API or UI
- Processing and storing patient records in MongoDB
- Sending notifications upon successful registration
- Searching patients by ID or name
- Viewing and interacting through a frontend UI

The services communicate through RabbitMQ for decoupled, fault-tolerant processing.

---

## System Components

| Component | Port | Responsibility |
|----------|------|----------------|
| **registration-service** | 8080 | Accepts patient registration requests and publishes them to RabbitMQ |
| **processing-service** | 9090 | Consumes queue messages, stores patients in MongoDB, exposes patient queries |
| **notification-service** | 7070 | Listens for new registrations and logs/sends notifications |
| **search-service** | 8081 | Provides endpoints to search patient records |
| **UI** | 3000 | Frontend to interact with system |
| **RabbitMQ** | 5672 (AMQP), 15672 (Dashboard) | Message broker between services |
| **MongoDB** | 27017 | Patient data persistence layer |

---

## Architecture Flow

1) Client or UI submits a patient registration request
2) `registration-service` publishes the patient to a RabbitMQ queue
3) `processing-service` consumes and persists the patient to MongoDB
4) `notification-service` listens and sends/logs a notification
5) `search-service` and `processing-service` provide APIs for querying data

This decoupling allows independent scaling, failure isolation, and real-time message-driven processing.

---

## Running the System

### Prerequisites
- Docker & Docker Compose installed

### Start all services

docker-compose up --build
---
### API Testing (via cURL)
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"age\":30,\"contact\":\"9876543210\",\"symptoms\":\"Fever\"}"
### Fetch All Patients
curl http://localhost:9090/patients
### Search by Name
curl "http://localhost:9090/patients/search?name=John"
### License

This project is available under License and may be used, modified, or extended for learning or production scenarios.
