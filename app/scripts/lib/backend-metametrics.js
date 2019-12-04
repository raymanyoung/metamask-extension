const {
  getMetaMetricState,
} = require('../../../ui/app/selectors/selectors')
const {
  sendMetaMetricsEvent,
} = require('../../../ui/app/helpers/utils/metametrics.util')

const inDevelopment = process.env.NODE_ENV === 'development'

const METAMETRICS_TRACKING_URL = inDevelopment
  ? 'http://www.iTrust.io/metametrics'
  : 'http://www.iTrust.io/metametrics-prod'

function backEndMetaMetricsEvent (iTrustState, eventData) {
  const stateEventData = getMetaMetricState({ iTrust: iTrustState })

  if (stateEventData.participateInMetaMetrics) {
    sendMetaMetricsEvent({
      ...stateEventData,
      ...eventData,
      url: METAMETRICS_TRACKING_URL + '/backend',
    })
  }
}

module.exports = backEndMetaMetricsEvent
