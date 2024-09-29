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
  const location = 'us';
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
  return document;
}

// function to extract order details from the document ai response
function extractEntities(document) {
  const extractedData = {};

  document.entities.forEach(entity => {
    const type = entity.type; // (np, numerZamowienia)
    const mentionText = entity.mentionText; // text of the entity
    const confidence = entity.confidence; // confidence in result

    if (type === 'numerZamowienia') {
      extractedData.orderNumber = mentionText;
    }

    if (type === 'rachunekZDnia') {
      extractedData.orderDate = mentionText;
    }

    if (type === 'produkt') {
      extractedData.products = mentionText;
    }
  });

  return extractedData;
}

app.post('/parse-document', upload.single('document'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const processedDocument = await processDocument(filePath);

    const extractedInfo = extractEntities(processedDocument);

    // remove the file after processing
    fs.unlinkSync(filePath);

    res.json(extractedInfo);
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
