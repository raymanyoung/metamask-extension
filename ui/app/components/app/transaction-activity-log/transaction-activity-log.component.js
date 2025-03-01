import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { getEthConversionFromWeiHex, getValueFromWeiHex } from '../../../helpers/utils/conversions.util'
import { formatDate } from '../../../helpers/utils/util'
import TransactionActivityLogIcon from './transaction-activity-log-icon'
import { CONFIRMED_STATUS } from './transaction-activity-log.constants'
import prefixForNetwork from '../../../../lib/etherscan-prefix-for-network'

export default class TransactionActivityLog extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
    metricEvent: PropTypes.func,
  }

  static propTypes = {
    activities: PropTypes.array,
    className: PropTypes.string,
    conversionRate: PropTypes.number,
    inlineRetryIndex: PropTypes.number,
    inlineCancelIndex: PropTypes.number,
    nativeCurrency: PropTypes.string,
    onCancel: PropTypes.func,
    onRetry: PropTypes.func,
    primaryTransaction: PropTypes.object,
    isEarliestNonce: PropTypes.bool,
  }

  handleActivityClick = hash => {
    const { primaryTransaction } = this.props
    const { iTrustNetworkId } = primaryTransaction

    const prefix = prefixForNetwork(iTrustNetworkId)
    const etherscanUrl = `https://${prefix}etherscan.io/tx/${hash}`

    global.platform.openWindow({ url: etherscanUrl })
  }

  renderInlineRetry (index, activity) {
    const { t } = this.context
    const { inlineRetryIndex, primaryTransaction = {}, onRetry, isEarliestNonce } = this.props
    const { status } = primaryTransaction
    const { id } = activity

    return isEarliestNonce && status !== CONFIRMED_STATUS && index === inlineRetryIndex
      ? (
        <div
          className="transaction-activity-log__action-link"
          onClick={() => onRetry(id)}
        >
          { t('speedUpTransaction') }
        </div>
      ) : null
  }

  renderInlineCancel (index, activity) {
    const { t } = this.context
    const { inlineCancelIndex, primaryTransaction = {}, onCancel, isEarliestNonce } = this.props
    const { status } = primaryTransaction
    const { id } = activity

    return isEarliestNonce && status !== CONFIRMED_STATUS && index === inlineCancelIndex
      ? (
        <div
          className="transaction-activity-log__action-link"
          onClick={() => onCancel(id)}
        >
          { t('speedUpCancellation') }
        </div>
      ) : null
  }

  renderActivity (activity, index) {
    const { conversionRate, nativeCurrency } = this.props
    const { eventKey, value, timestamp, hash } = activity
    const ethValue = index === 0
      ? `${getValueFromWeiHex({
        value,
        fromCurrency: nativeCurrency,
        toCurrency: nativeCurrency,
        conversionRate,
        numberOfDecimals: 6,
      })} ${nativeCurrency}`
      : getEthConversionFromWeiHex({
        value,
        fromCurrency: nativeCurrency,
        conversionRate,
        numberOfDecimals: 3,
      })
    const formattedTimestamp = formatDate(timestamp, 'T \'on\' M/d/y')
    const activityText = this.context.t(eventKey, [ethValue, formattedTimestamp])

    return (
      <div
        key={index}
        className="transaction-activity-log__activity"
      >
        <TransactionActivityLogIcon
          className="transaction-activity-log__activity-icon"
          eventKey={eventKey}
        />
        <div className="transaction-activity-log__entry-container">
          <div
            className="transaction-activity-log__activity-text"
            title={activityText}
            onClick={() => this.handleActivityClick(hash)}
          >
            { activityText }
          </div>
          { this.renderInlineRetry(index, activity) }
          { this.renderInlineCancel(index, activity) }
        </div>
      </div>
    )
  }

  render () {
    const { t } = this.context
    const { className, activities } = this.props

    return (
      <div className={classnames('transaction-activity-log', className)}>
        <div className="transaction-activity-log__title">
          { t('activityLog') }
        </div>
        <div className="transaction-activity-log__activities-container">
          { activities.map((activity, index) => this.renderActivity(activity, index)) }
        </div>
      </div>
    )
  }
}
