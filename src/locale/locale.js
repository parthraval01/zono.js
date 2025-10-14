// src/locale/locale.js
const locales = {
    en: {
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        relative: { future: 'in %s', past: '%s ago', s: 'a few seconds' },
        formats: {
            LT: 'h:mm A',
            LTS: 'h:mm:ss A',
            L: 'MM/DD/YYYY',
            LL: 'MMMM D, YYYY',
            LLL: 'MMMM D, YYYY h:mm A',
            LLLL: 'dddd, MMMM D, YYYY h:mm A'
        },
        calendar: { sameDay: '[Today at] LT', nextDay: '[Tomorrow at] LT', lastDay: '[Yesterday at] LT', sameElse: 'L' }
    }
};
let defaultLocale = 'en';
export function defineLocale(name, data) { locales[name] = Object.assign({}, locales[name] || {}, data); }
export function setDefaultLocale(name) { defaultLocale = name; }
export function getLocale(name) { return locales[name] || locales[defaultLocale]; }
export function listLocales() { return Object.keys(locales); }
