/**
 * Utility to check if a session is occurring "Right Now"
 * Handles both "10:00 AM" and "14:30" formats.
 */
export const isSessionRealTime = (session) => {
    if (!session || !['confirmed', 'accepted'].includes(session.status)) return false;
    if (!session.date || !session.time) return false;

    const now = new Date();
    const sessionDate = new Date(session.date);

    // 1. Check if same calendar day
    const isSameDay = sessionDate.getDate() === now.getDate() &&
        sessionDate.getMonth() === now.getMonth() &&
        sessionDate.getFullYear() === now.getFullYear();

    if (!isSameDay) return false;

    // 2. Parse time (robustly)
    let hours = 0;
    let minutes = 0;

    const timeStr = session.time.trim();
    const hasModifier = timeStr.includes('AM') || timeStr.includes('PM');

    if (hasModifier) {
        // Handle "10:00 AM" or "2:30 PM"
        const [timePart, modifier] = timeStr.split(' ');
        const [h, m] = timePart.split(':').map(Number);
        hours = h;
        minutes = m || 0;
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
    } else {
        // Handle "14:30"
        const [h, m] = timeStr.split(':').map(Number);
        hours = h;
        minutes = m || 0;
    }

    const sessionStartTime = new Date(now);
    sessionStartTime.setHours(hours, minutes, 0, 0);

    // 3. Define "Live" window: 15 mins before start to 90 mins after
    const diffInMinutes = (now - sessionStartTime) / (1000 * 60);

    // True if we are in the window
    return diffInMinutes >= -15 && diffInMinutes <= 90;
};
