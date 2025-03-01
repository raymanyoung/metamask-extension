import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { closeWelcomeScreen } from '../../../store/actions'
import Welcome from './welcome.component'

const mapStateToProps = ({ iTrust }) => {
  const { welcomeScreenSeen, isInitialized, participateInMetaMetrics } = iTrust

  return {
    welcomeScreenSeen,
    isInitialized,
    participateInMetaMetrics,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    closeWelcomeScreen: () => dispatch(closeWelcomeScreen()),
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(Welcome)
