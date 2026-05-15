import type { Location } from "@/types/weather";

/**
 * Try to get the user's location via the Geolocation API.
 * Resolves to a Location (with a generic name) or rejects on permission denied / timeout.
 */
export function getUserLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          name: "My location",
          admin1: "",
          country: "",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => reject(err),
      { timeout: 8000, maximumAge: 600_000 }
    );
  });
}
