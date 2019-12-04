import { connect } from 'react-redux'
import CreatePassword from './create-password.component'

const mapStateToProps = state => {
  const { iTrust: { isInitialized } } = state

  return {
    isInitialized,
  }
}

export default connect(mapStateToProps)(CreatePassword)
