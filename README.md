# Zono.js

Zono.js — a modern, lightweight timezone-aware date library inspired by Moment.js.

## Quick start

Install (once published to npm):
```bash
npm install zono

// Node:
const Zono = require('./dist/zono.cjs.js');
console.log(Zono('2025-10-14 21:29:41', { tz: 'Asia/Kolkata' }).format('LLLL'));

// Browser:
// <script src="dist/zono.umd.min.js"></script>
// window.Zono(...)
