# AIVO Brain API

AIVO Brain API is an advanced research and AI-powered analysis system that batch processes documents, performs research, and generates insights using various AI models.

## Table of Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [API Endpoints](#api-endpoints)
7. [Testing](#testing)
8. [Monitoring](#monitoring)
9. [Contributing](#contributing)
10. [License](#license)

## Features

### Current Features
✅ Multi-model AI research capabilities (OpenAI, Azure, Anthropic, Google, Mistral, Llama, Grok)
✅ Asynchronous job processing with Bull queue
✅ RESTful API for research requests and status checks
✅ API key authentication
✅ Document processing and analysis
✅ Prisma ORM for database operations
✅ Bull Board for queue monitoring
✅ Comprehensive test suite with Jest

### Upcoming Features
☐ Real-time updates via WebSocket
☐ Enhanced error handling and retry mechanisms
☐ User management system
☐ Rate limiting and request throttling
☐ Advanced analytics dashboard
☐ Support for additional AI models
☐ Improved caching mechanisms
☐ Automated API documentation generation
☐ Multi-language support
☐ Integration with external storage services (S3, Google Cloud Storage)

## Architecture

graph TD
    subgraph Client Applications
        C[External Clients] -->|API Requests| AM[API Key Middleware]
    end

    subgraph API Layer
        AM -->|Authenticated Requests| E[Express Server]
        E -->|Queue Research Jobs| Q[Bull Queue]
    end

    subgraph Processing Layer
        Q -->|Process Jobs| RJ[Research Job Processor]
        RJ -->|Process Documents| LS[LangChain Service]
    end

    subgraph AI Models
        LS -->|Query| M1[OpenAI]
        LS -->|Query| M2[Azure AI]
        LS -->|Query| M3[Anthropic Claude]
        LS -->|Query| M4[Google Gemini]
        LS -->|Query| M5[Mistral]
        LS -->|Query| M6[Llama]
        LS -->|Query| M7[Grok]
    end

    subgraph Storage
        DB[(PostgreSQL)]
        RC[(Redis Cache)]
        
        RJ -->|Store Results| DB
        Q --- RC
    end

    subgraph Monitoring
        L[Winston Logger]
        BB[Bull Board Dashboard]
        
        RJ -->|Log Events| L
        Q -->|Monitor Queue| BB
    end

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm (v6 or later)
- Redis server
- PostgreSQL database
- API keys for supported AI models (AzureAI, OpenAI, AnthropicClaude, GoogleGemini, Mistral, Llama, Grok)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/aivo-brain-api.git
   cd aivo-brain-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   - Create a PostgreSQL database for the project
   - Run Prisma migrations:
     ```
     npx prisma migrate dev
     ```

## Configuration

1. Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/aivo_brain_db"
REDIS_URL="redis://localhost:6379"
PORT=3000
NODE_ENV=development

# AI Model API Keys
OPENAI_API_KEY=your_openai_api_key
AZURE_API_KEY=your_azure_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
MISTRAL_API_KEY=your_mistral_api_key
LLAMA_API_KEY=your_llama_api_key
GROK_API_KEY=your_grok_api_key
```

Replace the placeholder values with your actual database credentials, Redis URL, and AI model API keys.

2. Configure supported AI models:

Edit the `AVAILABLE_MODELS` array in `src/controllers/researchController.ts`:


```12:12:src/controllers/researchController.ts
const AVAILABLE_MODELS = ['AzureAI', 'OpenAI', 'AnthropicClaude', 'GoogleGemini', 'Mistral', 'Llama', 'Grok'];
```


Add or remove models based on your requirements and available API keys.

## Usage

To start the server in development mode:

```
npm run dev
```

For production:

```
npm run build
npm start
```

## API Endpoints

### Enqueue Research Request

- **URL**: `/api/research/enqueue`
- **Method**: POST
- **Headers**: 
  - `Content-Type: application/json`
  - `x-api-key: your_api_key`
- **Body**:
  ```json
  {
    "documents": [
      {
        "content": "Document content",
        "metadata": {}
      }
    ],
    "userSearchQuery": "Search query",
    "sequentialQuery": "Sequential query",
    "model": "OpenAI"
  }
  ```
- **Response**: 
  ```json
  {
    "requestId": "generated_request_id"
  }
  ```

### Get Research Status

- **URL**: `/api/research/status/:id`
- **Method**: GET
- **Headers**: 
  - `x-api-key: your_api_key`
- **Response**: 
  ```json
  {
    "id": "request_id",
    "status": "completed",
    "individualFindings": "[...]",
    "overallSummary": "{...}"
  }
  ```

## Testing

Run the test suite:

```
npm test
```

To generate a coverage report:

```
npm run test:coverage
```

## Monitoring

The API includes Bull Board for monitoring the job queue. Access it at:

```
http://localhost:3000/admin/queues
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
