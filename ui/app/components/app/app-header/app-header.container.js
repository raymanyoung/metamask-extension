import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'

import AppHeader from './app-header.component'
const actions = require('../../../store/actions')

const mapStateToProps = state => {
  const { appState, iTrust } = state
  const { networkDropdownOpen } = appState
  const {
    network,
    provider,
    selectedAddress,
    isUnlocked,
    isAccountMenuOpen,
  } = iTrust

  return {
    networkDropdownOpen,
    network,
    provider,
    selectedAddress,
    isUnlocked,
    isAccountMenuOpen,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    showNetworkDropdown: () => dispatch(actions.showNetworkDropdown()),
    hideNetworkDropdown: () => dispatch(actions.hideNetworkDropdown()),
    toggleAccountMenu: () => dispatch(actions.toggleAccountMenu()),
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(AppHeader)
