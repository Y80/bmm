<template>
  <nav>
    <div class="container level">
      <router-link to="/index">
        <div class="level-left">
          <span class="site-name">🎏 BMM</span>
        </div>
      </router-link>
      <div class="level-right">
        <button class="button is-primary is-inverted"
                @click="goAdminPage">管理书签</button>
        <template v-if="$route.path.includes('/admin/')">
          <router-link to="/admin/tags">
            <button class="button mr-5">管理标签</button>
          </router-link>
          <router-link to="/admin/bookmarks">
            <button class="button">管理书签</button>
          </router-link>
        </template>
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
import router from './libs/router';

function goAdminPage() {
  router.push('/bookmarks');
  // TODO 校验密钥是否有效
}
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
  overflow: auto;
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
