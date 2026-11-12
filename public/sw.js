// Service worker: the browser keeps this running in the background,
// so it can show reminders even when the Habit Tracker tab is closed.

self.addEventListener("push", (event) => {
  const data = readPushData(event);

  event.waitUntil(
    self.registration.showNotification(data.title || "Habit Tracker", {
      body: data.body || "Time for your habit!",
      // A repeat push with the same tag replaces the old notification instead of stacking.
      tag: data.tag,
      data: { url: data.url || "/" },
    })
  );
});

// Clicking a notification focuses an open Habit Tracker tab, or opens one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const openTab = windows.find((tab) => tab.url.startsWith(self.location.origin));
      return openTab ? openTab.focus() : self.clients.openWindow(url);
    })
  );
});

// Our server sends JSON. DevTools' test "Push" button sends plain text.
function readPushData(event) {
  if (!event.data) return {};
  try {
    return event.data.json();
  } catch {
    return { body: event.data.text() };
  }
}
