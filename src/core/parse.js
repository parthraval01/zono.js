// src/core/parse.js
import { getOffsetMinutes } from './zone.js';
export function parse(input, tz) {
    if (input == null) return Date.now();
    if (input instanceof Date) return input.getTime();
    if (typeof input === 'number') return input;
    if (typeof input === 'string') {
        const iso = Date.parse(input);
        if (!isNaN(iso)) return iso;
        const m = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?$/);
        if (m) {
            const y = parseInt(m[1], 10), mon = parseInt(m[2], 10) - 1, day = parseInt(m[3], 10);
            const hh = parseInt(m[4] || 0, 10), mm = parseInt(m[5] || 0, 10), ss = parseInt(m[6] || 0, 10);
            const ms = m[7] ? parseInt((m[7] + '000').slice(0, 3), 10) : 0;
            if (tz) {
                const asUtc = Date.UTC(y, mon, day, hh, mm, ss, ms);
                const off = getOffsetMinutes(tz, asUtc);
                return asUtc - off * 60000;
            } else {
                return new Date(y, mon, day, hh, mm, ss, ms).getTime();
            }
        }
    }
    if (typeof input === 'object') {
        const y = input.year || input.Y || 1970;
        const mon = (input.month || input.M || 1) - 1;
        const day = input.day || input.D || 1;
        const hh = input.hour || input.h || 0;
        const mm = input.minute || input.min || 0;
        const ss = input.second || input.s || 0;
        const ms = input.millisecond || input.ms || 0;
        const utcMs = Date.UTC(y, mon, day, hh, mm, ss, ms);
        if (tz && input._tzWallClock) {
            const off = getOffsetMinutes(tz, utcMs);
            return utcMs - off * 60000;
        }
        return utcMs;
    }
    throw new Error('Unsupported parse input for Zono');
}
