import { sendSingleNotification, FcmMessageInterface, db } from "./src/notificationServiceHelper";
import { firestore, setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import { BOOKINGS_COLLECTION } from "../shared/firebaseCollectionPath";

setGlobalOptions({ maxInstances: 10 });

export const sendNotification = onRequest(async (request, response) => {
  logger.info("c", { structuredData: true });
  const data = request.body;
  // Calling helper function to send the notification
  sendSingleNotification(data);
  console.log("Notification Sent: ", data);
  response.send("Notification Request Processed");
});

export const receiveBookingRequestNotification = firestore.onDocumentUpdated(`${BOOKINGS_COLLECTION}/{sessionId}`, async (event) => {
  const newValue = event.data?.after.data();
  const oldValue = event.data?.before.data();
  if (oldValue && newValue) {
    const addedUserIds = (newValue.participantIds || []).filter((id: string) => !(oldValue.participantIds || []).includes(id));

    // Get the owner's FCM token to notify the owner
    const ownerId = newValue.ownerId;
    if (!ownerId) return;

    const ownerSnap = await db.collection("users").doc(ownerId).get();
    const ownerData = ownerSnap.data();
    if (!ownerData?.fcmToken) return;

    // Send the message here, with token identifying the target
    const fcmMessage: FcmMessageInterface = {
      token: ownerData.fcmToken,
      notification: {
        title: "Join request",
        body: "These users want to join your session",
      },
      data: {
        newUserIds: addedUserIds,
      },
    };
    sendSingleNotification(fcmMessage);
  }
});
