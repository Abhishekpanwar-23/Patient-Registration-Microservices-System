# Patient Registration System (Extended)

## Features
- Patient registration service (port 8080)
- Processing service with MongoDB (port 9090)
- Notification service (port 7070)
- RabbitMQ as message broker
- Status tracking (registered -> processed)
- Search patients by ID or name

## How to Run
1. Install Docker and Docker Compose.
2. Navigate to this folder.
3. Run: docker-compose up --build

## Test Commands

### Register a patient
curl -X POST http://localhost:8080/register -H "Content-Type: application/json" -d "{\"name\":\"John Doe\",\"age\":30,\"contact\":\"9876543210\",\"symptoms\":\"Fever\"}"

### Get all patients
curl http://localhost:9090/patients

### Get patient by ID
curl http://localhost:9090/patients/P1234567890

### Search by name
curl http://localhost:9090/patients/search?name=John
