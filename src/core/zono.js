// src/core/zono.js
import { parse } from './parse.js';
import { getOffsetMinutes } from './zone.js';
import { formatWithTokens } from './format.js';
import { getLocale } from '../locale/locale.js';
import { humanizeRelative } from './relative.js';

const pad = (n, z = 2) => String(n).padStart(z, '0');
const isNumber = v => typeof v === 'number' && isFinite(v);

class Zono {
    constructor(utcMs, tz = null, locale = 'en') {
        this._utcMs = parse(utcMs); // ensures numeric ms
        this._tz = tz || null;
        this._locale = locale || 'en';
        this._zoneOffsetMin = this._tz ? getOffsetMinutes(this._tz, this._utcMs) : -new Date(this._utcMs).getTimezoneOffset();
    }

    // Factories
    static now(tz = null, locale) { return new Zono(Date.now(), tz, locale); }
    static create(input, opts = {}) {
        const tz = opts.tz || null;
        const locale = opts.locale || 'en';
        const utcMs = parse(input, tz);
        return new Zono(utcMs, tz, locale);
    }
    static tz(input, tzName, locale) {
        const utcMs = parse(input, tzName);
        return new Zono(utcMs, tzName, locale || 'en');
    }
    static utc(input, locale) {
        const utcMs = parse(input, null);
        return new Zono(utcMs, null, locale || 'en');
    }

    // internal clone helper
    _cloneWith({ utcMs = null, tz = undefined, locale = undefined } = {}) {
        const newUtc = utcMs == null ? this._utcMs : utcMs;
        const newTz = tz === undefined ? this._tz : tz;
        const newLocale = locale === undefined ? this._locale : locale;
        return new Zono(newUtc, newTz, newLocale);
    }

    _localDate() {
        const adjusted = new Date(this._utcMs + (this._zoneOffsetMin * 60000));
        adjusted.__zoneOffsetMin = this._zoneOffsetMin;
        return adjusted;
    }

    // formatting
    format(fmt = 'YYYY-MM-DDTHH:mm:ssZ', localeOverride) {
        const locale = localeOverride || this._locale;
        // support locale macro formats (e.g., 'LT','L','LLL')
        const loc = getLocale(locale);
        if (loc && loc.formats && loc.formats[fmt]) {
            return formatWithTokens(loc.formats[fmt], this._localDate(), locale);
        }
        return formatWithTokens(fmt, this._localDate(), locale);
    }

    toISOString() {
        const d = this._localDate();
        const Y = d.getUTCFullYear(), M = pad(d.getUTCMonth() + 1), D = pad(d.getUTCDate());
        const h = pad(d.getUTCHours()), m = pad(d.getUTCMinutes()), s = pad(d.getUTCSeconds());
        const offset = -d.__zoneOffsetMin || 0; const sign = offset >= 0 ? '+' : '-'; const abs = Math.abs(offset);
        const Z = sign + pad(Math.floor(abs / 60)) + ':' + pad(abs % 60);
        return `${Y}-${M}-${D}T${h}:${m}:${s}${Z}`;
    }

    toJSON() { return this.toISOString(); }
    toDate() { return new Date(this._utcMs); }
    valueOf() { return this._utcMs; }
    unix() { return Math.floor(this._utcMs / 1000); }
    isValid() { return isNumber(this._utcMs) && isFinite(this._utcMs); }

    locale(loc) {
        if (!loc) return this._locale;
        return this._cloneWith({ locale: loc });
    }

    tz(tzName) {
        if (tzName === this._tz) return this;
        return this._cloneWith({ tz: tzName, utcMs: this._utcMs });
    }

    utc() { return this._cloneWith({ tz: null }); }

    // arithmetic
    add(amount, unit) {
        const u = (unit || 'millisecond').toLowerCase();
        if (['ms', 'millisecond', 'milliseconds'].includes(u)) {
            return this._cloneWith({ utcMs: this._utcMs + amount });
        } else if (['s', 'second', 'seconds'].includes(u)) {
            return this._cloneWith({ utcMs: this._utcMs + amount * 1000 });
        } else if (['m', 'minute', 'minutes'].includes(u)) {
            return this._cloneWith({ utcMs: this._utcMs + amount * 60000 });
        } else if (['h', 'hour', 'hours'].includes(u)) {
            return this._cloneWith({ utcMs: this._utcMs + amount * 3600000 });
        } else if (['d', 'day', 'days'].includes(u)) {
            return this._cloneWith({ utcMs: this._utcMs + amount * 86400000 });
        } else if (['month', 'months', 'M'].includes(u)) {
            const local = this._localDate();
            const y = local.getUTCFullYear(), mo = local.getUTCMonth(), day = local.getUTCDate();
            const targetMonth = mo + amount;
            const newUtc = Date.UTC(y, targetMonth, day, local.getUTCHours(), local.getUTCMinutes(), local.getUTCSeconds(), local.getUTCMilliseconds());
            const newOff = this._tz ? getOffsetMinutes(this._tz, newUtc) : -new Date(newUtc).getTimezoneOffset();
            return this._cloneWith({ utcMs: newUtc - newOff * 60000 });
        } else if (['year', 'years', 'y'].includes(u)) {
            const local = this._localDate();
            const ny = local.getUTCFullYear() + amount;
            const newUtc = Date.UTC(ny, local.getUTCMonth(), local.getUTCDate(), local.getUTCHours(), local.getUTCMinutes(), local.getUTCSeconds(), local.getUTCMilliseconds());
            const newOff = this._tz ? getOffsetMinutes(this._tz, newUtc) : -new Date(newUtc).getTimezoneOffset();
            return this._cloneWith({ utcMs: newUtc - newOff * 60000 });
        } else {
            throw new Error('Unsupported unit for add: ' + unit);
        }
    }

    subtract(amount, unit) { return this.add(-amount, unit); }

    diff(other, unit = 'ms', asFloat = false) {
        const otherZ = other instanceof Zono ? other : Zono.create(other);
        const delta = this._utcMs - otherZ._utcMs;
        const u = (unit || 'ms').toLowerCase();
        if (['ms', 'millisecond', 'milliseconds'].includes(u)) {
            const val = delta; return asFloat ? val : Math.floor(val);
        } else if (['s', 'second', 'seconds'].includes(u)) {
            const val = delta / 1000; return asFloat ? val : Math.floor(val);
        } else if (['m', 'minute', 'minutes'].includes(u)) {
            const val = delta / 60000; return asFloat ? val : Math.floor(val);
        } else if (['h', 'hour', 'hours'].includes(u)) {
            const val = delta / 3600000; return asFloat ? val : Math.floor(val);
        } else if (['d', 'day', 'days'].includes(u)) {
            const val = delta / 86400000; return asFloat ? val : Math.floor(val);
        } else if (['month', 'months', 'M'].includes(u)) {
            const a = this._localDate(), b = otherZ._localDate();
            const months = (a.getUTCFullYear() - b.getUTCFullYear()) * 12 + (a.getUTCMonth() - b.getUTCMonth());
            return asFloat ? months : Math.floor(months);
        } else if (['year', 'years', 'y'].includes(u)) {
            const a = this._localDate(), b = otherZ._localDate();
            const years = a.getUTCFullYear() - b.getUTCFullYear();
            return asFloat ? years : Math.floor(years);
        } else {
            throw new Error('Unsupported diff unit: ' + unit);
        }
    }

    _localStartOf(unit) {
        const unitLower = (unit || 'day').toLowerCase();
        const d = this._localDate();
        if (unitLower === 'year') {
            d.setUTCMonth(0, 1); d.setUTCHours(0, 0, 0, 0);
        } else if (unitLower === 'month') {
            d.setUTCDate(1); d.setUTCHours(0, 0, 0, 0);
        } else if (unitLower === 'day') {
            d.setUTCHours(0, 0, 0, 0);
        } else if (unitLower === 'hour') {
            d.setUTCMinutes(0, 0, 0);
        } else if (unitLower === 'minute') {
            d.setUTCSeconds(0, 0);
        } else if (unitLower === 'second') {
            d.setUTCMilliseconds(0);
        } else {
            throw new Error('Unsupported startOf unit: ' + unit);
        }
        const asUtc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
        const newOff = this._tz ? getOffsetMinutes(this._tz, asUtc) : -new Date(asUtc).getTimezoneOffset();
        return new Zono(asUtc - newOff * 60000, this._tz, this._locale);
    }

    startOf(unit) { return this._localStartOf(unit); }

    endOf(unit) {
        const next = this._localStartOf(unit).add(1, unit);
        return next.subtract(1, 'ms');
    }

    from(other = Zono.now(this._tz, this._locale), withoutSuffix = false) {
        const otherZ = other instanceof Zono ? other : Zono.create(other);
        const deltaSec = Math.round((this._utcMs - otherZ._utcMs) / 1000); // positive if this in future
        const human = humanizeRelative(deltaSec, this._locale, withoutSuffix);
        if (withoutSuffix) return human;
        // If human is already localized string, return directly
        if (typeof human === 'string') {
            return human;
        }
        const localeData = getLocale(this._locale).relative || {};
        if (deltaSec > 0) return (localeData.future || 'in %s').replace('%s', human);
        return (localeData.past || '%s ago').replace('%s', human);
    }

    fromNow(withoutSuffix = false) { return this.from(Zono.now(this._tz, this._locale), withoutSuffix); }

    calendar(now = Zono.now(this._tz, this._locale)) {
        const nowZ = now instanceof Zono ? now : Zono.create(now);
        const diffDays = Math.floor((this._localStartOf('day')._utcMs - nowZ._localStartOf('day')._utcMs) / 86400000);
        const localeData = getLocale(this._locale);
        const cal = localeData.calendar || {};
        let fmt;
        if (diffDays === 0) fmt = cal.sameDay || 'LT';
        else if (diffDays === 1) fmt = cal.nextDay || 'ddd [at] LT';
        else if (diffDays === -1) fmt = cal.lastDay || 'ddd [at] LT';
        else if (diffDays < -1 && diffDays >= -7) fmt = cal.lastWeek || 'ddd [at] LT';
        else if (diffDays > 1 && diffDays <= 7) fmt = cal.nextWeek || 'ddd [at] LT';
        else fmt = cal.sameElse || 'L';
        const F = localeData.formats && localeData.formats.LT ? localeData.formats.LT : 'h:mm A';
        const finalFmt = fmt.replace('LT', F);
        return this.format(finalFmt, this._locale);
    }

    isBefore(other) { const o = other instanceof Zono ? other : Zono.create(other); return this._utcMs < o._utcMs; }
    isAfter(other) { const o = other instanceof Zono ? other : Zono.create(other); return this._utcMs > o._utcMs; }
    isSame(other) { const o = other instanceof Zono ? other : Zono.create(other); return this._utcMs === o._utcMs; }

    clone() { return new Zono(this._utcMs, this._tz, this._locale); }

    // plugin glue
    static defineLocale(name, data) {
        // require at runtime to avoid circular import at top-level
        // In ESM builds the runtime module loader will resolve this.
        // If using bundlers, this will be resolved to module's export.
        const mod = require('../locale/locale.js');
        if (mod && mod.defineLocale) mod.defineLocale(name, data);
    }
    static setDefaultLocale(name) {
        const mod = require('../locale/locale.js');
        if (mod && mod.setDefaultLocale) mod.setDefaultLocale(name);
    }
    static localesList() {
        const mod = require('../locale/locale.js');
        if (mod && mod.listLocales) return mod.listLocales();
        return [];
    }
    static extend(fn) {
        try { fn(Zono); return true; } catch (e) { console.error('Zono extend error', e); return false; }
    }
}

export default Zono;
