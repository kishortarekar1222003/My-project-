import { db, storage } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

// Subscribes to a collection in realtime — whenever anyone anywhere adds,
// edits, or deletes a document, every connected user's screen updates
// automatically. No manual "reload" logic needed anywhere in the app.
export function subscribeCollection(name, callback, onError) {
  const q = query(collection(db, name), orderBy("postedAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (error) => {
      console.error(`Failed to subscribe to "${name}":`, error);
      if (onError) onError(error);
    }
  );
}

export async function addItem(name, data) {
  const docRef = await addDoc(collection(db, name), data);
  return docRef.id;
}

export async function updateItem(name, id, data) {
  await updateDoc(doc(db, name, id), data);
}

export async function deleteItem(name, id) {
  await deleteDoc(doc(db, name, id));
}

// Uploads a compressed base64 photo (data URL) to Firebase Storage and
// returns a real, CDN-served download URL — this is what actually gets
// saved on the listing document, not the raw base64 data.
export async function uploadPhoto(dataUrl, path) {
  const storageRef = ref(storage, path);
  await uploadString(storageRef, dataUrl, "data_url");
  return await getDownloadURL(storageRef);
}
