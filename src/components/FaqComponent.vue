<template>
  <div>
    <a-list bordered :dataSource="faqs" :row-key="(item) => item.question">
      <template #renderItem="{ item, index }">
        <a-list-item @click="toggle(index)">
          <a-list-item-meta :title="item.question" />
          <div v-if="activeIndex === index">
            {{ item.answer }}
            <a :href="item.pdfLink" target="_blank">View PDF</a>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { faqData } from "../data/faqData";

const faqs = ref(faqData);
const activeIndex = ref(null);

const toggle = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};
</script>
