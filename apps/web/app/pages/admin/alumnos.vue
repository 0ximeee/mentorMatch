<script setup lang="ts">
type Student = { id: number; full_name: string; email: string; created_at: string };

const api = useApi();
const { data: students, error, status } = await useAsyncData("students", async () => {
  const res = await api<{ data: Student[] }>("/api/users", { query: { role: "STUDENT" } });
  return res.data;
});
</script>

<template>
  <main class="mx-auto max-w-3xl p-6">
    <h1 class="mb-4 text-2xl font-bold">Alumnos registrados</h1>

    <p v-if="status === 'pending'">Cargando...</p>
    <p v-else-if="error" class="text-red-600">
      No se pudo cargar la lista (¿tienes rol ADMIN?).
    </p>

    <table v-else class="w-full text-left">
      <thead>
        <tr class="border-b"><th class="py-2">Nombre</th><th>Correo</th><th>Registro</th></tr>
      </thead>
      <tbody>
        <tr v-for="s in students" :key="s.id" class="border-b">
          <td class="py-2">{{ s.full_name }}</td>
          <td>{{ s.email }}</td>
          <td>{{ new Date(s.created_at).toLocaleDateString() }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>