/**
 * Firebase Service
 * Firebase 초기화 및 서비스 제공
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  Auth,
  signInAnonymously,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
// @ts-expect-error - React Native persistence is available in the bundle
import { getReactNativePersistence } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';

// Firebase 설정
// TODO: Firebase Console에서 생성한 프로젝트 설정으로 교체
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Firebase 인스턴스
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

/**
 * Firebase 초기화
 */
export function initializeFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    db = getFirestore(app);
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }

  return { app, auth, db };
}

/**
 * Firebase가 설정되었는지 확인
 */
export function isFirebaseConfigured(): boolean {
  return firebaseConfig.apiKey !== 'YOUR_API_KEY' && firebaseConfig.projectId !== 'YOUR_PROJECT_ID';
}

// ─────────────────────────────────────
// 인증 (Authentication)
// ─────────────────────────────────────

/**
 * 익명 로그인
 */
export async function signInAnonymouslyUser(): Promise<User | null> {
  try {
    const { auth } = initializeFirebase();
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('[Firebase] Anonymous sign-in failed:', error);
    return null;
  }
}

/**
 * 현재 사용자 가져오기
 */
export function getCurrentUser(): User | null {
  const { auth } = initializeFirebase();
  return auth.currentUser;
}

/**
 * 인증 상태 리스너
 */
export function onAuthChanged(callback: (user: User | null) => void): () => void {
  const { auth } = initializeFirebase();
  return onAuthStateChanged(auth, callback);
}

// ─────────────────────────────────────
// Firestore 헬퍼 함수
// ─────────────────────────────────────

/**
 * 컬렉션 참조 가져오기
 */
export function getCollection(collectionPath: string) {
  const { db } = initializeFirebase();
  return collection(db, collectionPath);
}

/**
 * 문서 참조 가져오기
 */
export function getDocument(collectionPath: string, docId: string) {
  const { db } = initializeFirebase();
  return doc(db, collectionPath, docId);
}

/**
 * 문서 읽기
 */
export async function readDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string
): Promise<T | null> {
  try {
    const docRef = getDocument(collectionPath, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as T;
    }
    return null;
  } catch (error) {
    console.error('[Firebase] Read document failed:', error);
    return null;
  }
}

/**
 * 문서 생성/업데이트
 */
export async function writeDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string,
  data: T
): Promise<boolean> {
  try {
    const docRef = getDocument(collectionPath, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('[Firebase] Write document failed:', error);
    return false;
  }
}

/**
 * 문서 부분 업데이트
 */
export async function updateDocument(
  collectionPath: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<boolean> {
  try {
    const docRef = getDocument(collectionPath, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('[Firebase] Update document failed:', error);
    return false;
  }
}

/**
 * 문서 삭제
 */
export async function deleteDocument(collectionPath: string, docId: string): Promise<boolean> {
  try {
    const docRef = getDocument(collectionPath, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('[Firebase] Delete document failed:', error);
    return false;
  }
}

/**
 * 쿼리 실행
 */
export async function queryDocuments<T extends DocumentData>(
  collectionPath: string,
  queryConstraints: {
    field?: string;
    operator?: '<' | '<=' | '==' | '>=' | '>' | 'array-contains';
    value?: unknown;
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
  }
): Promise<T[]> {
  try {
    const collectionRef = getCollection(collectionPath);
    const constraints = [];

    if (
      queryConstraints.field &&
      queryConstraints.operator &&
      queryConstraints.value !== undefined
    ) {
      constraints.push(
        where(queryConstraints.field, queryConstraints.operator, queryConstraints.value)
      );
    }

    if (queryConstraints.orderByField) {
      constraints.push(
        orderBy(queryConstraints.orderByField, queryConstraints.orderDirection || 'desc')
      );
    }

    if (queryConstraints.limitCount) {
      constraints.push(limit(queryConstraints.limitCount));
    }

    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as unknown as T[];
  } catch (error) {
    console.error('[Firebase] Query failed:', error);
    return [];
  }
}

// ─────────────────────────────────────
// 커뮤니티 레슨 관련
// ─────────────────────────────────────

export const COLLECTIONS = {
  USERS: 'users',
  LESSONS: 'community_lessons',
  REVIEWS: 'lesson_reviews',
  DOWNLOADS: 'lesson_downloads',
  REPORTS: 'lesson_reports',
} as const;

// Firebase 서비스 객체
export const firebase = {
  initialize: initializeFirebase,
  isConfigured: isFirebaseConfigured,
  // Auth
  signInAnonymously: signInAnonymouslyUser,
  getCurrentUser,
  onAuthChanged,
  // Firestore
  getCollection,
  getDocument,
  readDocument,
  writeDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
  // Constants
  COLLECTIONS,
};

export default firebase;
