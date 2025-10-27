const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const MONGO_URL = "mongodb+srv://rootadmin:Arytan09@cluster0.ha9tawz.mongodb.net/patientsdb?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Search service connected to MongoDB Atlas"))
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

app.get("/search", async (req, res) => {
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

app.listen(8081, () => console.log("Search service running on port 8081"));
