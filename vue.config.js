module.exports = {
  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @import "/node_modules/normalize.css/normalize.css";
          @import "@/assets/scss/_variables.scss";
        `
      }
    }
  }
};
