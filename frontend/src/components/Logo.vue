<template>
<img class="NinjaLogo" src="@/assets/logo.png" style="cursor: pointer" @click="$router.push('/')" alt="logo">
</template>

<style>
.NinjaLogo {
  animation: 1s appear;
}

@keyframes appear {
  0% {
    opacity: 0;
  }
}
</style>
