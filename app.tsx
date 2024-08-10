const multer = require("multer");
const { AssemblyAI } = require("assemblyai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

dotenv.config();
const port = process.env.PORT || 3000;
const base_url = process.env.BASE_URL;
var express = require("express");
var app = express();
// avoid cors error in frontend
app.use(cors());
// serves files publically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// for upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// AssemblyAI client
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});

// audio processing
app.post("/process-audio", upload.single("audio"), async (req, res) => {
  try {

    const fileName = req.file.filename;
    const fileUrl = `${base_url}/uploads/${fileName}`;

    const data = {
      audio_url: fileUrl, 
    };
    // AssemblyAI for transcription
    const transcript = await client.transcripts.transcribe(data);
    console.log(transcript);
    // Remove the uploaded file after processing
    // fs.unlinkSync(fileUrl);
    res.status(200).json({ status: 200, transcript: "transcript.text" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during transcription." });
  }
});
app.get("/test-audio", (req, res) => {
  res.sendFile(path.join(__dirname, "uploads", "30seceng.mp3"));
});
app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
