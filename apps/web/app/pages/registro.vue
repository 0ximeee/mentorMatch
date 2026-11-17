<script setup lang="ts">
const auth = useAuthStore();
const form = reactive({ fullName: "", email: "", password: "" });
const error = ref("");

async function submit() {
  error.value = "";
  try {
    await auth.register(form);
    await navigateTo("/login");
  } catch (e: any) {
      error.value = e?.data?.error?.message ?? e?.message ?? "No se pudo iniciar sesión";
  }
}
</script>

<template>
  <main class="mx-auto max-w-sm p-6">
    <h1 class="mb-4 text-2xl font-bold">Crear cuenta</h1>
    <form class="space-y-3" @submit.prevent="submit">
      <input v-model="form.fullName" placeholder="Nombre completo" class="w-full rounded border p-2" required />
      <input v-model="form.email" type="email" placeholder="Correo" class="w-full rounded border p-2" required />
      <input v-model="form.password" type="password" placeholder="Contraseña" class="w-full rounded border p-2" required />
      <p v-if="error" class="text-red-600">{{ error }}</p>
      <button class="w-full rounded bg-blue-600 p-2 text-white">Registrarme</button>
    </form>
    <NuxtLink to="/login" class="mt-4 block text-sm text-blue-700">Ya tengo cuenta</NuxtLink>
  </main>
</template>