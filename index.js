const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai');

const app = express();
const port = 3000;

// Google Cloud key
const KEY_FILE_PATH = path.join(__dirname, 'path/to/your/service-account-file.json');

// Init Google Document AI
const client = new DocumentProcessorServiceClient({ keyFilename: KEY_FILE_PATH });

// init multer
const upload = multer({ dest: 'uploads/' });

async function processDocument(filePath) {
  const projectId = 'project-id'; // project ID in Google Cloud Document AI
  const location = 'pl';
  const processorId = 'processor-id'; // processor ID in Google Cloud Document AI

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  const file = fs.readFileSync(filePath);
  const encodedFile = Buffer.from(file).toString('base64');

  const request = {
    name,
    rawDocument: {
      content: encodedFile,
      mimeType: 'application/pdf', // TODO add support for images
    },
  };

  const [result] = await client.processDocument(request);
  const { document } = result;
  return document.text;
}


app.post('/parse-document', upload.single('document'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const text = await processDocument(filePath);
    console.log('Parsed text:', text);
    // remove the file after processing
    fs.unlinkSync(filePath);

    // Возвращаем данные клиенту
    res.json({
      status: 'success',
      text,
    });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
