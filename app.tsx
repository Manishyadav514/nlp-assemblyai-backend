const multer = require("multer");
const { AssemblyAI } = require("assemblyai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
// Initialize environment variables
dotenv.config();
const port = process.env.PORT || 3000;
const base_url = process.env.BASE_URL;
var express = require("express");
var app = express();
// Enable CORS for all routes to avoid cors error in frontend
app.use(cors());
// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Initialize AssemblyAI client
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});

// Define the /process-audio API endpoint
app.post("/process-audio", upload.single("audio"), async (req, res) => {
  try {
    // Get the path of the uploaded audio file
    // const filePath = path.resolve(req.file.path);
    const fileName = req.file.filename;
    const fileUrl = `${base_url}/uploads/${fileName}`;
    // Prepare the request payload
    const data = {
      audio_url: fileUrl, // If you want to use a URL instead, you should upload the file to a cloud storage first and use that URL.
    };
    // Send the audio data to AssemblyAI for transcription
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
