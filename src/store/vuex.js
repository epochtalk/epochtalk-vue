import Vuex from 'vuex'

import AuthModule from 'auth'

export const store = new Vuex.Store({
  modules: {
    AuthModule
  }
});
