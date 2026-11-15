// Prueba de humo
const baseUrl = (process.env.API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const email = `smoke-${Date.now()}@mentormatch.test`;
const password = 'Clave12345';
let failed = false;

async function call(method, path, { body, token } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(90000),
  });
  return { status: response.status, payload: await response.json() };
}

async function check(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    failed = true;
    console.error(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function expectStatus(result, status) {
  if (result.status !== status) {
    throw new Error(`esperaba HTTP ${status} y llegó ${result.status}: ${JSON.stringify(result.payload)}`);
  }
}

let token;

await check('POST /api/auth/register crea el usuario (201) sin exponer la contraseña', async () => {
  const r = await call('POST', '/api/auth/register', { body: { full_name: 'Usuario Smoke', email, password } });
  expectStatus(r, 201);
  token = r.payload.data.token;
  if (!token) throw new Error('no devolvió token');
  if ('password' in r.payload.data.user) throw new Error('la respuesta expone el campo password');
});

await check('POST /api/auth/register con el mismo correo responde 409', async () => {
  expectStatus(await call('POST', '/api/auth/register', { body: { full_name: 'Otro', email, password } }), 409);
});

await check('POST /api/auth/login correcto devuelve token', async () => {
  const r = await call('POST', '/api/auth/login', { body: { email, password } });
  expectStatus(r, 200);
  token = r.payload.data.token;
});

await check('POST /api/auth/login con contraseña incorrecta responde 401', async () => {
  expectStatus(await call('POST', '/api/auth/login', { body: { email, password: 'Incorrecta999' } }), 401);
});

await check('GET /api/auth/me sin token responde 401', async () => {
  expectStatus(await call('GET', '/api/auth/me'), 401);
});

await check('GET /api/auth/me con token devuelve el usuario', async () => {
  const r = await call('GET', '/api/auth/me', { token });
  expectStatus(r, 200);
  if (r.payload.data.email !== email) throw new Error('el correo no coincide');
});

if (failed) process.exitCode = 1;
