const render = require('react-dom').render
const h = require('react-hyperscript')
const Root = require('./app/pages')
const actions = require('./app/store/actions')
const configureStore = require('./app/store/store')
const txHelper = require('./lib/tx-helper')
const { fetchLocale } = require('./app/helpers/utils/i18n-helper')
import switchDirection from './app/helpers/utils/switch-direction'
const log = require('loglevel')

module.exports = launchITrustUi

log.setLevel(global.ITRUST_DEBUG ? 'debug' : 'warn')

function launchITrustUi (opts, cb) {
  var {backgroundConnection} = opts
  actions._setBackgroundConnection(backgroundConnection)
  // check if we are unlocked first
  backgroundConnection.getState(function (err, iTrustState) {
    if (err) return cb(err)
    startApp(iTrustState, backgroundConnection, opts)
      .then((store) => {
        cb(null, store)
      })
  })
}

async function startApp (iTrustState, backgroundConnection, opts) {
  // parse opts
  if (!iTrustState.featureFlags) iTrustState.featureFlags = {}

  const currentLocaleMessages = iTrustState.currentLocale
    ? await fetchLocale(iTrustState.currentLocale)
    : {}
  const enLocaleMessages = await fetchLocale('en')

  if (iTrustState.textDirection === 'rtl') {
    await switchDirection('rtl')
  }

  const store = configureStore({
    activeTab: opts.activeTab,

    // iTrustState represents the cross-tab state
    iTrust: iTrustState,

    // appState represents the current tab's popup state
    appState: {},

    localeMessages: {
      current: currentLocaleMessages,
      en: enLocaleMessages,
    },

    // Which blockchain we are using:
    networkVersion: opts.networkVersion,
  })

  // if unconfirmed txs, start on txConf page
  const unapprovedTxsAll = txHelper(iTrustState.unapprovedTxs, iTrustState.unapprovedMsgs, iTrustState.unapprovedPersonalMsgs, iTrustState.unapprovedTypedMessages, iTrustState.network)
  const numberOfUnapprivedTx = unapprovedTxsAll.length
  if (numberOfUnapprivedTx > 0) {
    store.dispatch(actions.showConfTxPage({
      id: unapprovedTxsAll[numberOfUnapprivedTx - 1].id,
    }))
  }

  backgroundConnection.on('update', function (iTrustState) {
    const currentState = store.getState()
    const { currentLocale } = currentState.iTrust
    const { currentLocale: newLocale } = iTrustState

    if (currentLocale && newLocale && currentLocale !== newLocale) {
      store.dispatch(actions.updateCurrentLocale(newLocale))
    }

    store.dispatch(actions.updateITrustState(iTrustState))
  })

  // global iTrust api - used by tooling
  global.iTrust = {
    updateCurrentLocale: (code) => {
      store.dispatch(actions.updateCurrentLocale(code))
    },
    setProviderType: (type) => {
      store.dispatch(actions.setProviderType(type))
    },
    setFeatureFlag: (key, value) => {
      store.dispatch(actions.setFeatureFlag(key, value))
    },
  }

  // start app
  render(
    h(Root, {
      // inject initial state
      store: store,
    }
    ), opts.container)

  return store
}
