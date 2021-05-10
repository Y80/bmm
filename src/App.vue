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
                @click="goAdminPage($route)">登录</button>
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

  <transition name="fade">
    <div class="loading"
         v-show="isLoading.fullScreen">
      <div>
        <svg t="1620615950650"
             class="icon"
             viewBox="0 0 1024 1024"
             version="1.1"
             xmlns="http://www.w3.org/2000/svg"
             p-id="11296"
             width="200"
             height="200">
          <path d="M512 1024a512 512 0 0 1-512-512 512 512 0 0 1 512-512 512 512 0 0 1 512 512 512 512 0 0 1-512 512zM512 192c-33.088 0-65.408 8.448-96.96 25.408a9.6 9.6 0 0 0 6.528 17.856c10.048-2.176 20.224-3.2 30.464-3.2 143.552 0 259.968 125.312 259.968 279.936A59.968 59.968 0 1 0 832 512a320 320 0 0 0-320-320z m0 640c22.016 0 43.584-3.776 64.896-11.2a14.848 14.848 0 0 0-4.864-28.8c-143.616 0-260.032-125.376-260.032-280A60.032 60.032 0 0 0 192 512a320 320 0 0 0 320 320z"
                fill="#9ED516"
                p-id="11297"></path>
        </svg>
        <span>加载中</span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { login } from '@/libs/api';
import { computed, onUpdated, reactive, ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getDatabase } from '@/libs/api';

const router = useRouter();
const store = useStore();
const isAdminPage = ref(false);
const isLoading = reactive({
  adminPage: false,
  bookmarksPage: false,
  tagsPage: false,
  fullScreen: false,
});

// if (!store.state.bookmarks) {
//   isLoading.fullScreen = true;
//   getDatabase()
//     .then((database) => {
//       store.commit('setTags', database.tags);
//       store.commit('setBookmarks', database.bookmarks);
//       router.push('/index');
//     })
//     .finally(() => {
//       isLoading.fullScreen = false;
//     });
// }

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

div.loading {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(209, 209, 209, 0.383);

  backdrop-filter: blur(30px);

  div {
    display: flex;
    align-items: center;
    flex-direction: column;
    color: rgb(100, 100, 100);
    letter-spacing: 2px;
    font-weight: 100;
    font-size: 14px;

    gap: 1em;
  }

  svg {
    width: 3rem;
    height: 3rem;
    animation: rotate360 0.5s linear infinite;
  }
}

.fade-leave-active {
  transition: opacity 0.3s ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
