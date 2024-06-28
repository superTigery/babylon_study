<script setup lang="ts">

import { BasicScene } from './components/BasicScene';
import { onMounted, ref } from 'vue'
import { ConfigType } from './types/index'

const canvasDom = ref<HTMLCanvasElement | undefined>()
let scene: BasicScene;
let config: ConfigType;


async function fetchJSONConfig() {
  try {
    const response = await fetch('/config.json')
    if (!response.ok) {
      console.error('【fetchJSONConfig】获取config.json失败')
    } else {
      return await response.json()

    }
  } catch (error) {
    console.error('【fetchJSONConfig】获取config.json失败', error)
  }
}

onMounted(async () => {
  await fetchJSONConfig().then(data => {
    config = data
  })

  if (!canvasDom.value) return;
  scene = new BasicScene(canvasDom.value!, config)

})
</script>

<template>
  <div class="content">
    <canvas ref="canvasDom" class="canvas-el"></canvas>
  </div>
</template>

<style scoped>
.content {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: url(./assets/imgs/bg.jpg) no-repeat 100% 100%;
}

.canvas-el {
  width: 100%;
  height: 100%;
}
</style>
