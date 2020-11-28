export default {
  state: {
    user: {}
  },
  getters: {
    user: state => state.user,
    authToken: (state, getters) => getters.user ? getters.user.token : null,
    loggedIn: (state, getters) => getters.authToken ? true : false
  },
  // bind state changes to anything using getters
  mutations: {
    setUser(state, user) {
      state.user = user;
    }
  },
  // asynchronously commit mutations
  actions: {
    // log user in and set auth token in store
    login ({ commit }, { username, password, rememberMe }) {
      // attempt login
      return fetch(`http://localhost:8080/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password,
          rememberMe: rememberMe
        })
      })
      .then(result => result.json())
      .then(function(user) {
        // login successful
        if (user) {
          // mutate token
          commit('setUser', user);
        }
        // handle bad login
        else {
          console.log('login failed, bad credentials');
        }
      })
      .catch(function(error) {
        // something bad happened
        console.log('omg an error loggin in', error);
      });
    }
  }
}
