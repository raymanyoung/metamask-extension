import { connect } from 'react-redux'
import FirstTimeFlowSwitch from './first-time-flow-switch.component'

const mapStateToProps = ({ iTrust }) => {
  const {
    completedOnboarding,
    isInitialized,
    isUnlocked,
    participateInMetaMetrics: optInMetaMetrics,
  } = iTrust

  return {
    completedOnboarding,
    isInitialized,
    isUnlocked,
    optInMetaMetrics,
  }
}

export default connect(mapStateToProps)(FirstTimeFlowSwitch)
