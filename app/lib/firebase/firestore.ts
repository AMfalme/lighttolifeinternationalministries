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
  where,
} from "firebase/firestore";

// Firestore settings doc for donation number
const DONATION_SETTINGS_DOC = doc(db, "settings", "donation");

export const DEFAULT_DONATION_NUMBER = "+254 700 123 456";

export const getDonationNumber = async () => {
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
  branch?: string;
  date: string;
  category: string;
  imageUrl?: string;
  additionalImageUrls?: string[];
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
  
  startDate: string;
  endDate?: string;
  
  createdAt?: any;
  updatedAt?: any;

  title: string;
  description: string;

  category: string;
  location: string;

  status: "ongoing" | "future" | "completed";

  plannedAmount: number;
  donatedAmount: number;

  beneficiaries: string;
  timeline: string;

  imageUrl: string;

  objectives: string[];

}

export interface Projections {

}

export interface DashboardImage {
  id?: string;
  url: string;
  publicId: string;
  fileName: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  uploadedBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

// DONATION
export interface Donation {
  id?: string;
  email: string;
  amount: number;
  currency: string;
  donorName?: string;
  phone?: string;
  reference: string;
  channel?: string;
  status: string;
  message?: string;
  createdAt?: any;
}

export const createDonation = async (donation: Omit<Donation, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "donations"), {
      ...donation,
      createdAt: new Date(),
    });
    return { id: docRef.id, ...donation, createdAt: new Date() };
  } catch (error) {
    console.error("Error creating donation:", error);
    throw error;
  }
};

export const getAllDonations = async () => {
  try {
    const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Donation & { id: string })[];
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
};

export const getDonationById = async (id: string) => {
  try {
    const docRef = doc(db, "donations", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Donation & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching donation:", error);
    return null;
  }
};

export const getDonationByReference = async (reference: string) => {
  try {
    const q = query(collection(db, "donations"), where("reference", "==", reference));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Donation & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching donation by reference:", error);
    return null;
  }
};

export const updateDonationStatus = async (id: string, status: string) => {
  try {
    const docRef = doc(db, "donations", id);
    await updateDoc(docRef, { status, updatedAt: new Date() });
    return { id, status };
  } catch (error) {
    console.error("Error updating donation status:", error);
    throw error;
  }
};

// BLOGS
export const createBlog = async (blog: BlogPost) => {
  const { id, ...payload } = blog;
  const normalizedBlog = {
    title: String(payload.title || "").trim(),
    content: String(payload.content || "").trim(),
    author: String(payload.author || "").trim(),
    branch: payload.branch ? String(payload.branch).trim() : "",
    date: String(payload.date || new Date().toISOString().split("T")[0]).trim(),
    category: String(payload.category || "General").trim(),
    imageUrl: payload.imageUrl ? String(payload.imageUrl).trim() : "",
    additionalImageUrls: Array.isArray(payload.additionalImageUrls)
      ? payload.additionalImageUrls.map((url) => String(url || "").trim()).filter(Boolean)
      : [],
    featured: Boolean(payload.featured),
  } as BlogPost;

  try {
    const docRef = await addDoc(collection(db, "blogs"), {
      ...normalizedBlog,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...normalizedBlog, createdAt: new Date(), updatedAt: new Date() };
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
};

export const updateBlog = async (id: string, blog: BlogPost) => {
  const { id: _ignoredId, ...payload } = blog;
  const normalizedBlog = {
    title: String(payload.title || "").trim(),
    content: String(payload.content || "").trim(),
    author: String(payload.author || "").trim(),
    branch: payload.branch ? String(payload.branch).trim() : "",
    date: String(payload.date || new Date().toISOString().split("T")[0]).trim(),
    category: String(payload.category || "General").trim(),
    imageUrl: payload.imageUrl ? String(payload.imageUrl).trim() : "",
    additionalImageUrls: Array.isArray(payload.additionalImageUrls)
      ? payload.additionalImageUrls.map((url) => String(url || "").trim()).filter(Boolean)
      : [],
    featured: Boolean(payload.featured),
  } as BlogPost;

  try {
    const docRef = doc(db, "blogs", id);
    await updateDoc(docRef, {
      ...normalizedBlog,
      updatedAt: new Date(),
    });
    return { id, ...normalizedBlog };
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
};

export const deleteBlog = async (id: string) => {
  try {
    await deleteDoc(doc(db, "blogs", id));
    return id;
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};

export const getAllBlogs = async () => {
  try {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (BlogPost & { id: string })[];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
};

export const getBlogById = async (id: string) => {
  try {
    const docRef = doc(db, "blogs", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BlogPost & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
};

// EVENTS
export const createEvent = async (event: Event) => {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      ...event,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...event };
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const updateEvent = async (id: string, event: Event) => {
  try {
    const docRef = doc(db, "events", id);
    await updateDoc(docRef, {
      ...event,
      updatedAt: new Date(),
    });
    return { id, ...event };
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  try {
    await deleteDoc(doc(db, "events", id));
    return id;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

export const getAllEvents = async () => {
  try {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Event & { id: string })[];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const getEventById = async (id: string) => {
  try {
    const docRef = doc(db, "events", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Event & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
};

export interface EventRegistration {
  id?: string;
  eventId: string;
  userId: string;
  email: string;
  displayName?: string;
  role?: string;
  branchLocation?: string;
  registeredAt?: any;
}

export const registerUserForEvent = async (registration: Omit<EventRegistration, "id" | "registeredAt">) => {
  const payload: EventRegistration = {
    ...registration,
    registeredAt: new Date(),
  };

  const id = `${registration.eventId}_${registration.userId}`;
  await setDoc(doc(db, "eventRegistrations", id), payload, { merge: true });
  return { id, ...payload } as EventRegistration & { id: string };
};

export const unregisterUserFromEvent = async (eventId: string, userId: string) => {
  const id = `${eventId}_${userId}`;
  await deleteDoc(doc(db, "eventRegistrations", id));
  return id;
};

export const getAllEventRegistrations = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "eventRegistrations"));
    return querySnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })) as (EventRegistration & { id: string })[];
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return [];
  }
};

export const getEventRegistrations = async (eventId: string) => {
  const registrations = await getAllEventRegistrations();
  return registrations.filter((registration) => registration.eventId === eventId);
};

// PROJECTS
export const createProject = async (project: Project) => {
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...project,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...project };
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const updateProject = async (id: string, project: Project) => {
  try {
    const docRef = doc(db, "projects", id);
    await updateDoc(docRef, {
      ...project,
      updatedAt: new Date(),
    });
    return { id, ...project };
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const deleteProject = async (id: string) => {
  try {
    await deleteDoc(doc(db, "projects", id));
    return id;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export const getAllProjects = async () => {
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Project & { id: string })[];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const getProjectById = async (id: string) => {
  try {
    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Project & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
};

// DASHBOARD IMAGES
export const createDashboardImage = async (image: Omit<DashboardImage, "id" | "createdAt" | "updatedAt">) => {
  try {
    const docRef = await addDoc(collection(db, "dashboardImages"), {
      ...image,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...image };
  } catch (error) {
    console.error("Error creating dashboard image:", error);
    throw error;
  }
};

export const getAllDashboardImages = async () => {
  try {
    const q = query(collection(db, "dashboardImages"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (DashboardImage & { id: string })[];
  } catch (error) {
    console.error("Error fetching dashboard images:", error);
    return [];
  }
};

export const deleteDashboardImage = async (id: string) => {
  try {
    await deleteDoc(doc(db, "dashboardImages", id));
    return id;
  } catch (error) {
    console.error("Error deleting dashboard image:", error);
    throw error;
  }
};