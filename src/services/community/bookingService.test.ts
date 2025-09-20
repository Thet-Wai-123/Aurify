import { addDoc, updateDoc, getDocs, arrayRemove, arrayUnion } from "firebase/firestore";
import {
  acceptBookingRequest,
  rejectBookingRequest,
  getCurUserScheduledSessions,
  ServiceType,
} from "./bookingService";

// tell Jest to use the mock
jest.mock("@/lib/firebase"); // adjust path to your firebase module

describe("BookingService", () => {
  it("acceptBookingRequest calls updateDoc with correct fields", async () => {
    await acceptBookingRequest("session123", "user456");

    expect(arrayUnion).toHaveBeenCalledWith("user456");
  });

  it("rejectBookingRequest calls updateDoc to remove user from requests", async () => {
    await rejectBookingRequest("session123", "user456");

    expect(arrayRemove).toHaveBeenCalledWith("user456");
  });

  it("getCurUserScheduledSessions returns mapped sessions", async () => {
    jest.clearAllMocks();
    
    (getDocs as jest.Mock).mockResolvedValueOnce({
      docs: [
        {
          id: "s1",
          data: () => ({
            owner: "user1",
            participantIds: [],
            status: "Open",
            startTime: "now",
            endTime: "later",
            service: ServiceType.Interview,
            requests: [],
          }),
        },
        {
          id: "s2",
          data: () => ({
            owner: "user2",
            participantIds: ["user1"],
            status: "Open",
            startTime: "now",
            endTime: "later",
            service: ServiceType.Speech,
            requests: [],
          }),
        },
      ],
    });

    const sessions = await getCurUserScheduledSessions();

    expect(sessions).toHaveLength(2);
    expect(sessions[0]).toMatchObject({ sessionId: "s1", owner: "user1", participantIds: [] });
    expect(sessions[1]).toMatchObject({ sessionId: "s2", participantIds: ["user1"] });
  });
});
