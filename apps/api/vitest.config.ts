import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    env: {
      JWT_SECRET: 'secreto-solo-para-pruebas-con-mas-de-32-caracteres',
      JWT_EXPIRES_IN: '1h',
      BCRYPT_ROUNDS: '4',
    },
  },
});
