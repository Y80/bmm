<template>
  <nav>
    <div class="container level">
      <router-link to="/index"
                   class="level-left">
        <div>
          <span class="site-name">🎏 BMM</span>
        </div>
      </router-link>
      <div class="level-right">
        <template v-if="isAdminPage">
          <router-link to="/admin/tags">
            <button class="button mr-5  is-ghost"
                    :class="{ 'is-loading': isLoading.tagsPage }">管理标签</button>
          </router-link>
          <router-link to="/admin/bookmarks">
            <button class="button is-ghost"
                    :class="{ 'is-loading': isLoading.bookmarksPage }">管理书签</button>
          </router-link>
        </template>
        <button v-else
                class="button is-ghost"
                :class="{ 'is-loading': isLoading.adminPage }"
                @click="goAdminPage($route)">操作</button>
      </div>
    </div>
  </nav>

  <div class="container-wrapper">
    <main class="container">
      <router-view />
    </main>
  </div>

  <footer>
    <span>🎏 BMM · 书签管理</span>
  </footer>
</template>

<script setup>
import { login } from '@/libs/api';
import { computed, onUpdated, reactive, ref, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = reactive({
  adminPage: false,
  bookmarksPage: false,
  tagsPage: false,
});

function goAdminPage() {
  const key = localStorage.getItem('Authorization');

  if (key) {
    isLoading.adminPage = true;
    login()
      .then(() => {
        router.push('/admin/bookmarks');
      })
      .catch((error) => {
        console.log(error);
        // 身份校验失败
        const input = prompt('身份校验失败，请重新输入密钥');

        if (!input) return;
        localStorage.setItem('Authorization', input);
        goAdminPage();
      })
      .finally(() => {
        isLoading.adminPage = false;
      });
  } else {
    const input = prompt('请输入密钥');

    if (!input) return;
    localStorage.setItem('Authorization', input);
    goAdminPage();
  }
}

const isAdminPage = ref(false);

watch(
  () => router.currentRoute.value,
  () => {
    isAdminPage.value = router.currentRoute.value.path?.includes('/admin/');
  },
  { deep: true, immediate: true }
);
</script>

<style lang="scss" scoped>
nav {
  position: fixed;
  top: 0;
  z-index: 1;
  padding: 0.5rem 0;
  width: 100%;
  height: 4rem;
  background: rgba($color: #fff, $alpha: 0.5);
  box-shadow: 0 0, 0 0, 0 3px 8px rgba($color: #000, $alpha: 0.05);

  backdrop-filter: blur(5px);

  div.level {
    height: 3rem;
  }

  .site-name {
    font-size: 1.7rem;
    line-height: 3rem;
    cursor: pointer;
  }
}

div.container-wrapper {
  overflow-x: auto;
  // 无论内容是否溢出，y轴的滚动条一直显示
  overflow-y: scroll;
  box-sizing: border-box;
  padding: 5rem 0 38px;
  height: 100vh;
}

footer {
  position: fixed;
  bottom: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 38px;
  background-color: rgba(255, 255, 255, 0.287);
  box-shadow: 0 -3px 5px rgba($color: #000, $alpha: 0.05);
  color: #363636;
  font-weight: 100;
  font-size: 14px;

  backdrop-filter: blur(10px);
}
</style>
