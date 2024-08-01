import { Store, createStore }  from 'vuex';
import createPersistedState from 'vuex-persistedstate';

interface State {
  user: User | null;
  token: string | null;
}

interface User {
  sub: string;
  name: string;
  given_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

const state: State = {
  user: null,
  token: null,
}

const mutations = {
  setUser(state: State, user: User) {
    state.user = user;
  },
  setToken(state: State, token: string) {
    state.token = token;
  },
  clearAuth(state: State) {
    state.user = null;
    state.token = null;
  },
}

const actions = {
  login({ commit }: { commit: Store<State>['commit'] }, { user, token }: { user: User; token: string }) {
    commit('setUser', user);
    commit('setToken', token);
  },
  logout({ commit }: { commit: Store<State>['commit'] }) {
    commit('clearAuth');
  },
}

const getters = {
  isAuthenticated: (state: State) => !!state.token,
  getUser: (state: State) => state.user,
  getToken: (state: State) => state.token,
}

const storeOptions = {
  state,
  mutations,
  actions,
  getters,
	plugins: [createPersistedState()],
}

interface ComponentCustomProperties {
	$store: Store<State>
}

export default createStore(storeOptions);

