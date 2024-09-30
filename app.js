const express = require('express');
const multer = require('multer');
const path = require('path');
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai');
const bodyParser = require('body-parser');
require('dotenv').config()

const app = express();
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Google Cloud key
const KEY_FILE_PATH = path.join(__dirname, 'keys/google_cloud_key.json');

// Init Google Document AI
const client = new DocumentProcessorServiceClient({ keyFilename: KEY_FILE_PATH });

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function processDocument(fileBuffer, mimeType) {
  const projectId = process.env.PROJECT_ID; // project ID in Google Cloud Document AI
  const location = process.env.LOCATION;
  const processorId = process.env.PROCESSOR_ID; // processor ID in Google Cloud Document AI

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  const encodedFile = fileBuffer.toString('base64');
  if (!['application/pdf', 'image/png', 'image/jpeg'].includes(mimeType)) {
    throw new Error('Unsupported file type. Please upload a PDF or image file (PNG, JPEG).');
  }

  const request = {
    name,
    rawDocument: {
      content: encodedFile,
      mimeType: mimeType,
    },
  };

  const [result] = await client.processDocument(request);
  const { document } = result;
  return document;
}

// function to extract order details from the document ai response
function extractEntities(document) {
  const extractedData = {};
  document.entities.forEach(entity => {
    const type = entity.type; // (ex: numerZamowienia)
    const mentionText = entity.mentionText; // text of the entity
    const confidence = entity.confidence; // confidence in result
    if (confidence < 0.8) return;
    if (!mentionText) return;
    extractedData[type] = mentionText;
  });

  return extractedData;
}

app.post('/parse-document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }
    const fileBuffer = req.file.buffer; // Use buffer from memory storage
    const mimeType = req.file.mimetype; // Get the MIME type from the uploaded file
    const processedDocument = await processDocument(fileBuffer, mimeType);

    const extractedInfo = extractEntities(processedDocument);

    res.status(200).send(extractedInfo);
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
