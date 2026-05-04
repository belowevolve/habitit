import type { Completion, Habit } from "./types";

const DB_NAME = "habitit";
const DB_VERSION = 2;

const STORES = {
  completions: "completions",
  habits: "habits",
} as const;

let dbInstance: IDBDatabase | null = null;

const idbRequest = <T>(req: IDBRequest<T>): Promise<T> =>
  // oxlint-disable-next-line promise/avoid-new -- IndexedDB is event-based
  new Promise((resolve, reject) => {
    req.addEventListener("success", () => resolve(req.result));
    req.addEventListener("error", () => reject(req.error));
  });

const cursorDelete = (
  index: IDBIndex,
  key: IDBValidKey,
  filter?: (value: Completion) => boolean,
): Promise<void> =>
  // oxlint-disable-next-line promise/avoid-new -- IndexedDB cursor requires event-based control
  new Promise((resolve, reject) => {
    const request = index.openCursor(key);
    request.addEventListener("success", () => {
      const cursor = request.result;
      if (!cursor) {
        resolve();
        return;
      }
      if (!filter || filter(cursor.value as Completion)) {
        cursor.delete();
      }
      cursor.continue();
    });
    request.addEventListener("error", () => reject(request.error));
  });

const open = (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  // oxlint-disable-next-line promise/avoid-new -- IndexedDB is event-based
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      const txn = request.transaction;
      if (!txn) {
        return;
      }

      if (!db.objectStoreNames.contains(STORES.habits)) {
        db.createObjectStore(STORES.habits, { keyPath: "id" });
      }

      if (db.objectStoreNames.contains(STORES.completions)) {
        const store = txn.objectStore(STORES.completions);

        if (store.indexNames.contains("by-habit-date")) {
          store.deleteIndex("by-habit-date");
        }
        store.createIndex("by-habit-date", ["habitId", "date"], { unique: false });

        if (!store.indexNames.contains("by-habit")) {
          store.createIndex("by-habit", "habitId", { unique: false });
        }
      } else {
        const store = db.createObjectStore(STORES.completions, { keyPath: "id" });
        store.createIndex("by-date", "date", { unique: false });
        store.createIndex("by-habit-date", ["habitId", "date"], { unique: false });
        store.createIndex("by-habit", "habitId", { unique: false });
      }
    });

    request.addEventListener("success", () => {
      dbInstance = request.result;
      resolve(dbInstance);
    });

    request.addEventListener("error", () => reject(request.error));
  });
};

const tx = async (storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> => {
  const db = await open();
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

export const habitsStore = {
  async getAll(): Promise<Habit[]> {
    const store = await tx(STORES.habits, "readonly");
    return idbRequest(store.getAll());
  },

  async remove(id: string): Promise<void> {
    const store = await tx(STORES.habits, "readwrite");
    await idbRequest(store.delete(id));
  },

  async save(habit: Habit): Promise<void> {
    const store = await tx(STORES.habits, "readwrite");
    await idbRequest(store.put(habit));
  },
};

export const completionsStore = {
  async getAll(): Promise<Completion[]> {
    const store = await tx(STORES.completions, "readonly");
    return idbRequest(store.getAll());
  },

  async getByDate(date: string): Promise<Completion[]> {
    const store = await tx(STORES.completions, "readonly");
    const index = store.index("by-date");
    return idbRequest(index.getAll(date));
  },

  async getByHabit(habitId: string): Promise<Completion[]> {
    const store = await tx(STORES.completions, "readonly");
    const index = store.index("by-habit");
    return idbRequest(index.getAll(habitId));
  },

  async remove(habitId: string, date: string, slot?: string): Promise<void> {
    const store = await tx(STORES.completions, "readwrite");
    const index = store.index("by-habit-date");
    await cursorDelete(
      index,
      [habitId, date],
      slot === undefined ? undefined : (c) => c.slot === slot,
    );
  },

  async removeByHabit(habitId: string): Promise<void> {
    const store = await tx(STORES.completions, "readwrite");
    const index = store.index("by-habit");
    await cursorDelete(index, habitId);
  },

  async save(completion: Completion): Promise<void> {
    const store = await tx(STORES.completions, "readwrite");
    await idbRequest(store.put(completion));
  },
};
