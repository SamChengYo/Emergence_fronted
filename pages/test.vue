<script setup>
import { ref } from 'vue';
import { InputNumber, Button } from 'ant-design-vue';

const disabled = ref(true);

const toggle = () => {
  disabled.value = !disabled.value;
};
</script>

<template>
  <div>
    <a-input-number v-model:value="value" :min="1" :max="10" :disabled="disabled" :default-value="3" />
    <div style="margin-top: 20px">
      <a-button @click="toggle" type="primary">
        Toggle disabled
      </a-button>
    </div>
  </div>
</template>

<style scoped>
/* 你可以在這裡加入額外的樣式 */
</style>
