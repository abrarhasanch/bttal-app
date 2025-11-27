// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Firebase Auth to avoid async act warnings in tests
jest.mock('firebase/auth', () => {
  return {
    getAuth: jest.fn(() => ({})),
    // Auth state listener fires synchronously with no user
    onAuthStateChanged: (_auth, callback) => {
      try {
        callback(null);
      } catch (e) {
        // ignore
      }
      return () => {};
    },
    createUserWithEmailAndPassword: jest.fn(() =>
      Promise.resolve({ user: { uid: 'test', email: 'test@example.com' } })
    ),
    signInWithEmailAndPassword: jest.fn(() =>
      Promise.resolve({ user: { uid: 'test', email: 'test@example.com' } })
    ),
    signOut: jest.fn(() => Promise.resolve()),
    EmailAuthProvider: { credential: jest.fn(() => ({})) },
    reauthenticateWithCredential: jest.fn(() => Promise.resolve()),
    updatePassword: jest.fn(() => Promise.resolve()),
  };
});

// Mock our firebase service module to avoid initializing real SDK in tests
jest.mock('./services/firebase', () => ({
  auth: {},
  db: {},
  appId: 'test-app',
}));
