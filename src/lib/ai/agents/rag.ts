/**
 * Function to add a memory to the RAG (Retrieval-Augmented Generation) database.
 * This function is designed to run in the browser and uses the EntityDB library to manage the
 */


"use client";
// runs in the browser

export type RAGMemory = {
  id: string; // uuid
  text: string;
  chatId: string;
  role: "user" | "assistant";
  timestamp: string; // ISO string format
  metadata?: Record<string, string>;
}

import { EntityDB } from "@babycommando/entity-db";

let internalDb: EntityDB | null = null;

/**
 * Function to initialize and return the EntityDB instance.
 * @returns {EntityDB} The initialized EntityDB instance.
 */
function db(): EntityDB {
  if (!internalDb) {
    // Initialize the VectorDB instance
    internalDb = new EntityDB({
      vectorPath: "db_name",
      model: "Xenova/all-MiniLM-L6-v2", // a HuggingFace embeddings model
    });
  }
  return internalDb
}

export async function addMemoryToRAG(memory: RAGMemory): Promise<void> {
  try {
    // Add the memory to the RAG database
    await db().insert(memory);
  } catch {
    return
  }
}

export async function searchRAG(query: string | undefined, limit = 5): Promise<RAGMemory[]> {
  if (!query) return [];
  try {
    // Search the RAG database for the query
    const results = await db().query(query, { limit });
    return results as RAGMemory[];
  } catch {
    // console.error("Error searching RAG:", error);
    return [];
  }
}