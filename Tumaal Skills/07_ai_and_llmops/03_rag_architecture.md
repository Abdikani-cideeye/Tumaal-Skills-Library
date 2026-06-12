# RAG ARCHITECTURE

## RETRIEVAL-AUGMENTED GENERATION FUNDAMENTALS

- **ALWAYS** use RAG when the AI needs access to domain-specific, proprietary, or frequently updated knowledge that is not in the model's training data.
- **NEVER** rely solely on an LLM's parametric memory for factual, domain-specific, or time-sensitive information. LLMs hallucinate. RAG grounds them.
- **ALWAYS** prefer RAG over fine-tuning for knowledge injection. Fine-tuning is for behavior/style changes, not for teaching the model new facts.

## DOCUMENT INGESTION AND CHUNKING

- **ALWAYS** chunk documents intelligently. Use semantic boundaries (paragraphs, sections, headings) rather than fixed character/token counts.
- **ALWAYS** include metadata with each chunk: source document, section title, page number, last-updated timestamp. Metadata enables filtering and attribution.
- **ALWAYS** overlap chunks by 10-20% to prevent context loss at chunk boundaries.
- **NEVER** chunk documents into fragments smaller than 100 tokens or larger than 1000 tokens. Too small loses context; too large wastes retrieval precision.

## EMBEDDING AND VECTOR STORAGE

- **ALWAYS** use a dedicated vector database (e.g., Pinecone, Weaviate, Qdrant, pgvector) for storing and querying embeddings.
- **ALWAYS** choose an embedding model appropriate for your content type and language. Test retrieval quality before committing to a model.
- **ALWAYS** re-embed documents when the embedding model changes. Old and new embeddings are incompatible.
- **NEVER** store embeddings without the original text. You need the original text for the generation step.

## RETRIEVAL STRATEGY

- **ALWAYS** retrieve more chunks than needed and re-rank them for relevance before passing to the LLM. Initial vector similarity search is approximate, not precise.
- **ALWAYS** implement hybrid retrieval (combining vector similarity search with keyword/BM25 search) for better recall. Vector search handles semantic similarity; keyword search handles exact matches.
- **ALWAYS** filter retrieved results by metadata (date, source, category) before re-ranking to ensure relevance.
- **NEVER** pass more than 5-10 relevant chunks to the LLM. Excessive context dilutes answer quality and increases cost.

## GENERATION WITH CONTEXT

- **ALWAYS** structure the RAG prompt clearly:
  1. System instruction: role and behavior.
  2. Retrieved context: clearly delimited (e.g., `<context>...</context>`).
  3. User question.
  4. Instruction to answer ONLY from the provided context. State "If the answer is not in the context, say so."
- **NEVER** let the LLM answer outside the provided context in a RAG system. This defeats the purpose and introduces hallucination.

## FALLBACK MECHANISMS

- **ALWAYS** implement fallback behavior when retrieval returns no relevant results:
  - Return a clear "I don't have information about that" response.
  - Suggest related topics that DO have matches.
  - Offer to escalate to a human.
- **NEVER** let the LLM fabricate an answer when retrieval fails. This is the primary source of RAG hallucinations.

## RAG EVALUATION

- **ALWAYS** evaluate RAG systems on three dimensions:
  - **Retrieval quality:** Are the right chunks being retrieved? (Precision/Recall)
  - **Generation quality:** Is the answer faithful to the retrieved context? (Faithfulness)
  - **Answer relevance:** Does the answer actually address the user's question? (Relevance)
- **ALWAYS** maintain a test set of question-answer pairs with known source documents for regression testing.

## SECURITY

- **ALWAYS** enforce access control on retrieved documents. If a user does not have permission to view a document, its chunks MUST NOT appear in their RAG results.
- **NEVER** expose raw retrieved chunks to end users. Synthesize answers and provide source citations instead.
