import { db } from '../lib/firebaseConfig';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

// Create a new user
export async function createUser({ name, username, password }) {
  // Check if username already exists
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    throw new Error('Username already exists');
  }

  const userId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const createdAt = Date.now();

  const userData = {
    name,
    username,
    createdAt,
    password: passwordHash,
    userId,
  };

  await setDoc(doc(db, 'users', userId), userData);
  return { userId, name, username, createdAt };
}

// Login user
export async function loginUser({ username, password }) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    throw new Error('User not found');
  }
  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data();
  const isMatch = await bcrypt.compare(password, userData.password);
  if (!isMatch) {
    throw new Error('Invalid password');
  }
  // Return user info except password
  const { password: _, ...userInfo } = userData;
  return userInfo;
}
