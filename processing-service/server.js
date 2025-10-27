const express = require("express");
const amqp = require("amqplib");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const RABBIT_MQ_SERVER = process.env.RABBIT_MQ_SERVER || "localhost";
const RABBIT_MQ_PORT = process.env.RABBIT_MQ_PORT || "5672";
const RABBIT_MQ_USERNAME = process.env.RABBIT_MQ_USERNAME || "guest";
const RABBIT_MQ_PASSWORD = process.env.RABBIT_MQ_PASSWORD || "guest";
const RABBIT_MQ_QUEUE_NAME = process.env.RABBIT_MQ_QUEUE_NAME || "notifications";
const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://rootadmin:Arytan09@cluster0.ha9tawz.mongodb.net/patientsdb?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

const patientSchema = new mongoose.Schema({
  patientId: String,
  name: String,
  age: Number,
  contact: String,
  symptoms: String,
  status: String,
  receivedAt: Date,
  processedAt: Date
});

const Patient = mongoose.model("Patient", patientSchema);

async function connectRabbitMQWithRetry(maxRetries = 30, delayMs = 2000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const connection = await amqp.connect(
        `amqp://${RABBIT_MQ_USERNAME}:${RABBIT_MQ_PASSWORD}@${RABBIT_MQ_SERVER}:${RABBIT_MQ_PORT}`
      );
      const channel = await connection.createChannel();
      await channel.assertQueue(RABBIT_MQ_QUEUE_NAME, { durable: true });
      channel.consume(RABBIT_MQ_QUEUE_NAME, async (msg) => {
        if (msg !== null) {
          try {
            const patient = JSON.parse(msg.content.toString());
            patient.status = "processed";
            patient.processedAt = new Date();
            const newPatient = new Patient(patient);
            await newPatient.save();
            console.log(`Processed and stored patient: ${patient.name}`);
            channel.ack(msg);
          } catch (err) {
            console.error("Failed to process message:", err.message);
            // Optionally, send to a dead-letter queue or nack for requeue
            channel.nack(msg, false, false);
          }
        }
      });

      connection.on("close", () => {
        console.error("RabbitMQ connection closed. Reconnecting...");
        connectRabbitMQWithRetry().catch(() => {});
      });
      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err.message);
      });

      return;
    } catch (err) {
      attempt += 1;
      console.error(
        `Failed to connect to RabbitMQ (attempt ${attempt}/${maxRetries}): ${err.message}`
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error("Unable to connect to RabbitMQ after multiple attempts");
}

connectRabbitMQWithRetry().catch((err) => console.error("RabbitMQ connection failed:", err.message));

app.get("/patients", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.get("/patients/:id", async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.get("/patients/search", async (req, res) => {
  try {
    const { name, contact } = req.query;
    if (!name && !contact) {
      return res.status(400).json({ error: "Provide name or contact query parameter" });
    }

    const criteria = {};
    if (name) criteria.name = new RegExp(String(name), "i");
    if (contact) criteria.contact = new RegExp(String(contact), "i");

    const patients = await Patient.find(criteria);
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.listen(9090, () => console.log("Processing service running on port 9090"));
