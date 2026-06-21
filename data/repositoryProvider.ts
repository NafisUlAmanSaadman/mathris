/**
 * repositoryProvider.ts
 *
 * A lightweight service-locator for the active IRepository instance.
 *
 * Usage
 * ─────
 *   // In app startup (before any store reads):
 *   import { setRepository } from './repositoryProvider';
 *   import { SQLiteRepository } from './sqliteRepository';
 *   await setRepository(new SQLiteRepository());
 *
 *   // Everywhere else (stores, components, hooks):
 *   import { getRepository } from './repositoryProvider';
 *   const repo = getRepository();
 *   await repo.addXP(10);
 *
 * Swapping the backend
 * ─────────────────────
 *   Create a class that implements IRepository, then call setRepository()
 *   at startup.  Nothing else in the codebase needs to change.
 *
 *   Examples of alternative backends you could plug in:
 *     - SupabaseRepository  (cloud sync)
 *     - MMKVRepository      (ultra-fast key-value)
 *     - InMemoryRepository  (unit tests / Storybook)
 */

import type { IRepository } from './repository';

let _repo: IRepository | null = null;

/**
 * Initialise and register the repository.
 * Call this exactly once, before rendering any screen that reads data.
 */
export async function setRepository(impl: IRepository): Promise<void> {
  await impl.initialize();
  _repo = impl;
}

/**
 * Return the active repository.
 * Throws if `setRepository` has not been called — this is intentional;
 * it makes missing initialisation loud rather than silently returning stale data.
 */
export function getRepository(): IRepository {
  if (!_repo) {
    throw new Error(
      '[Mathris] Repository not initialised. ' +
        'Call setRepository() in your root layout before using data stores.',
    );
  }
  return _repo;
}

/** True after setRepository() has resolved. Useful for guarding renders. */
export function isRepositoryReady(): boolean {
  return _repo !== null;
}
