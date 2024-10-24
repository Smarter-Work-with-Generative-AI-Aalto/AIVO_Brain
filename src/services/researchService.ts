import { prisma } from '../lib/prisma';
import { handleDocumentSearch, createAISummary } from '../lib/langchainIntegration';
import { logger } from '../utils/logger';

/**
 * Process a research request queue
 */
export async function processResearchRequestQueue(requestId: string) {
  const pendingRequest = await prisma.aIRequestQueue.findUnique({
    where: { id: requestId },
  });

  if (!pendingRequest) {
    throw new Error(`Request with ID ${requestId} not found`);
  }

  const { model, documentIds, userSearchQuery, sequentialQuery } = pendingRequest;

  await prisma.aIRequestQueue.update({
    where: { id: requestId },
    data: { status: `researching 0/${documentIds.length}` },
  });

  let allFindings = [];

  for (let i = 0; i < documentIds.length; i++) {
    const documentId = documentIds[i];

    // Retrieve document chunks
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      logger.warn(`Document with ID ${documentId} not found`);
      continue;
    }

    const documentChunks = await getDocumentChunks(document);

    const findings = await handleDocumentSearch(documentChunks, userSearchQuery, sequentialQuery, model);

    let allFindings: { title: string; page: string; content: string }[] = [];
    allFindings = allFindings.concat(findings);

    await prisma.aIRequestQueue.update({
      where: { id: requestId },
      data: {
        status: `researching ${i + 1}/${documentIds.length}`,
        individualFindings: JSON.stringify(allFindings),
      },
    });
  }

  const overallSummary = await createAISummary(allFindings, model);

  await prisma.aIRequestQueue.update({
    where: { id: requestId },
    data: {
      status: 'completed',
      overallSummary: JSON.stringify(overallSummary),
    },
  });

  await prisma.aIActivityLog.create({
    data: {
      model: pendingRequest.model,
      documentIds: pendingRequest.documentIds,
      userSearchQuery: pendingRequest.userSearchQuery,
      sequentialQuery: pendingRequest.sequentialQuery,
      status: 'completed',
      individualFindings: JSON.stringify(allFindings),
      overallSummary: JSON.stringify(overallSummary),
    },
  });

  await prisma.aIRequestQueue.delete({
    where: { id: requestId },
  });

  logger.info(`Completed processing request ID: ${requestId}`);
}

/**
 * Mock function to get document chunks
 * Replace this with actual implementation
 */
async function getDocumentChunks(document: any) {
  // TODO: Implement actual vector retrieval or chunking logic
  return [
    {
      content: document.content,
      metadata: document.metadata,
    },
  ];
}
