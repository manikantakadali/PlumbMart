/**
 * Unified In-App Notification Dispatcher for PlumbMart
 * Dispatches real-time instant notifications across tabs and windows
 * to target specific user roles: 'Customers', 'Dealers', 'Plumbers', or 'All'.
 */
export function dispatchInAppNotification({
  title,
  message,
  targetGroup = 'All', // 'All' | 'Customers' | 'Dealers' | 'Plumbers'
  priority = 'normal', // 'normal' | 'high' | 'urgent'
  type = 'NOTIFICATION', // 'NOTIFICATION' | 'ORDER_UPDATE' | 'DEALER_UPDATE' | 'PLUMBER_UPDATE' | 'ANNOUNCEMENT'
  sender = 'Admin',
  id = null,
  link = null
}) {
  const notifPayload = {
    id: id || `inapp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    message,
    targetGroup,
    priority,
    type,
    sender,
    link,
    sentAt: 'Just now',
    timestamp: Date.now()
  };

  // 1. Primary BroadcastChannel
  try {
    const ch = new BroadcastChannel('plumbmart_inapp_notifications');
    ch.postMessage(notifPayload);
    ch.close();
  } catch (e) {}

  // 2. Cross-tab LocalStorage sync (for tabs waking up or backgrounded)
  try {
    localStorage.setItem('plumbmart_inapp_notification_broadcast', JSON.stringify(notifPayload));
  } catch (e) {}

  // 3. Same-window custom event
  try {
    window.dispatchEvent(new CustomEvent('plumbmart_inapp_notify', { detail: notifPayload }));
  } catch (e) {}

  return notifPayload;
}
