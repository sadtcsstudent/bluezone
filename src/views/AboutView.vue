<template>
  <div class="about">
    <h1>{{ $t('about.title') }}</h1>
    <p>{{ $t('about.description') }}</p>
    <ul>
      <li>Vue.js 3</li>
      <li>Vue Router 4</li>
      <li>Vite</li>
      <li>Node.js</li>
      <li>Yarn</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AboutView'
}
</script>

<style scoped>
.about {
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  color: #42b983;
  margin-bottom: 1rem;
}

ul {
  text-align: left;
  margin-top: 1rem;
}

li {
  padding: 0.5rem 0;
}
</style>
