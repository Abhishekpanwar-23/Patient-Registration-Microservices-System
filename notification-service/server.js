const express = require("express");
const amqp = require("amqplib");

const app = express();
const port = 7070;

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
      channel.consume(RABBIT_MQ_QUEUE_NAME, (msg) => {
        if (msg !== null) {
          try {
            const patient = JSON.parse(msg.content.toString());
            console.log(
              `Notification: Patient ${patient.name} registered with status ${patient.status}`
            );
            channel.ack(msg);
          } catch (err) {
            console.error("Failed to handle notification message:", err.message);
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

app.listen(port, () => console.log(`Notification service running on port ${port}`));
