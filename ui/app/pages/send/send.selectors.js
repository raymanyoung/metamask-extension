const { valuesFor } = require('../../helpers/utils/util')
const abi = require('human-standard-token-abi')
const {
  multiplyCurrencies,
} = require('../../helpers/utils/conversion-util')
const {
  getMetaMaskAccounts,
  getSelectedAddress,
  getAddressBook,
} = require('../../selectors/selectors')
const {
  estimateGasPriceFromRecentBlocks,
  calcGasTotal,
} = require('./send.utils')
import {
  getAveragePriceEstimateInHexWEI,
} from '../../selectors/custom-gas'

const selectors = {
  accountsWithSendEtherInfoSelector,
  getAmountConversionRate,
  getBlockGasLimit,
  getConversionRate,
  getCurrentAccountWithSendEtherInfo,
  getCurrentCurrency,
  getCurrentNetwork,
  getCurrentViewContext,
  getForceGasMin,
  getNativeCurrency,
  getGasLimit,
  getGasPrice,
  getGasPriceFromRecentBlocks,
  getGasTotal,
  getPrimaryCurrency,
  getRecentBlocks,
  getSelectedAccount,
  getSelectedIdentity,
  getSelectedToken,
  getSelectedTokenContract,
  getSelectedTokenExchangeRate,
  getSelectedTokenToFiatRate,
  getSendAmount,
  getSendHexData,
  getSendHexDataFeatureFlagState,
  getSendEditingTransactionId,
  getSendEnsResolution,
  getSendEnsResolutionError,
  getSendErrors,
  getSendFrom,
  getSendFromBalance,
  getSendFromObject,
  getSendMaxModeState,
  getSendTo,
  getSendToAccounts,
  getSendToNickname,
  getTokenBalance,
  getTokenExchangeRate,
  getUnapprovedTxs,
  transactionsSelector,
  getQrCodeData,
}

module.exports = selectors

function accountsWithSendEtherInfoSelector (state) {
  const accounts = getMetaMaskAccounts(state)
  const { identities } = state.iTrust
  const accountsWithSendEtherInfo = Object.entries(accounts).map(([key, account]) => {
    return Object.assign({}, account, identities[key])
  })

  return accountsWithSendEtherInfo
}

function getAmountConversionRate (state) {
  return getSelectedToken(state)
    ? getSelectedTokenToFiatRate(state)
    : getConversionRate(state)
}

function getBlockGasLimit (state) {
  return state.iTrust.currentBlockGasLimit
}

function getConversionRate (state) {
  return state.iTrust.conversionRate
}

function getCurrentAccountWithSendEtherInfo (state) {
  const currentAddress = getSelectedAddress(state)
  const accounts = accountsWithSendEtherInfoSelector(state)

  return accounts.find(({ address }) => address === currentAddress)
}

function getCurrentCurrency (state) {
  return state.iTrust.currentCurrency
}

function getNativeCurrency (state) {
  return state.iTrust.nativeCurrency
}

function getCurrentNetwork (state) {
  return state.iTrust.network
}

function getCurrentViewContext (state) {
  const { currentView = {} } = state.appState
  return currentView.context
}

function getForceGasMin (state) {
  return state.iTrust.send.forceGasMin
}

function getGasLimit (state) {
  return state.iTrust.send.gasLimit || '0'
}

function getGasPrice (state) {
  return state.iTrust.send.gasPrice || getAveragePriceEstimateInHexWEI(state)
}

function getGasPriceFromRecentBlocks (state) {
  return estimateGasPriceFromRecentBlocks(state.iTrust.recentBlocks)
}

function getGasTotal (state) {
  return calcGasTotal(getGasLimit(state), getGasPrice(state))
}

function getPrimaryCurrency (state) {
  const selectedToken = getSelectedToken(state)
  return selectedToken && selectedToken.symbol
}

function getRecentBlocks (state) {
  return state.iTrust.recentBlocks
}

function getSelectedAccount (state) {
  const accounts = getMetaMaskAccounts(state)
  const selectedAddress = getSelectedAddress(state)

  return accounts[selectedAddress]
}

function getSelectedIdentity (state) {
  const selectedAddress = getSelectedAddress(state)
  const identities = state.iTrust.identities

  return identities[selectedAddress]
}

function getSelectedToken (state) {
  const tokens = state.iTrust.tokens || []
  const selectedTokenAddress = state.iTrust.selectedTokenAddress
  const selectedToken = tokens.filter(({ address }) => address === selectedTokenAddress)[0]
  const sendToken = state.iTrust.send.token

  return selectedToken || sendToken || null
}

function getSelectedTokenContract (state) {
  const selectedToken = getSelectedToken(state)

  return selectedToken
    ? global.eth.contract(abi).at(selectedToken.address)
    : null
}

function getSelectedTokenExchangeRate (state) {
  const tokenExchangeRates = state.iTrust.tokenExchangeRates
  const selectedToken = getSelectedToken(state) || {}
  const { symbol = '' } = selectedToken
  const pair = `${symbol.toLowerCase()}_eth`
  const { rate: tokenExchangeRate = 0 } = tokenExchangeRates && tokenExchangeRates[pair] || {}

  return tokenExchangeRate
}

function getSelectedTokenToFiatRate (state) {
  const selectedTokenExchangeRate = getSelectedTokenExchangeRate(state)
  const conversionRate = getConversionRate(state)

  const tokenToFiatRate = multiplyCurrencies(
    conversionRate,
    selectedTokenExchangeRate,
    { toNumericBase: 'dec' }
  )

  return tokenToFiatRate
}

function getSendAmount (state) {
  return state.iTrust.send.amount
}

function getSendHexData (state) {
  return state.iTrust.send.data
}

function getSendHexDataFeatureFlagState (state) {
  return state.iTrust.featureFlags.sendHexData
}

function getSendEditingTransactionId (state) {
  return state.iTrust.send.editingTransactionId
}

function getSendErrors (state) {
  return state.send.errors
}

function getSendFrom (state) {
  return state.iTrust.send.from
}

function getSendFromBalance (state) {
  const from = getSendFrom(state) || getSelectedAccount(state)
  return from.balance
}

function getSendFromObject (state) {
  return getSendFrom(state) || getCurrentAccountWithSendEtherInfo(state)
}

function getSendMaxModeState (state) {
  return state.iTrust.send.maxModeOn
}

function getSendTo (state) {
  return state.iTrust.send.to
}

function getSendToNickname (state) {
  return state.iTrust.send.toNickname
}

function getSendToAccounts (state) {
  const fromAccounts = accountsWithSendEtherInfoSelector(state)
  const addressBookAccounts = getAddressBook(state)
  return [...fromAccounts, ...addressBookAccounts]
}
function getTokenBalance (state) {
  return state.iTrust.send.tokenBalance
}

function getSendEnsResolution (state) {
  return state.iTrust.send.ensResolution
}

function getSendEnsResolutionError (state) {
  return state.iTrust.send.ensResolutionError
}

function getTokenExchangeRate (state, tokenSymbol) {
  const pair = `${tokenSymbol.toLowerCase()}_eth`
  const tokenExchangeRates = state.iTrust.tokenExchangeRates
  const { rate: tokenExchangeRate = 0 } = tokenExchangeRates[pair] || {}

  return tokenExchangeRate
}

function getUnapprovedTxs (state) {
  return state.iTrust.unapprovedTxs
}

function transactionsSelector (state) {
  const { network, selectedTokenAddress } = state.iTrust
  const unapprovedMsgs = valuesFor(state.iTrust.unapprovedMsgs)
  const shapeShiftTxList = (network === '1') ? state.iTrust.shapeShiftTxList : undefined
  const transactions = state.iTrust.selectedAddressTxList || []
  const txsToRender = !shapeShiftTxList ? transactions.concat(unapprovedMsgs) : transactions.concat(unapprovedMsgs, shapeShiftTxList)

  return selectedTokenAddress
    ? txsToRender
      .filter(({ txParams }) => txParams && txParams.to === selectedTokenAddress)
      .sort((a, b) => b.time - a.time)
    : txsToRender
      .sort((a, b) => b.time - a.time)
}

function getQrCodeData (state) {
  return state.appState.qrCodeData
}
