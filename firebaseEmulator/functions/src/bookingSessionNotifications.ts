import { firestore } from "firebase-functions";
import { FcmPayloadInterface, sendMultipleNotifications, sendSingleNotification } from "./notificationServiceHelper";
import { onRequest } from "firebase-functions/https";
import { db } from ".";
// import { onSchedule } from "firebase-functions/scheduler";

export const bookingSessionNotifications = {
  // Call this when the session is completed
  // Expects the tokens and payloads in body
  sendFeedbackNotification: onRequest(async (request, response) => {
    try {
      const data = request.body;
      sendMultipleNotifications(data.tokens, data.payloads);
      response.status(200).send("Notification Request Processed");
    } catch (error) {
      response.status(500).send("Failed to process notification request");
    }
  }),

  sendBookingRequestNotification: firestore.onDocumentUpdated(`Bookings/{sessionId}`, async (event) => {
    const newValue = event.data?.after.data();
    const oldValue = event.data?.before.data();
    if (oldValue && newValue) {
      const addedUserIds = (newValue.participantIds || []).filter((id: string) => !(oldValue.participantIds || []).includes(id));
      //If a change was notified for other update and not new user, then don't worry.
      if (addedUserIds.length == 0) return;

      // Get the owner's FCM token to notify the owner
      const ownerId = newValue.ownerId;
      if (!ownerId) return;

      const ownerSnap = await db.collection("users").doc(ownerId).get();
      const ownerData = ownerSnap.data();

      if (!ownerData?.fcmToken) return;

      // Send the message here, with token identifying the target
      const fcmMessage: FcmPayloadInterface = {
        notification: {
          title: "Join request",
          body: "These users want to join your session",
        },
        data: {
          newUserIds: JSON.stringify(addedUserIds),
        },
      };
      sendSingleNotification(ownerData.fcmToken, fcmMessage);
    }
  }),

  // 10 min reminder
  // how to set a specific time when we need to retrieve from firestore first?
  // sendSessionReminder: firestore.onDocumentCreated(`Bookings/{sessionId}`, async(event) =>{
  //   const startTime = event.data?.data().startTime;
  //   onSchedule()

  // })
};
