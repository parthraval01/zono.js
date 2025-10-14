// src/core/relative.js
import { getLocale } from '../locale/locale.js';
export function humanizeRelative(deltaSec, localeName, withoutSuffix) {
    const localeData = getLocale(localeName).relative || {};
    const absSec = Math.abs(deltaSec);
    if (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) {
        const rtf = new Intl.RelativeTimeFormat(localeName, { numeric: 'auto' });
        if (absSec < 45) return rtf.format(Math.round(deltaSec), 'second');
        if (absSec < 2700) return rtf.format(Math.round(deltaSec / 60), 'minute');
        if (absSec < 64800) return rtf.format(Math.round(deltaSec / 3600), 'hour');
        if (absSec < 518400) return rtf.format(Math.round(deltaSec / 86400), 'day');
        if (absSec < 29030400) return rtf.format(Math.round(deltaSec / 2592000), 'month');
        return rtf.format(Math.round(deltaSec / 31536000), 'year');
    }
    // fallback
    if (absSec < 60) return localeData.s || 'a few seconds';
    if (absSec < 3600) return Math.round(absSec / 60) + ' minutes';
    if (absSec < 86400) return Math.round(absSec / 3600) + ' hours';
    if (absSec < 2592000) return Math.round(absSec / 86400) + ' days';
    if (absSec < 31536000) return Math.round(absSec / 2592000) + ' months';
    return Math.round(absSec / 31536000) + ' years';
}
