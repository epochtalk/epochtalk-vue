export default {
  state: {
    token: ''
  },
  getters: {
    authToken: state => state.token
  },
  // bind state changes to anything using getters
  mutations: {
    setAuthToken(state, token) {
      state.token = token;
    }
  },
  // asynchronously commit mutations
  actions: {
    // log user in and set auth token in store
    login ({ commit }, { username, password, rememberMe }) {
      // get auth token from api
      const res = await fetch(`http://localhost:8080/auth/`);
      // mutate token
      commit('setAuthToken', await res.text());
    }
  }
}
