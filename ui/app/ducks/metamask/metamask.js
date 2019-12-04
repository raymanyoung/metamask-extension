const extend = require('xtend')
const actions = require('../../store/actions')
const { getEnvironmentType } = require('../../../../app/scripts/lib/util')
const { ENVIRONMENT_TYPE_POPUP } = require('../../../../app/scripts/lib/enums')
const { OLD_UI_NETWORK_TYPE } = require('../../../../app/scripts/controllers/network/enums')

module.exports = reduceMetamask

function reduceMetamask (state, action) {
  let newState

  // clone + defaults
  var iTrustState = extend({
    isInitialized: false,
    isUnlocked: false,
    isAccountMenuOpen: false,
    isPopup: getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_POPUP,
    rpcTarget: 'https://rawtestrpc.iTrust.io/',
    identities: {},
    unapprovedTxs: {},
    frequentRpcList: [],
    addressBook: [],
    selectedTokenAddress: null,
    contractExchangeRates: {},
    tokenExchangeRates: {},
    tokens: [],
    pendingTokens: {},
    customNonceValue: '',
    send: {
      gasLimit: null,
      gasPrice: null,
      gasTotal: null,
      tokenBalance: '0x0',
      from: '',
      to: '',
      amount: '0',
      memo: '',
      errors: {},
      maxModeOn: false,
      editingTransactionId: null,
      forceGasMin: null,
      toNickname: '',
      ensResolution: null,
      ensResolutionError: '',
    },
    coinOptions: {},
    useBlockie: false,
    featureFlags: {},
    networkEndpointType: OLD_UI_NETWORK_TYPE,
    welcomeScreenSeen: false,
    currentLocale: '',
    preferences: {
      useNativeCurrencyAsPrimaryCurrency: true,
      showFiatInTestnets: false,
    },
    firstTimeFlowType: null,
    completedOnboarding: false,
    knownMethodData: {},
    participateInMetaMetrics: null,
    metaMetricsSendCount: 0,
    nextNonce: null,
  }, state.iTrust)

  switch (action.type) {

    case actions.UPDATE_METAMASK_STATE:
      return extend(iTrustState, action.value)

    case actions.UNLOCK_METAMASK:
      return extend(iTrustState, {
        isUnlocked: true,
        isInitialized: true,
        selectedAddress: action.value,
      })

    case actions.LOCK_METAMASK:
      return extend(iTrustState, {
        isUnlocked: false,
      })

    case actions.SET_RPC_LIST:
      return extend(iTrustState, {
        frequentRpcList: action.value,
      })

    case actions.SET_RPC_TARGET:
      return extend(iTrustState, {
        provider: {
          type: 'rpc',
          rpcTarget: action.value,
        },
      })

    case actions.SET_PROVIDER_TYPE:
      return extend(iTrustState, {
        provider: {
          type: action.value,
        },
      })

    case actions.COMPLETED_TX:
      var stringId = String(action.id)
      newState = extend(iTrustState, {
        unapprovedTxs: {},
        unapprovedMsgs: {},
      })
      for (const id in iTrustState.unapprovedTxs) {
        if (id !== stringId) {
          newState.unapprovedTxs[id] = iTrustState.unapprovedTxs[id]
        }
      }
      for (const id in iTrustState.unapprovedMsgs) {
        if (id !== stringId) {
          newState.unapprovedMsgs[id] = iTrustState.unapprovedMsgs[id]
        }
      }
      return newState

    case actions.EDIT_TX:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          editingTransactionId: action.value,
        },
      })

    case actions.CLEAR_SEED_WORD_CACHE:
      newState = extend(iTrustState, {
        isUnlocked: true,
        isInitialized: true,
        selectedAddress: action.value,
      })
      return newState

    case actions.SHOW_ACCOUNT_DETAIL:
      newState = extend(iTrustState, {
        isUnlocked: true,
        isInitialized: true,
        selectedAddress: action.value,
      })
      return newState

    case actions.SET_SELECTED_TOKEN:
      newState = extend(iTrustState, {
        selectedTokenAddress: action.value,
      })
      const newSend = extend(iTrustState.send)

      if (iTrustState.send.editingTransactionId && !action.value) {
        delete newSend.token
        const unapprovedTx = newState.unapprovedTxs[newSend.editingTransactionId] || {}
        const txParams = unapprovedTx.txParams || {}
        newState.unapprovedTxs = extend(newState.unapprovedTxs, {
          [newSend.editingTransactionId]: extend(unapprovedTx, {
            txParams: extend(txParams, { data: '' }),
          }),
        })
        newSend.tokenBalance = null
        newSend.balance = '0'
      }

      newState.send = newSend
      return newState

    case actions.SET_ACCOUNT_LABEL:
      const account = action.value.account
      const name = action.value.label
      const id = {}
      id[account] = extend(iTrustState.identities[account], { name })
      const identities = extend(iTrustState.identities, id)
      return extend(iTrustState, { identities })

    case actions.SET_CURRENT_FIAT:
      return extend(iTrustState, {
        currentCurrency: action.value.currentCurrency,
        conversionRate: action.value.conversionRate,
        conversionDate: action.value.conversionDate,
      })

    case actions.UPDATE_TOKENS:
      return extend(iTrustState, {
        tokens: action.newTokens,
      })

    // metamask.send
    case actions.UPDATE_GAS_LIMIT:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          gasLimit: action.value,
        },
      })
    case actions.UPDATE_CUSTOM_NONCE:
      return extend(iTrustState, {
        customNonceValue: action.value,
      })
    case actions.UPDATE_GAS_PRICE:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          gasPrice: action.value,
        },
      })

    case actions.TOGGLE_ACCOUNT_MENU:
      return extend(iTrustState, {
        isAccountMenuOpen: !iTrustState.isAccountMenuOpen,
      })

    case actions.UPDATE_GAS_TOTAL:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          gasTotal: action.value,
        },
      })

    case actions.UPDATE_SEND_TOKEN_BALANCE:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          tokenBalance: action.value,
        },
      })

    case actions.UPDATE_SEND_HEX_DATA:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          data: action.value,
        },
      })

    case actions.UPDATE_SEND_FROM:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          from: action.value,
        },
      })

    case actions.UPDATE_SEND_TO:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          to: action.value.to,
          toNickname: action.value.nickname,
        },
      })

    case actions.UPDATE_SEND_AMOUNT:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          amount: action.value,
        },
      })

    case actions.UPDATE_SEND_MEMO:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          memo: action.value,
        },
      })

    case actions.UPDATE_MAX_MODE:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          maxModeOn: action.value,
        },
      })

    case actions.UPDATE_SEND:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          ...action.value,
        },
      })

    case actions.UPDATE_SEND_ENS_RESOLUTION:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          ensResolution: action.payload,
          ensResolutionError: '',
        },
      })

    case actions.UPDATE_SEND_ENS_RESOLUTION_ERROR:
      return extend(iTrustState, {
        send: {
          ...iTrustState.send,
          ensResolution: null,
          ensResolutionError: action.payload,
        },
      })

    case actions.CLEAR_SEND:
      return extend(iTrustState, {
        send: {
          gasLimit: null,
          gasPrice: null,
          gasTotal: null,
          tokenBalance: null,
          from: '',
          to: '',
          amount: '0x0',
          memo: '',
          errors: {},
          maxModeOn: false,
          editingTransactionId: null,
          forceGasMin: null,
          toNickname: '',
        },
      })

    case actions.UPDATE_TRANSACTION_PARAMS:
      const { id: txId, value } = action
      let { selectedAddressTxList } = iTrustState
      selectedAddressTxList = selectedAddressTxList.map(tx => {
        if (tx.id === txId) {
          tx.txParams = value
        }
        return tx
      })

      return extend(iTrustState, {
        selectedAddressTxList,
      })

    case actions.PAIR_UPDATE:
      const { value: { marketinfo: pairMarketInfo } } = action
      return extend(iTrustState, {
        tokenExchangeRates: {
          ...iTrustState.tokenExchangeRates,
          [pairMarketInfo.pair]: pairMarketInfo,
        },
      })

    case actions.SHAPESHIFT_SUBVIEW:
      const { value: { marketinfo: ssMarketInfo, coinOptions } } = action
      return extend(iTrustState, {
        tokenExchangeRates: {
          ...iTrustState.tokenExchangeRates,
          [ssMarketInfo.pair]: ssMarketInfo,
        },
        coinOptions,
      })

    case actions.SET_PARTICIPATE_IN_METAMETRICS:
      return extend(iTrustState, {
        participateInMetaMetrics: action.value,
      })

    case actions.SET_METAMETRICS_SEND_COUNT:
      return extend(iTrustState, {
        metaMetricsSendCount: action.value,
      })

    case actions.SET_USE_BLOCKIE:
      return extend(iTrustState, {
        useBlockie: action.value,
      })

    case actions.UPDATE_FEATURE_FLAGS:
      return extend(iTrustState, {
        featureFlags: action.value,
      })

    case actions.UPDATE_NETWORK_ENDPOINT_TYPE:
      return extend(iTrustState, {
        networkEndpointType: action.value,
      })

    case actions.CLOSE_WELCOME_SCREEN:
      return extend(iTrustState, {
        welcomeScreenSeen: true,
      })

    case actions.SET_CURRENT_LOCALE:
      return extend(iTrustState, {
        currentLocale: action.value.locale,
      })

    case actions.SET_PENDING_TOKENS:
      return extend(iTrustState, {
        pendingTokens: { ...action.payload },
      })

    case actions.CLEAR_PENDING_TOKENS: {
      return extend(iTrustState, {
        pendingTokens: {},
      })
    }

    case actions.UPDATE_PREFERENCES: {
      return extend(iTrustState, {
        preferences: {
          ...iTrustState.preferences,
          ...action.payload,
        },
      })
    }

    case actions.COMPLETE_ONBOARDING: {
      return extend(iTrustState, {
        completedOnboarding: true,
      })
    }

    case actions.SET_FIRST_TIME_FLOW_TYPE: {
      return extend(iTrustState, {
        firstTimeFlowType: action.value,
      })
    }

    case actions.SET_NEXT_NONCE: {
      return extend(iTrustState, {
        nextNonce: action.value,
      })
    }

    default:
      return iTrustState

  }
}
