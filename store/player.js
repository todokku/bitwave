// Created by xander on 1/22/2020

const saveToLocalStorage = ( values ) => {
  const existing = JSON.parse( localStorage.getItem( 'player-settings' ) ) || {};
  const data = JSON.stringify( { ...existing, ...values } );
  if ( data ) localStorage.setItem( 'player-settings', data );
};

const $states = {
  // Player properties
  source: 'VIDEO_SRC',

  // Player options
  keepLive: 'KEEP_LIVE',
  disableBumps: 'DISABLE_BUMPS',

  // Player state
  detach: 'DETACH',
};

const $getters = {

};

const $mutations = {
  setSource: 'SET_VIDEO_SRC',

  setKeepLive: 'SET_KEEP_LIVE',
  setDisableBumps: 'SET_DISABLE_BUMPS',

  setDetach: 'SET_DETACH',
};

const $actions = {
  loadSettings: 'LOAD_SETTINGS',
};


// Create Store
export const state = () => ({
  [$states.source]: { url: '', type: '' },

  [$states.keepLive]: false,
  [$states.disableBumps]: false,
  [$states.detach]: false,
});

// Getters
export const getters = {
  /*[$getters.state] ( state ) {
    return [$states.state];
  },*/
};

// Mutations
export const mutations = {
  [$mutations.setSource] ( state, data ) {
    state[$states.source] = data;
  },

  [$mutations.setKeepLive] ( state, data ) {
    state[$states.keepLive] = data;
    saveToLocalStorage( { keepLive: data } );
  },

  [$mutations.setDisableBumps] ( state, data ) {
    state[$states.disableBumps] = data;
    saveToLocalStorage( { disableBumps: data } );
  },

  [$mutations.setDetach] ( state, data ) {
    state[$states.detach] = data;
  },
};

// Actions
export const actions = {
  async [$actions.loadSettings] ({ dispatch, commit }) {
    const keeplive = localStorage.getItem( 'keepLive' );
    if ( keeplive ) {
      commit( $mutations.setKeepLive, JSON.parse(keeplive) );
      localStorage.removeItem( 'keepLive' )
    }

    const playerSettings = JSON.parse( localStorage.getItem( 'player-settings' ) );
    if ( !playerSettings || typeof playerSettings !== 'object') return;
    if ( playerSettings.hasOwnProperty( 'keepLive' ) ) commit( $mutations.setKeepLive, playerSettings.keepLive );
    if ( playerSettings.hasOwnProperty( 'disableBumps' ) ) commit( $mutations.setDisableBumps, playerSettings.disableBumps );
  }
};

// Export Store Structure
export const Player = {
  namespace : 'player',
  $states,
  $getters,
  $mutations,
  $actions,
};
