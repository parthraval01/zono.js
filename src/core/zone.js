// src/core/zone.js
export function getOffsetMinutes(timeZone, utcMs) {
    if (!timeZone || typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
        return -new Date(utcMs).getTimezoneOffset();
    }
    const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const parts = dtf.formatToParts(new Date(utcMs));
    const map = {};
    for (const p of parts) if (p.type !== 'literal') map[p.type] = p.value;
    const y = parseInt(map.year, 10), M = parseInt(map.month, 10), d = parseInt(map.day, 10);
    const h = parseInt(map.hour, 10), m = parseInt(map.minute, 10), s = parseInt(map.second, 10);
    const asUtc = Date.UTC(y, M - 1, d, h, m, s);
    const offsetMs = utcMs - asUtc;
    return -Math.round(offsetMs / 60000);
}
