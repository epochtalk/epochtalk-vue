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
    async fetchAuthToken ({ commit }, { username, password }) {
      // get auth token from api
      const res = await fetch(`http://localhost:8080/auth/`);
      // mutate token
      commit('setAuthToken', await res.text());
    }
  }
}
