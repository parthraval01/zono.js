// src/core/format.js
import { getLocale } from '../locale/locale.js';
const pad = (n, z = 2) => String(n).padStart(z, '0');

const tokenHandlers = {
    YYYY: d => d.getUTCFullYear(),
    YY: d => String(d.getUTCFullYear()).slice(-2),
    MMMM: (d, locale) => getLocale(locale).months[d.getUTCMonth()],
    MMM: (d, locale) => getLocale(locale).monthsShort[d.getUTCMonth()],
    MM: d => pad(d.getUTCMonth() + 1),
    M: d => d.getUTCMonth() + 1,
    DD: d => pad(d.getUTCDate()),
    D: d => d.getUTCDate(),
    dddd: (d, locale) => getLocale(locale).weekdays[d.getUTCDay()],
    ddd: (d, locale) => getLocale(locale).weekdaysShort[d.getUTCDay()],
    HH: d => pad(d.getUTCHours()),
    H: d => d.getUTCHours(),
    hh: d => pad((d.getUTCHours() % 12) || 12),
    h: d => (d.getUTCHours() % 12) || 12,
    mm: d => pad(d.getUTCMinutes()),
    m: d => d.getUTCMinutes(),
    ss: d => pad(d.getUTCSeconds()),
    s: d => d.getUTCSeconds(),
    SSS: d => pad(d.getUTCMilliseconds(), 3),
    A: d => (d.getUTCHours() < 12 ? 'AM' : 'PM'),
    a: d => (d.getUTCHours() < 12 ? 'am' : 'pm'),
    Z: d => {
        const offset = -d.__zoneOffsetMin || 0; const sign = offset >= 0 ? '+' : '-'; const abs = Math.abs(offset);
        return sign + pad(Math.floor(abs / 60)) + ':' + pad(abs % 60);
    }
};

export function formatWithTokens(fmt, dateObj, locale) {
    // support locale macro replacement first
    const loc = getLocale(locale);
    if (loc && loc.formats && loc.formats[fmt]) {
        fmt = loc.formats[fmt];
    }
    let out = fmt;
    const tokens = Object.keys(tokenHandlers).sort((a, b) => b.length - a.length);
    for (const t of tokens) out = out.split(t).join(String(tokenHandlers[t](dateObj, locale)));
    out = out.replace(/\[([^\]]+)\]/g, (_, txt) => txt);
    return out;
}
