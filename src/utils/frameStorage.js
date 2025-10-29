const DB_NAME = "PhotoraccaFrames";
const STORE_NAME = "frames";
const DB_VERSION = 1;

// Open or create the database
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("layoutType", "layoutType", { unique: false });
        store.createIndex("created", "created", { unique: false });
      }
    };
  });
}

// Save a custom frame
export async function saveFrame({ name, dataUrl, scope = "canvas", layoutType = "any", borderMm = 0 }) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    
    const frame = {
      name,
      dataUrl,
      scope, // 'canvas' or 'slot'
      layoutType, // '4x6', '2x6', or 'any'
      borderMm,
      created: new Date().toISOString(),
    };
    
    const request = store.add(frame);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all saved frames
export async function getAllFrames() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get frames filtered by layout type
export async function getFramesByLayout(layoutType) {
  const all = await getAllFrames();
  return all.filter(f => f.layoutType === layoutType || f.layoutType === "any");
}

// Get a single frame by id
export async function getFrame(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Update a frame
export async function updateFrame(id, updates) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const frame = getRequest.result;
      if (!frame) return reject(new Error("Frame not found"));
      
      Object.assign(frame, updates);
      const putRequest = store.put(frame);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Delete a frame
export async function deleteFrame(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Clear all frames
export async function clearAllFrames() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}