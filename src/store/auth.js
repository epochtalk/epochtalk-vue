export const AuthModule = {
  state: {
    token: ''
  },
  getters: {
    token: state => state.token
  },
  // bind state changes to anything using getters
  mutations: {
    setToken(state, token) {
      state.token = token;
    }
  }
  // asynchronously commit mutations
  actions: {
    async fetchToken ({ commit }, { username, password }) {
      // get auth token from api
      const res = await fetch(`http://localhost:8080/auth/`);
      // mutate token
      commit('setToken', await res.text());
    },
  }
}
