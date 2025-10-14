// src/index.js
import ZonoClass from './core/zono.js';
import { defineLocale as _defineLocale, setDefaultLocale as _setDefaultLocale } from './locale/locale.js';

function Zono(input, opts) {
    if (input === undefined) return ZonoClass.now();
    if (opts && opts.tz) return ZonoClass.tz(input, opts.tz, opts.locale);
    return ZonoClass.create(input, opts || {});
}

// Attach statics
Zono.Zono = ZonoClass;
Zono.tz = ZonoClass.tz;
Zono.utc = ZonoClass.utc;
Zono.create = ZonoClass.create;
Zono.now = ZonoClass.now;
Zono.defineLocale = _defineLocale;
Zono.setDefaultLocale = _setDefaultLocale;
Zono.version = '0.1.0';

export default Zono;
// export { Zono as default };
