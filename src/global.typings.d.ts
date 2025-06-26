/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

// Global type definitions
declare global {
  // Test globals are provided by vitest/globals
  // DOM testing library matchers are provided by @testing-library/jest-dom
  
  // Global constants defined in vite.config.ts
  const COMMITHASH: string;
  const APP_VERSION: string;
    
    // itest globals
    const vi: typeof import('vitest')['vi'];
}

export { }; 