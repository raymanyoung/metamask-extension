import ethUtil from 'ethereumjs-util'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ENVIRONMENT_TYPE_NOTIFICATION } from '../../../../app/scripts/lib/enums'
import { getEnvironmentType } from '../../../../app/scripts/lib/util'
import ConfirmPageContainer, { ConfirmDetailRow } from '../../components/app/confirm-page-container'
import { isBalanceSufficient } from '../send/send.utils'
import { DEFAULT_ROUTE, CONFIRM_TRANSACTION_ROUTE } from '../../helpers/constants/routes'
import {
  INSUFFICIENT_FUNDS_ERROR_KEY,
  TRANSACTION_ERROR_KEY,
  GAS_LIMIT_TOO_LOW_ERROR_KEY,
} from '../../helpers/constants/error-keys'
import { CONFIRMED_STATUS, DROPPED_STATUS } from '../../helpers/constants/transactions'
import UserPreferencedCurrencyDisplay from '../../components/app/user-preferenced-currency-display'
import { PRIMARY, SECONDARY } from '../../helpers/constants/common'
import { hexToDecimal } from '../../helpers/utils/conversions.util'
import AdvancedGasInputs from '../../components/app/gas-customization/advanced-gas-inputs'
import TextField from '../../components/ui/text-field'

export default class ConfirmTransactionBase extends Component {
  static contextTypes = {
    t: PropTypes.func,
    tOrKey: PropTypes.func.isRequired,
    metricsEvent: PropTypes.func,
  }

  static propTypes = {
    // react-router props
    match: PropTypes.object,
    history: PropTypes.object,
    // Redux props
    balance: PropTypes.string,
    cancelTransaction: PropTypes.func,
    cancelAllTransactions: PropTypes.func,
    clearConfirmTransaction: PropTypes.func,
    clearSend: PropTypes.func,
    conversionRate: PropTypes.number,
    currentCurrency: PropTypes.string,
    editTransaction: PropTypes.func,
    ethTransactionAmount: PropTypes.string,
    ethTransactionFee: PropTypes.string,
    ethTransactionTotal: PropTypes.string,
    fiatTransactionAmount: PropTypes.string,
    fiatTransactionFee: PropTypes.string,
    fiatTransactionTotal: PropTypes.string,
    fromAddress: PropTypes.string,
    fromName: PropTypes.string,
    hexTransactionAmount: PropTypes.string,
    hexTransactionFee: PropTypes.string,
    hexTransactionTotal: PropTypes.string,
    isTxReprice: PropTypes.bool,
    methodData: PropTypes.object,
    nonce: PropTypes.string,
    useNonceField: PropTypes.bool,
    customNonceValue: PropTypes.string,
    updateCustomNonce: PropTypes.func,
    assetImage: PropTypes.string,
    sendTransaction: PropTypes.func,
    showCustomizeGasModal: PropTypes.func,
    showTransactionConfirmedModal: PropTypes.func,
    showRejectTransactionsConfirmationModal: PropTypes.func,
    toAddress: PropTypes.string,
    tokenData: PropTypes.object,
    tokenProps: PropTypes.object,
    toName: PropTypes.string,
    toEns: PropTypes.string,
    toNickname: PropTypes.string,
    transactionStatus: PropTypes.string,
    txData: PropTypes.object,
    unapprovedTxCount: PropTypes.number,
    currentNetworkUnapprovedTxs: PropTypes.object,
    updateGasAndCalculate: PropTypes.func,
    customGas: PropTypes.object,
    // Component props
    actionKey: PropTypes.string,
    contentComponent: PropTypes.node,
    dataComponent: PropTypes.node,
    detailsComponent: PropTypes.node,
    errorKey: PropTypes.string,
    errorMessage: PropTypes.string,
    primaryTotalTextOverride: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    secondaryTotalTextOverride: PropTypes.string,
    hideData: PropTypes.bool,
    hideDetails: PropTypes.bool,
    hideSubtitle: PropTypes.bool,
    identiconAddress: PropTypes.string,
    onCancel: PropTypes.func,
    onEdit: PropTypes.func,
    onEditGas: PropTypes.func,
    onSubmit: PropTypes.func,
    setMetaMetricsSendCount: PropTypes.func,
    metaMetricsSendCount: PropTypes.number,
    subtitle: PropTypes.string,
    subtitleComponent: PropTypes.node,
    summaryComponent: PropTypes.node,
    title: PropTypes.string,
    titleComponent: PropTypes.node,
    valid: PropTypes.bool,
    warning: PropTypes.string,
    advancedInlineGasShown: PropTypes.bool,
    insufficientBalance: PropTypes.bool,
    hideFiatConversion: PropTypes.bool,
    transactionCategory: PropTypes.string,
    getNextNonce: PropTypes.func,
    nextNonce: PropTypes.number,
    tryReverseResolveAddress: PropTypes.func.isRequired,
    hideSenderToRecipient: PropTypes.bool,
    showAccountInHeader: PropTypes.bool,
  }

  state = {
    submitting: false,
    submitError: null,
    submitWarning: '',
  }

  componentDidUpdate (prevProps) {
    const {
      transactionStatus,
      showTransactionConfirmedModal,
      history,
      clearConfirmTransaction,
      nextNonce,
      customNonceValue,
    } = this.props
    const { transactionStatus: prevTxStatus } = prevProps
    const statusUpdated = transactionStatus !== prevTxStatus
    const txDroppedOrConfirmed = transactionStatus === DROPPED_STATUS || transactionStatus === CONFIRMED_STATUS

    if (nextNonce !== prevProps.nextNonce || customNonceValue !== prevProps.customNonceValue) {
      if (customNonceValue > nextNonce) {
        this.setState({ submitWarning: this.context.t('nextNonceWarning', [nextNonce]) })
      } else {
        this.setState({ submitWarning: '' })
      }
    }

    if (statusUpdated && txDroppedOrConfirmed) {
      showTransactionConfirmedModal({
        onSubmit: () => {
          clearConfirmTransaction()
          history.push(DEFAULT_ROUTE)
        },
      })

      return
    }
  }

  getErrorKey () {
    const {
      balance,
      conversionRate,
      hexTransactionFee,
      txData: {
        simulationFails,
        txParams: {
          value: amount,
        } = {},
      } = {},
      customGas,
    } = this.props

    const insufficientBalance = balance && !isBalanceSufficient({
      amount,
      gasTotal: hexTransactionFee || '0x0',
      balance,
      conversionRate,
    })

    if (insufficientBalance) {
      return {
        valid: false,
        errorKey: INSUFFICIENT_FUNDS_ERROR_KEY,
      }
    }

    if (hexToDecimal(customGas.gasLimit) < 21000) {
      return {
        valid: false,
        errorKey: GAS_LIMIT_TOO_LOW_ERROR_KEY,
      }
    }

    if (simulationFails) {
      return {
        valid: true,
        errorKey: simulationFails.errorKey ? simulationFails.errorKey : TRANSACTION_ERROR_KEY,
      }
    }

    return {
      valid: true,
    }
  }

  handleEditGas () {
    const { onEditGas, showCustomizeGasModal, actionKey, txData: { origin }, methodData = {} } = this.props

    this.context.metricsEvent({
      eventOpts: {
        category: 'Transactions',
        action: 'Confirm Screen',
        name: 'User clicks "Edit" on gas',
      },
      customVariables: {
        recipientKnown: null,
        functionType: actionKey || getMethodName(methodData.name) || 'contractInteraction',
        origin,
      },
    })

    if (onEditGas) {
      onEditGas()
    } else {
      showCustomizeGasModal()
    }
  }

  renderDetails () {
    const {
      detailsComponent,
      primaryTotalTextOverride,
      secondaryTotalTextOverride,
      hexTransactionFee,
      hexTransactionTotal,
      hideDetails,
      useNonceField,
      customNonceValue,
      updateCustomNonce,
      advancedInlineGasShown,
      customGas,
      insufficientBalance,
      updateGasAndCalculate,
      hideFiatConversion,
      nextNonce,
      getNextNonce,
    } = this.props

    if (hideDetails) {
      return null
    }

    return (
      detailsComponent || (
        <div className="confirm-page-container-content__details">
          <div className="confirm-page-container-content__gas-fee">
            <ConfirmDetailRow
              label="燃气费"
              value={hexTransactionFee}
              headerText="Edit"
              headerTextClassName="confirm-detail-row__header-text--edit"
              onHeaderClick={() => this.handleEditGas()}
              secondaryText='-'
            />
            {advancedInlineGasShown
              ? <AdvancedGasInputs
                updateCustomGasPrice={newGasPrice => updateGasAndCalculate({ ...customGas, gasPrice: newGasPrice })}
                updateCustomGasLimit={newGasLimit => updateGasAndCalculate({ ...customGas, gasLimit: newGasLimit })}
                customGasPrice={customGas.gasPrice}
                customGasLimit={customGas.gasLimit}
                insufficientBalance={insufficientBalance}
                customPriceIsSafe={true}
                isSpeedUp={false}
              />
              : null
            }
          </div>
          <div className={useNonceField ? 'confirm-page-container-content__gas-fee' : null}>
            <ConfirmDetailRow
              label="总计"
              value={hexTransactionTotal}
              primaryText={primaryTotalTextOverride}
              secondaryText={hideFiatConversion ? this.context.t('noConversionRateAvailable') : secondaryTotalTextOverride}
              headerText="转账数额 + 燃气费"
              headerTextClassName="confirm-detail-row__header-text--total"
              primaryValueTextColor="#2f9ae0"
            />
          </div>
          {useNonceField ? <div>
            <div className="confirm-detail-row">
              <div className="confirm-detail-row__label">
                { this.context.t('nonceFieldHeading') }
              </div>
              <div className="custom-nonce-input">
                <TextField
                  type="number"
                  min="0"
                  placeholder={ nextNonce ? nextNonce.toString() : null }
                  onChange={({ target: { value } }) => {
                    if (!value.length || Number(value) < 0) {
                      updateCustomNonce('')
                    } else {
                      updateCustomNonce(String(Math.floor(value)))
                    }
                    getNextNonce()
                  }}
                  fullWidth
                  margin="dense"
                  value={ customNonceValue || '' }
                />
              </div>
            </div>
          </div> : null}
        </div>
      )
    )
  }

  renderData () {
    const { t } = this.context
    const {
      txData: {
        txParams: {
          data,
        } = {},
      } = {},
      methodData: {
        name,
        params,
      } = {},
      hideData,
      dataComponent,
      transactionCategory,
    } = this.props

    if (hideData) {
      return null
    }

    return dataComponent || (
      <div className="confirm-page-container-content__data">
        <div className="confirm-page-container-content__data-box-label">
          {`${t('functionType')}:`}
          <span className="confirm-page-container-content__function-type">
            { getMethodName(name) || this.context.tOrKey(transactionCategory) || this.context.t('contractInteraction') }
          </span>
        </div>
        {
          params && (
            <div className="confirm-page-container-content__data-box">
              <div className="confirm-page-container-content__data-field-label">
                { `${t('parameters')}:` }
              </div>
              <div>
                <pre>{ JSON.stringify(params, null, 2) }</pre>
              </div>
            </div>
          )
        }
        <div className="confirm-page-container-content__data-box-label">
          {`${t('hexData')}: ${ethUtil.toBuffer(data).length} bytes`}
        </div>
        <div className="confirm-page-container-content__data-box">
          { data }
        </div>
      </div>
    )
  }

  handleEdit () {
    const { txData, tokenData, tokenProps, onEdit, actionKey, txData: { origin }, methodData = {} } = this.props

    this.context.metricsEvent({
      eventOpts: {
        category: 'Transactions',
        action: 'Confirm Screen',
        name: 'Edit Transaction',
      },
      customVariables: {
        recipientKnown: null,
        functionType: actionKey || getMethodName(methodData.name) || 'contractInteraction',
        origin,
      },
    })

    onEdit({ txData, tokenData, tokenProps })
  }

  handleCancelAll () {
    const {
      cancelAllTransactions,
      clearConfirmTransaction,
      history,
      showRejectTransactionsConfirmationModal,
      unapprovedTxCount,
    } = this.props

    showRejectTransactionsConfirmationModal({
      unapprovedTxCount,
      onSubmit: async () => {
        this._removeBeforeUnload()
        await cancelAllTransactions()
        clearConfirmTransaction()
        history.push(DEFAULT_ROUTE)
      },
    })
  }

  handleCancel () {
    const { metricsEvent } = this.context
    const {
      onCancel,
      txData,
      cancelTransaction,
      history,
      clearConfirmTransaction,
      actionKey,
      txData: { origin },
      methodData = {},
      updateCustomNonce,
    } = this.props

    this._removeBeforeUnload()
    metricsEvent({
      eventOpts: {
        category: 'Transactions',
        action: 'Confirm Screen',
        name: 'Cancel',
      },
      customVariables: {
        recipientKnown: null,
        functionType: actionKey || getMethodName(methodData.name) || 'contractInteraction',
        origin,
      },
    })
    updateCustomNonce('')
    if (onCancel) {
      onCancel(txData)
    } else {
      cancelTransaction(txData)
        .then(() => {
          clearConfirmTransaction()
          history.push(DEFAULT_ROUTE)
        })
    }
  }

  handleSubmit () {
    const { metricsEvent } = this.context
    const {
      txData: { origin },
      sendTransaction,
      clearConfirmTransaction,
      txData,
      history,
      onSubmit,
      actionKey,
      metaMetricsSendCount = 0,
      setMetaMetricsSendCount,
      methodData = {},
      updateCustomNonce,
    } = this.props
    const { submitting } = this.state

    if (submitting) {
      return
    }

    this.setState({
      submitting: true,
      submitError: null,
    }, () => {
      this._removeBeforeUnload()
      metricsEvent({
        eventOpts: {
          category: 'Transactions',
          action: 'Confirm Screen',
          name: 'Transaction Completed',
        },
        customVariables: {
          recipientKnown: null,
          functionType: actionKey || getMethodName(methodData.name) || 'contractInteraction',
          origin,
        },
      })

      setMetaMetricsSendCount(metaMetricsSendCount + 1)
        .then(() => {
          if (onSubmit) {
            Promise.resolve(onSubmit(txData))
              .then(() => {
                this.setState({
                  submitting: false,
                })
                updateCustomNonce('')
              })
          } else {
            sendTransaction(txData)
              .then(() => {
                clearConfirmTransaction()
                this.setState({
                  submitting: false,
                }, () => {
                  history.push(DEFAULT_ROUTE)
                  updateCustomNonce('')
                })
              })
              .catch(error => {
                this.setState({
                  submitting: false,
                  submitError: error.message,
                })
                updateCustomNonce('')
              })
          }
        })
    })
  }

  renderTitleComponent () {
    const { title, titleComponent, hexTransactionAmount } = this.props

    // Title string passed in by props takes priority
    if (title) {
      return null
    }

    return titleComponent || (
      <UserPreferencedCurrencyDisplay
        value={hexTransactionAmount}
        type={PRIMARY}
        showEthLogo
        ethLogoHeight="50"
        hideLabel
      />
    )
  }

  renderSubtitleComponent () {
    const { subtitle, subtitleComponent, hexTransactionAmount } = this.props

    // Subtitle string passed in by props takes priority
    if (subtitle) {
      return null
    }

    return subtitleComponent || (
      <UserPreferencedCurrencyDisplay
        value={hexTransactionAmount}
        type={SECONDARY}
        showEthLogo
        hideLabel
      />
    )
  }

  handleNextTx (txId) {
    const { history, clearConfirmTransaction } = this.props

    if (txId) {
      clearConfirmTransaction()
      history.push(`${CONFIRM_TRANSACTION_ROUTE}/${txId}`)
    }
  }

  getNavigateTxData () {
    const { currentNetworkUnapprovedTxs, txData: { id } = {} } = this.props
    const enumUnapprovedTxs = Object.keys(currentNetworkUnapprovedTxs).reverse()
    const currentPosition = enumUnapprovedTxs.indexOf(id ? id.toString() : '')

    return {
      totalTx: enumUnapprovedTxs.length,
      positionOfCurrentTx: currentPosition + 1,
      nextTxId: enumUnapprovedTxs[currentPosition + 1],
      prevTxId: enumUnapprovedTxs[currentPosition - 1],
      showNavigation: enumUnapprovedTxs.length > 1,
      firstTx: enumUnapprovedTxs[0],
      lastTx: enumUnapprovedTxs[enumUnapprovedTxs.length - 1],
      ofText: this.context.t('ofTextNofM'),
      requestsWaitingText: this.context.t('requestsAwaitingAcknowledgement'),
    }
  }

  _beforeUnload = () => {
    const { txData: { origin, id } = {}, cancelTransaction } = this.props
    const { metricsEvent } = this.context
    metricsEvent({
      eventOpts: {
        category: 'Transactions',
        action: 'Confirm Screen',
        name: 'Cancel Tx Via Notification Close',
      },
      customVariables: {
        origin,
      },
    })
    cancelTransaction({ id })
  }

  _removeBeforeUnload = () => {
    if (getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_NOTIFICATION) {
      window.removeEventListener('beforeunload', this._beforeUnload)
    }
  }

  componentDidMount () {
    const { toAddress, txData: { origin } = {}, getNextNonce, tryReverseResolveAddress } = this.props
    const { metricsEvent } = this.context
    metricsEvent({
      eventOpts: {
        category: 'Transactions',
        action: 'Confirm Screen',
        name: 'Confirm: Started',
      },
      customVariables: {
        origin,
      },
    })

    if (getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_NOTIFICATION) {
      window.addEventListener('beforeunload', this._beforeUnload)
    }

    getNextNonce()
    tryReverseResolveAddress(toAddress)
  }

  componentWillUnmount () {
    this._removeBeforeUnload()
  }

  render () {
    const {
      isTxReprice,
      fromName,
      fromAddress,
      toName,
      toAddress,
      toEns,
      toNickname,
      methodData,
      valid: propsValid = true,
      errorMessage,
      errorKey: propsErrorKey,
      title,
      subtitle,
      hideSubtitle,
      identiconAddress,
      summaryComponent,
      contentComponent,
      onEdit,
      nonce,
      customNonceValue,
      assetImage,
      warning,
      unapprovedTxCount,
      transactionCategory,
      hideSenderToRecipient,
      showAccountInHeader,
    } = this.props
    const { submitting, submitError, submitWarning } = this.state

    const { name } = methodData
    const { valid, errorKey } = this.getErrorKey()
    const { totalTx, positionOfCurrentTx, nextTxId, prevTxId, showNavigation, firstTx, lastTx, ofText, requestsWaitingText } = this.getNavigateTxData()
    return (
      <ConfirmPageContainer
        fromName={fromName}
        fromAddress={fromAddress}
        showAccountInHeader={showAccountInHeader}
        toName={toName}
        toAddress={toAddress}
        toEns={toEns}
        toNickname={toNickname}
        showEdit={onEdit && !isTxReprice}
        // In the event that the key is falsy (and inherently invalid), use a fallback string
        action={getMethodName(name) || this.context.tOrKey(transactionCategory) || this.context.t('contractInteraction')}
        title={title}
        titleComponent={this.renderTitleComponent()}
        subtitle={subtitle}
        subtitleComponent={this.renderSubtitleComponent()}
        hideSubtitle={hideSubtitle}
        summaryComponent={summaryComponent}
        detailsComponent={this.renderDetails()}
        dataComponent={this.renderData()}
        contentComponent={contentComponent}
        nonce={customNonceValue || nonce}
        unapprovedTxCount={unapprovedTxCount}
        assetImage={assetImage}
        identiconAddress={identiconAddress}
        errorMessage={errorMessage || submitError}
        errorKey={propsErrorKey || errorKey}
        warning={warning || submitWarning}
        totalTx={totalTx}
        positionOfCurrentTx={positionOfCurrentTx}
        nextTxId={nextTxId}
        prevTxId={prevTxId}
        showNavigation={showNavigation}
        onNextTx={(txId) => this.handleNextTx(txId)}
        firstTx={firstTx}
        lastTx={lastTx}
        ofText={ofText}
        requestsWaitingText={requestsWaitingText}
        disabled={!propsValid || !valid || submitting}
        onEdit={() => this.handleEdit()}
        onCancelAll={() => this.handleCancelAll()}
        onCancel={() => this.handleCancel()}
        onSubmit={() => this.handleSubmit()}
        hideSenderToRecipient={hideSenderToRecipient}
      />
    )
  }
}

export function getMethodName (camelCase) {
  if (!camelCase || typeof camelCase !== 'string') {
    return ''
  }

  return camelCase
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([a-z])/g, ' $1$2')
    .replace(/ +/g, ' ')
}
