import { initializeTestEnvironment, RulesTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import fs from "fs";

let testEnv: RulesTestEnvironment;
const myId = "user_abc";
const theirId = "user_xyz";
const PROJECT_ID = "demo-myapp";

function getFirestore(auth?: string) {
  if (auth) {
    return testEnv.authenticatedContext(auth).firestore();
  } else {
    return testEnv.unauthenticatedContext().firestore();
  }
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: fs.readFileSync("../firestore.rules", "utf8"),
    },
  });

  await testEnv.clearFirestore();
});

describe("Security Rules", () => {
  it("Allow write to a user document with same ID as our user", async () => {
    const db = getFirestore(myId);
    const testDoc = db.collection("users").doc(myId);
    await assertSucceeds(testDoc.set({ foo: "bar" }));
  });

  it("Deny write to a user document with different ID as our user", async () => {
    const db = getFirestore(theirId);
    const testDoc = db.collection("users").doc(myId);
    await assertFails(testDoc.set({ foo: "bar" }));
  });

  it("Allow only append to requests field in booking document", async () => {
    //Arrange
    const setupDoc = {
      name: "Meeting Name",
      duration: "60",
      requests: ["user1", "user2", "user3"],
      owner: myId,
    };
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("bookings").doc("temp").set(setupDoc);
    });

    //Act
    const db = getFirestore(theirId);
    const testDoc = db.collection("bookings").doc("temp");

    //Assert
    await assertSucceeds(testDoc.update({ requests: ["user1", "user2", "user3", theirId] }));
  });

  it("Deny other changes to requests field in booking document", async () => {
    //Arrange
    const setupDoc = {
      name: "Meeting Name",
      duration: "60",
      requests: ["user1", "user2", "user3"],
      owner: myId,
    };
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("bookings").doc("temp").set(setupDoc);
    });

    //Act
    const db = getFirestore(theirId);
    const testDoc = db.collection("bookings").doc("temp");

    //Assert
    await assertFails(testDoc.update({ requests: [theirId] }));
    await assertFails(testDoc.update({ name: "Changed Name" }));
    await assertFails(testDoc.update({ duration: "10" }));
  });
});

afterAll(async () => {
  await testEnv.clearFirestore();
  await testEnv.cleanup();
});
