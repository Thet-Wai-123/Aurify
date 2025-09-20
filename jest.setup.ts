import "@testing-library/jest-dom";


jest.mock("firebase/firestore", () => require("@/lib/mocks/firebase"));


jest.mock("@/lib/firebase", () => {
  const mockAuth = {
    currentUser: { uid: "test-user-id" },
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: "test-user-id" } })),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: "test-user-id" } })),
    signOut: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn((cb) => cb({ uid: "test-user-id" })),
  };

  const mockFirestore = {};

  return { auth: mockAuth, db: mockFirestore };
}); 