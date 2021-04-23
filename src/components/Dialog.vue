<template>
  <transition name="fade">
    <div class="modal is-active"
         v-show="visible">
      <div class="modal-background"
           @click="close"></div>
      <transition name="scale">
        <div class="modal-content"
             v-show="visible">
          <slot></slot>
        </div>
      </transition>
      <button class="modal-close is-large"
              aria-label="close"
              @click="close"></button>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {};
  },

  methods: {
    close() {
      this.$emit('update:visible', false);
    },
  },
};
</script>

<style lang="scss">
.fade-enter-active {
  transition: opacity 100ms ease-out;
}

.fade-leave-active {
  transition: opacity 100ms ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active {
  transition: transform 100ms ease-out;
}

.scale-leave-active {
  transition: transform 100ms ease-in;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.8);
}
</style>