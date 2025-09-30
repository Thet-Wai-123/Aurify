import * as admin from "firebase-admin";

const projectId = "aurify-test"
process.env.GLOUD_PROJECT = projectId;
process.env.FIRESTORE_EMULATOR_HOST = "local:8080";
admin.initializeApp();

export interface FcmMessageInterface {
  token: string;
  data?: Record<string, string>; // optional key-value data
  notification?: {
    title: string;
    body: string;
  };
}

export function sendSingleNotification(message: FcmMessageInterface) {
  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
      return;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log("Error sending message:", error);
      return;
    });
}

//send multicast combined message notification to devices.
export function multicastNotifications(tokens: string[], payload: { notification?: { title: string; body: string }; data?: Record<string, string> }) {
  const message = {
    tokens,
    ...payload,
  };
  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) failedTokens.push(tokens[idx]);
        });
        console.log("Tokens that failed:", failedTokens);
      }
    })
    .catch((err) => console.log("Error sending multicast:", err));
}
