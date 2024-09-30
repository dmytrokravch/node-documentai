# Document AI Parser

## Overview

This project is a Node.js application that uses the **Google Cloud Document AI** API to parse PDFs and images (JPEG, PNG) and extract information such as order numbers, dates, and products. The app includes an endpoint that allows you to upload a document (PDF or image), processes it with the Document AI API, and returns the extracted information.

## Features

- Supports PDF, PNG, and JPEG files.
- Extracts key information such as:
  - Order Number
  - Order Date
  - Products
- Handles both text-based and entity-based document extraction.
- Built with error handling to manage missing or invalid data.

## Tech Stack

- **Node.js** for the backend.
- **Express** for handling HTTP requests.
- **Multer** for handling file uploads.
- **Google Cloud Document AI API** for document parsing.
- **Docker** for containerization.

## Requirements

- Node.js (v18 or later)
- Google Cloud account with **Document AI API** enabled.
- A Document AI Processor created in your Google Cloud project.
- Docker (optional, if you want to run the app in a container).

## Environment Variables

The application requires the following environment variables:

| Variable        | Description                                                      |
|-----------------|------------------------------------------------------------------|
| `PROJECT_ID`    | Your Google Cloud project ID                                     |
| `LOCATION`      | The location of your Document AI processor (e.g., `eu`, `us`)    |
| `PROCESSOR_ID`  | The processor ID for your Document AI processor                  |
| `PORT`          | Port number for running the application (default: 3000)          |

also, you need to add Google Cloud key file to the root of the project and name it `google_cloud_key.json`

## Getting Started

### 1. Install Dependencies

Run the following command to install project dependencies:

```bash
npm install
```

### 2. Run the Application

```bash
npm start
```

You can also run the application in development mode

```bash
npm run dev
```

### 3. Using the /parse-document Endpoint

POST /parse-document
Content-Type: multipart/form-data
Body: file=<your file>

Example using cURL:

```bash
curl -X POST http://localhost:3000/parse-document \
  -F "file=@/path/to/your/document.pdf"
```

The response will contain the extracted order details:

```json
{
  "orderNumber": "10906096295043",
  "orderDate": "2024-09-28",
  "products": [
    "Product A",
    "Product B"
  ]
}
```
