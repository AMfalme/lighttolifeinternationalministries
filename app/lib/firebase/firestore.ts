import { db } from "./config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";

// Determine whether to use mock storage (localStorage) when Firebase isn't configured
const useMock = typeof window !== "undefined" && (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (globalThis as any).__USE_MOCK__);

// --- Mock helpers using localStorage for offline / placeholder mode ---
const readMock = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const writeMock = (key: string, items: any[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

// Generic mock CRUD implementations
const createMock = (key: string, item: any) => {
  const items = readMock(key);
  const id = genId();
  const now = new Date().toISOString();
  const newItem = { id, ...item, createdAt: now, updatedAt: now };
  items.unshift(newItem);
  writeMock(key, items);
  return newItem;
};

const updateMock = (key: string, id: string, item: any) => {
  const items = readMock(key);
  const idx = items.findIndex((i: any) => i.id === id);
  if (idx === -1) throw new Error("Not found");
  const updated = { ...items[idx], ...item, updatedAt: new Date().toISOString() };
  items[idx] = updated;
  writeMock(key, items);
  return updated;
};

const deleteMock = (key: string, id: string) => {
  let items = readMock(key);
  items = items.filter((i: any) => i.id !== id);
  writeMock(key, items);
  return id;
};

const getAllMock = (key: string) => {
  const items = readMock(key);
  // already stored newest-first
  return items;
};

const getByIdMock = (key: string, id: string) => {
  const items = readMock(key);
  return items.find((i: any) => i.id === id) || null;
};

const DONATION_SETTINGS_KEY = "mock_donation_settings";
const DONATION_SETTINGS_DOC = doc(db, "settings", "donation");

export const DEFAULT_DONATION_NUMBER = "+254 700 123 456";

export const getDonationNumber = async () => {
  if (useMock) {
    const storedSettings = readMock(DONATION_SETTINGS_KEY) as Array<{ donationNumber?: string }>;
    return storedSettings[0]?.donationNumber || DEFAULT_DONATION_NUMBER;
  }

  try {
    const snapshot = await getDoc(DONATION_SETTINGS_DOC);
    if (snapshot.exists()) {
      const data = snapshot.data() as { donationNumber?: string };
      return data.donationNumber || DEFAULT_DONATION_NUMBER;
    }
  } catch (error) {
    console.error("Error fetching donation number:", error);
  }

  return DEFAULT_DONATION_NUMBER;
};

export const setDonationNumber = async (donationNumber: string) => {
  const nextDonationNumber = donationNumber.trim() || DEFAULT_DONATION_NUMBER;

  if (useMock) {
    writeMock(DONATION_SETTINGS_KEY, [{ id: "donation", donationNumber: nextDonationNumber }]);
    return nextDonationNumber;
  }

  await setDoc(DONATION_SETTINGS_DOC, {
    donationNumber: nextDonationNumber,
    updatedAt: new Date(),
  }, { merge: true });

  return nextDonationNumber;
};

// Types
export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  imageUrl?: string;
  featured?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  status: "ongoing" | "completed" | "planned";
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

// BLOGS
export const createBlog = async (blog: BlogPost) => {
  if (useMock) return createMock("mock_blogs", blog) as BlogPost & { id: string };
  try {
    const docRef = await addDoc(collection(db, "blogs"), {
      ...blog,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...blog };
  } catch (error) {
    console.error("Error creating blog:", error);
    if (typeof window !== "undefined") return createMock("mock_blogs", blog) as BlogPost & { id: string };
    throw error;
  }
};

export const updateBlog = async (id: string, blog: BlogPost) => {
  if (useMock) return updateMock("mock_blogs", id, blog) as BlogPost & { id: string };
  try {
    const docRef = doc(db, "blogs", id);
    await updateDoc(docRef, {
      ...blog,
      updatedAt: new Date(),
    });
    return { id, ...blog };
  } catch (error) {
    console.error("Error updating blog:", error);
    if (typeof window !== "undefined") return updateMock("mock_blogs", id, blog) as BlogPost & { id: string };
    throw error;
  }
};

export const deleteBlog = async (id: string) => {
  if (useMock) return deleteMock("mock_blogs", id);
  try {
    await deleteDoc(doc(db, "blogs", id));
    return id;
  } catch (error) {
    console.error("Error deleting blog:", error);
    if (typeof window !== "undefined") return deleteMock("mock_blogs", id);
    throw error;
  }
};

export const getAllBlogs = async () => {
  if (useMock) return getAllMock("mock_blogs") as (BlogPost & { id: string })[];
  try {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (BlogPost & { id: string })[];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    if (typeof window !== "undefined") return getAllMock("mock_blogs") as (BlogPost & { id: string })[];
    return [];
  }
};

export const getBlogById = async (id: string) => {
  if (useMock) return getByIdMock("mock_blogs", id) as BlogPost & { id: string } | null;
  try {
    const docRef = doc(db, "blogs", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BlogPost & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching blog:", error);
    if (typeof window !== "undefined") return getByIdMock("mock_blogs", id) as BlogPost & { id: string } | null;
    return null;
  }
};

// EVENTS
export const createEvent = async (event: Event) => {
  if (useMock) return createMock("mock_events", event) as Event & { id: string };
  try {
    const docRef = await addDoc(collection(db, "events"), {
      ...event,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...event };
  } catch (error) {
    console.error("Error creating event:", error);
    if (typeof window !== "undefined") return createMock("mock_events", event) as Event & { id: string };
    throw error;
  }
};

export const updateEvent = async (id: string, event: Event) => {
  if (useMock) return updateMock("mock_events", id, event) as Event & { id: string };
  try {
    const docRef = doc(db, "events", id);
    await updateDoc(docRef, {
      ...event,
      updatedAt: new Date(),
    });
    return { id, ...event };
  } catch (error) {
    console.error("Error updating event:", error);
    if (typeof window !== "undefined") return updateMock("mock_events", id, event) as Event & { id: string };
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  if (useMock) return deleteMock("mock_events", id);
  try {
    await deleteDoc(doc(db, "events", id));
    return id;
  } catch (error) {
    console.error("Error deleting event:", error);
    if (typeof window !== "undefined") return deleteMock("mock_events", id);
    throw error;
  }
};

export const getAllEvents = async () => {
  if (useMock) return getAllMock("mock_events") as (Event & { id: string })[];
  try {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Event & { id: string })[];
  } catch (error) {
    console.error("Error fetching events:", error);
    if (typeof window !== "undefined") return getAllMock("mock_events") as (Event & { id: string })[];
    return [];
  }
};

export const getEventById = async (id: string) => {
  if (useMock) return getByIdMock("mock_events", id) as Event & { id: string } | null;
  try {
    const docRef = doc(db, "events", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Event & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching event:", error);
    if (typeof window !== "undefined") return getByIdMock("mock_events", id) as Event & { id: string } | null;
    return null;
  }
};

// PROJECTS
export const createProject = async (project: Project) => {
  if (useMock) return createMock("mock_projects", project) as Project & { id: string };
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...project,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...project };
  } catch (error) {
    console.error("Error creating project:", error);
    if (typeof window !== "undefined") return createMock("mock_projects", project) as Project & { id: string };
    throw error;
  }
};

export const updateProject = async (id: string, project: Project) => {
  if (useMock) return updateMock("mock_projects", id, project) as Project & { id: string };
  try {
    const docRef = doc(db, "projects", id);
    await updateDoc(docRef, {
      ...project,
      updatedAt: new Date(),
    });
    return { id, ...project };
  } catch (error) {
    console.error("Error updating project:", error);
    if (typeof window !== "undefined") return updateMock("mock_projects", id, project) as Project & { id: string };
    throw error;
  }
};

export const deleteProject = async (id: string) => {
  if (useMock) return deleteMock("mock_projects", id);
  try {
    await deleteDoc(doc(db, "projects", id));
    return id;
  } catch (error) {
    console.error("Error deleting project:", error);
    if (typeof window !== "undefined") return deleteMock("mock_projects", id);
    throw error;
  }
};

export const getAllProjects = async () => {
  if (useMock) return getAllMock("mock_projects") as (Project & { id: string })[];
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Project & { id: string })[];
  } catch (error) {
    console.error("Error fetching projects:", error);
    if (typeof window !== "undefined") return getAllMock("mock_projects") as (Project & { id: string })[];
    return [];
  }
};

export const getProjectById = async (id: string) => {
  if (useMock) return getByIdMock("mock_projects", id) as Project & { id: string } | null;
  try {
    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Project & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching project:", error);
    if (typeof window !== "undefined") return getByIdMock("mock_projects", id) as Project & { id: string } | null;
    return null;
  }
};
