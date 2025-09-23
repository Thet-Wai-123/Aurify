declare module "firebase/firestore" {
    export const addDoc: jest.Mock;
    export const setDoc: jest.Mock;
    export const updateDoc: jest.Mock;
    export const getDocs: jest.Mock;
    export const getDoc: jest.Mock;
    export const collection: jest.Mock;
    export const doc: jest.Mock;
    export const query: jest.Mock;
    export const where: jest.Mock;
    export const increment: jest.Mock;
    export const serverTimestamp: jest.Mock;


    export const mockDocs: any[];
  }