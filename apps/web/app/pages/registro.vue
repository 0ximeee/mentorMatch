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
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- Panel -->
    <AuthBrandPanelR/>

    <!-- Formulario -->
    <main class="flex items-center justify-center p-6">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 class="text-2xl font-bold">Comienza tu viaje en EduMatch</h1>
        <p class="mt-1 text-sm text-muted">Registra una cuenta para gestionar tus asesorías.</p>

        <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
          <BaseInput v-model="form.fullName" placeholder="Nombre completo" type="name" required/>
          <BaseInput v-model="form.email" placeholder="Correo" type="email" required />
          <BaseInput v-model="form.password" placeholder="Contraseña" type="password" required />
          <BaseButton>Registrarme</BaseButton>
        </form>

        <p class="mt-6 text-center text-sm text-muted">
          ¿Ya tienes cuenta?
          <NuxtLink to="/login" class="font-semibold text-brand-600">Iniciar Sesión</NuxtLink>
        </p>
      </div>
    </main>
  </div>
</template>
