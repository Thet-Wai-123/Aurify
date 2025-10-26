import * as admin from "firebase-admin";

const projectId = "demo-no-project";
process.env.GCLOUD_PROJECT = projectId;
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

// Make sure to have a running emulator beforehand, this connects to the firebase SDK to access that emulator.
admin.initializeApp({ projectId });
const db = admin.firestore();

// To reset collection every run
beforeAll(async () => {
  await admin.firestore().recursiveDelete(admin.firestore().collection("users"));
  await admin.firestore().recursiveDelete(admin.firestore().collection("bookings"));

  const users = [
    { name: "Alice", age: 28, fcmToken: "token_1" },
    { name: "Bob", age: 35, fcmToken: "token_2" },
    { name: "Charlie", age: 42, fcmToken: "token_3" },
  ];

  for (const user of users) {
    await db.collection("users").add(user);
  }

  // time might not parse correctly, double check
  const bookingSessions = [{ owner: 1, startTime: "16:24:00" }];

  for (const bookingSession of bookingSessions) {
    await db.collection("bookings").add(bookingSession);
  }
});

describe("BookingSession", () => {
  it("Notification Testing", async () => {

  });
});
