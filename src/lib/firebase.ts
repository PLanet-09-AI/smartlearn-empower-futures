
// IndexedDB wrapper to replace Firebase
interface DBSchema {
  courses: any;
  users: any;
  enrollments: any;
  userProgress: any;
  quizResults: any;
  quizAnswers: any;
  quizAnalytics: any;
  courseRatings: any;
}

class IndexedDBWrapper {
  private dbName = 'smartlearn-db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores (tables)
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('enrollments')) {
          db.createObjectStore('enrollments', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('userProgress')) {
          db.createObjectStore('userProgress', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('quizResults')) {
          db.createObjectStore('quizResults', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('quizAnswers')) {
          db.createObjectStore('quizAnswers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('quizAnalytics')) {
          db.createObjectStore('quizAnalytics', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('courseRatings')) {
          db.createObjectStore('courseRatings', { keyPath: 'id' });
        }
      };
    });
  }

  async add(storeName: string, data: any): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Generate ID if not provided
      if (!data.id) {
        data.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      }
      
      const request = store.add(data);
      request.onsuccess = () => resolve(data.id);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName: string, id: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async query(storeName: string, predicate: (item: any) => boolean): Promise<any[]> {
    const allItems = await this.getAll(storeName);
    return allItems.filter(predicate);
  }
}

// Initialize IndexedDB
const localDB = new IndexedDBWrapper();
localDB.init().catch(console.error);

// Mock auth object to maintain compatibility
export const auth = {
  currentUser: { uid: 'local-user-' + Date.now() },
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Simulate logged in user
    setTimeout(() => callback({ uid: 'local-user-' + Date.now() }), 100);
  }
};

// Export IndexedDB wrapper as db
export const db = localDB;

// Mock serverTimestamp function
export const serverTimestamp = () => new Date();

export default localDB;
