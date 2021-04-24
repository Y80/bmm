<template>
  <nav>
    <div class="container level">
      <router-link to="/index">
        <div class="level-left">
          <span class="site-name">🎏 BMM</span>
        </div>
      </router-link>
      <div class="level-right">
        <router-link to="/admin/tags">
          <button class="button mr-5">管理标签</button>
        </router-link>
        <router-link to="/admin/bookmarks">
          <button class="button">管理书签</button>
        </router-link>
      </div>
    </div>
  </nav>

  <main class="container">
    <router-view />
  </main>

  <!-- <footer>
    <p>bm-manager · 2020</p>
    <p>你的专属书签管理专家</p>
  </footer> -->
</template>

<script>
export default {
  name: 'App',
};
</script>

<style lang="scss">
nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1;
  padding: 0.5rem 0;
  height: 4rem;
  box-shadow: 0 0, 0 0, 0 3px 8px rgba($color: #000, $alpha: 0.05);

  backdrop-filter: blur(5px);

  div.level {
    height: 3rem;
  }

  .site-name {
    font-size: 2.5rem;
    line-height: 3rem;
    cursor: pointer;
  }
}

footer {
  margin: 1rem 0;
  text-align: center;
}

</style>
