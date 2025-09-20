const mockDocs: any[] = [];

//make iterator to give id to doc
export const addDoc = jest.fn(async () => ({ id: "mock-doc-id" }));
export const setDoc = jest.fn(async () => {});
export const updateDoc = jest.fn(async () => {});
export const getDocs = jest.fn(async () => ({
  empty: mockDocs.length === 0,
  docs: mockDocs.map((d, i) => ({
    id: `mock-id-${i}`,
    data: () => d,
  })),
}));
export const getDoc = jest.fn(async () => ({
  exists: () => mockDocs.length > 0,
  data: () => mockDocs[0] ?? {},
}));
export const collection = jest.fn(() => "mock-collection");
export const doc = jest.fn(() => "mock-doc");
export const query = jest.fn();
export const where = jest.fn();
export const increment = jest.fn(() => 1);
export const serverTimestamp = jest.fn(() => new Date());

export { mockDocs };