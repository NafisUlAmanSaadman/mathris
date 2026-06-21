/**
 * storage.ts — kept as a thin compatibility shim.
 *
 * The real persistence is now handled by the IRepository layer
 * (see data/repository.ts, data/sqliteRepository.ts).
 *
 * This file is intentionally minimal. If you need to migrate old
 * AsyncStorage data to SQLite on first launch, add that logic to
 * SQLiteRepository.initialize() and remove this file when done.
 *
 * @deprecated  Use getRepository() from data/repositoryProvider.ts instead.
 */

// Re-export types so existing imports don't break during migration.
export type { MasteryEntry, WrongAnswerEntry, SessionRecord } from './repository';
