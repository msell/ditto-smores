import { init, Ditto } from "@dittolive/ditto";

let ditto: Ditto | null = null;

export async function initializeDitto() {
  if (ditto) {
    // If ditto exists but sync might have stopped, restart it
    try {
      ditto.startSync();
      return;
    } catch (error) {
      console.log("Error restarting sync, reinitializing Ditto:", error);
      ditto = null;
    }
  }

  console.log("initializing ditto");
  await init();
  console.log(`EXPO_PUBLIC_DITTO_APP_ID`, process.env.EXPO_PUBLIC_DITTO_APP_ID);
  ditto = new Ditto({
    type: "onlinePlayground",
    appID: process.env.EXPO_PUBLIC_DITTO_APP_ID || "",
    token: process.env.EXPO_PUBLIC_DITTO_PLAYGROUND_TOKEN || "",
  });

  await ditto.disableSyncWithV3();
  ditto.startSync();
}

export function getDitto(): Ditto {
  if (!ditto) {
    throw new Error(
      "Ditto has not been initialized. Call initializeDitto() first."
    );
  }
  return ditto;
}
