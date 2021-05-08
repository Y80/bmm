<template>
  <nav>
    <div class="container level">
      <router-link to="/index">
        <div class="level-left">
          <span class="site-name">🎏 BMM</span>
        </div>
      </router-link>
      <div class="level-right">
        <template v-if="isAdminPage">
          <router-link to="/admin/tags">
            <button class="button mr-5  is-primary is-inverted">管理标签</button>
          </router-link>
          <router-link to="/admin/bookmarks">
            <button class="button is-primary is-inverted">管理书签</button>
          </router-link>
        </template>
        <button v-else
                class="button is-primary is-inverted"
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
import { computed, onUpdated, ref, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

function goAdminPage() {
  const key = localStorage.getItem('Authorization');

  if (key) {
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

router;
</script>

<style lang="scss" scoped>
nav {
  box-sizing: border-box;
  padding: 0.5rem 0;
  height: 4rem;
  box-shadow: 0 0, 0 0, 0 3px 8px rgba($color: #000, $alpha: 0.05);

  // backdrop-filter: blur(5px);

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
  padding: 1rem 0;
  height: calc(100vh - 4rem - 3rem);
}

footer {
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3rem;
  background-color: white;
  box-shadow: 0 -3px 5px rgba($color: #000, $alpha: 0.05);
  color: #363636;
  font-weight: 100;
  font-size: 14px;
}

</style>
