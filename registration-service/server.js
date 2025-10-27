const express = require("express");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

const RABBIT_MQ_SERVER = process.env.RABBIT_MQ_SERVER || "localhost";
const RABBIT_MQ_PORT = process.env.RABBIT_MQ_PORT || "5672";
const RABBIT_MQ_USERNAME = process.env.RABBIT_MQ_USERNAME || "guest";
const RABBIT_MQ_PASSWORD = process.env.RABBIT_MQ_PASSWORD || "guest";
const RABBIT_MQ_QUEUE_NAME = process.env.RABBIT_MQ_QUEUE_NAME || "notifications";

async function connectRabbitMQWithRetry(maxRetries = 30, delayMs = 2000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const connection = await amqp.connect(
        `amqp://${RABBIT_MQ_USERNAME}:${RABBIT_MQ_PASSWORD}@${RABBIT_MQ_SERVER}:${RABBIT_MQ_PORT}`
      );
      const channel = await connection.createChannel();
      await channel.assertQueue(RABBIT_MQ_QUEUE_NAME, { durable: true });

      connection.on("close", () => {
        console.error("RabbitMQ connection closed. Reconnecting...");
        // Fire and forget reconnection
        connectRabbitMQWithRetry().then((ch) => (rabbitChannel = ch)).catch(() => {});
      });

      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err.message);
      });

      return channel;
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

let rabbitChannel;
connectRabbitMQWithRetry().then((ch) => (rabbitChannel = ch)).catch((err) => {
  console.error("RabbitMQ connection failed:", err.message);
});

app.post("/register", async (req, res) => {
  const { name, age, contact, symptoms } = req.body;
  const patientId = "P" + Date.now();
  const patient = { patientId, name, age, contact, symptoms, status: "registered", receivedAt: new Date() };
  if (!rabbitChannel) {
    return res.status(503).json({ error: "Message broker not ready. Please retry." });
  }
  try {
    rabbitChannel.sendToQueue(
      RABBIT_MQ_QUEUE_NAME,
      Buffer.from(JSON.stringify(patient)),
      { persistent: true }
    );
    console.log(`Published patient registration: ${name}, Age: ${age}`);
    res.json({ message: "Patient registered successfully", patient });
  } catch (err) {
    console.error("Failed to publish message:", err.message);
    res.status(500).json({ error: "Failed to publish message" });
  }
});

app.listen(8080, () => console.log("Registration service running on port 8080"));
