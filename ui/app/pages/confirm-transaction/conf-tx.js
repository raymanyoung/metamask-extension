const inherits = require('util').inherits
const Component = require('react').Component
const h = require('react-hyperscript')
const connect = require('react-redux').connect
const { withRouter } = require('react-router-dom')
const { compose } = require('recompose')
const actions = require('../../store/actions')
const txHelper = require('../../../lib/tx-helper')
const log = require('loglevel')
const R = require('ramda')

const SignatureRequest = require('../../components/app/signature-request').default
const SignatureRequestOriginal = require('../../components/app/signature-request-original')
const Loading = require('../../components/ui/loading-screen')
const { DEFAULT_ROUTE } = require('../../helpers/constants/routes')

module.exports = compose(
  withRouter,
  connect(mapStateToProps)
)(ConfirmTxScreen)

function mapStateToProps (state) {
  const { iTrust } = state
  const {
    unapprovedMsgCount,
    unapprovedPersonalMsgCount,
    unapprovedTypedMessagesCount,
  } = iTrust

  return {
    identities: state.iTrust.identities,
    unapprovedTxs: state.iTrust.unapprovedTxs,
    unapprovedMsgs: state.iTrust.unapprovedMsgs,
    unapprovedPersonalMsgs: state.iTrust.unapprovedPersonalMsgs,
    unapprovedTypedMessages: state.iTrust.unapprovedTypedMessages,
    index: state.appState.currentView.context,
    warning: state.appState.warning,
    network: state.iTrust.network,
    provider: state.iTrust.provider,
    currentCurrency: state.iTrust.currentCurrency,
    blockGasLimit: state.iTrust.currentBlockGasLimit,
    unapprovedMsgCount,
    unapprovedPersonalMsgCount,
    unapprovedTypedMessagesCount,
    send: state.iTrust.send,
    selectedAddressTxList: state.iTrust.selectedAddressTxList,
  }
}

inherits(ConfirmTxScreen, Component)
function ConfirmTxScreen () {
  Component.call(this)
}

ConfirmTxScreen.prototype.getUnapprovedMessagesTotal = function () {
  const {
    unapprovedMsgCount = 0,
    unapprovedPersonalMsgCount = 0,
    unapprovedTypedMessagesCount = 0,
  } = this.props

  return unapprovedTypedMessagesCount + unapprovedMsgCount + unapprovedPersonalMsgCount
}

ConfirmTxScreen.prototype.componentDidMount = function () {
  const {
    unapprovedTxs = {},
    network,
    send,
  } = this.props
  const unconfTxList = txHelper(unapprovedTxs, {}, {}, {}, network)

  if (unconfTxList.length === 0 && !send.to && this.getUnapprovedMessagesTotal() === 0) {
    this.props.history.push(DEFAULT_ROUTE)
  }
}

ConfirmTxScreen.prototype.componentDidUpdate = function (prevProps) {
  const {
    unapprovedTxs = {},
    network,
    selectedAddressTxList,
    send,
    history,
    match: { params: { id: transactionId } = {} },
  } = this.props

  let prevTx

  if (transactionId) {
    prevTx = R.find(({ id }) => id + '' === transactionId)(selectedAddressTxList)
  } else {
    const { index: prevIndex, unapprovedTxs: prevUnapprovedTxs } = prevProps
    const prevUnconfTxList = txHelper(prevUnapprovedTxs, {}, {}, {}, network)
    const prevTxData = prevUnconfTxList[prevIndex] || {}
    prevTx = selectedAddressTxList.find(({ id }) => id === prevTxData.id) || {}
  }

  const unconfTxList = txHelper(unapprovedTxs, {}, {}, {}, network)

  if (prevTx && prevTx.status === 'dropped') {
    this.props.dispatch(actions.showModal({
      name: 'TRANSACTION_CONFIRMED',
      onSubmit: () => history.push(DEFAULT_ROUTE),
    }))

    return
  }

  if (unconfTxList.length === 0 && !send.to && this.getUnapprovedMessagesTotal() === 0) {
    this.props.history.push(DEFAULT_ROUTE)
  }
}

ConfirmTxScreen.prototype.getTxData = function () {
  const {
    network,
    index,
    unapprovedTxs,
    unapprovedMsgs,
    unapprovedPersonalMsgs,
    unapprovedTypedMessages,
    match: { params: { id: transactionId } = {} },
  } = this.props

  const unconfTxList = txHelper(
    unapprovedTxs,
    unapprovedMsgs,
    unapprovedPersonalMsgs,
    unapprovedTypedMessages,
    network
  )

  log.info(`rendering a combined ${unconfTxList.length} unconf msgs & txs`)

  return transactionId
    ? R.find(({ id }) => id + '' === transactionId)(unconfTxList)
    : unconfTxList[index]
}

ConfirmTxScreen.prototype.signatureSelect = function (type, version) {
  // Temporarily direct only v3 and v4 requests to new code.
  if (type === 'eth_signTypedData' && (version === 'V3' || version === 'V4')) {
    return SignatureRequest
  }

  return SignatureRequestOriginal
}

ConfirmTxScreen.prototype.render = function () {
  const props = this.props
  const {
    currentCurrency,
    blockGasLimit,
    conversionRate,
  } = props

  var txData = this.getTxData() || {}
  const { msgParams, type, msgParams: { version } } = txData
  log.debug('msgParams detected, rendering pending msg')

  return msgParams ? h(this.signatureSelect(type, version), {
    // Properties
    txData: txData,
    key: txData.id,
    selectedAddress: props.selectedAddress,
    accounts: props.accounts,
    identities: props.identities,
    conversionRate,
    currentCurrency,
    blockGasLimit,
    // Actions
    signMessage: this.signMessage.bind(this, txData),
    signPersonalMessage: this.signPersonalMessage.bind(this, txData),
    signTypedMessage: this.signTypedMessage.bind(this, txData),
    cancelMessage: this.cancelMessage.bind(this, txData),
    cancelPersonalMessage: this.cancelPersonalMessage.bind(this, txData),
    cancelTypedMessage: this.cancelTypedMessage.bind(this, txData),
  }) : h(Loading)
}

ConfirmTxScreen.prototype.signMessage = function (msgData, event) {
  log.info('conf-tx.js: signing message')
  var params = msgData.msgParams
  params.iTrustId = msgData.id
  this.stopPropagation(event)
  return this.props.dispatch(actions.signMsg(params))
}

ConfirmTxScreen.prototype.stopPropagation = function (event) {
  if (event.stopPropagation) {
    event.stopPropagation()
  }
}

ConfirmTxScreen.prototype.signPersonalMessage = function (msgData, event) {
  log.info('conf-tx.js: signing personal message')
  var params = msgData.msgParams
  params.iTrustId = msgData.id
  this.stopPropagation(event)
  return this.props.dispatch(actions.signPersonalMsg(params))
}

ConfirmTxScreen.prototype.signTypedMessage = function (msgData, event) {
  log.info('conf-tx.js: signing typed message')
  var params = msgData.msgParams
  params.iTrustId = msgData.id
  this.stopPropagation(event)
  return this.props.dispatch(actions.signTypedMsg(params))
}

ConfirmTxScreen.prototype.cancelMessage = function (msgData, event) {
  log.info('canceling message')
  this.stopPropagation(event)
  return this.props.dispatch(actions.cancelMsg(msgData))
}

ConfirmTxScreen.prototype.cancelPersonalMessage = function (msgData, event) {
  log.info('canceling personal message')
  this.stopPropagation(event)
  return this.props.dispatch(actions.cancelPersonalMsg(msgData))
}

ConfirmTxScreen.prototype.cancelTypedMessage = function (msgData, event) {
  log.info('canceling typed message')
  this.stopPropagation(event)
  return this.props.dispatch(actions.cancelTypedMsg(msgData))
}
