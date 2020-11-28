export default {
  state: {
    user: {}
  },
  getters: {
    authToken: state => state.token
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
      .then(function(result) {
        console.log(result);
        // login successful
        if (result.good) {
          // mutate token
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
