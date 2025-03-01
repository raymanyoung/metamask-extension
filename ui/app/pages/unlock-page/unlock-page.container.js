import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { getEnvironmentType } from '../../../../app/scripts/lib/util'
import { ENVIRONMENT_TYPE_POPUP } from '../../../../app/scripts/lib/enums'
import { DEFAULT_ROUTE, RESTORE_VAULT_ROUTE } from '../../helpers/constants/routes'
import {
  tryUnlockMetamask,
  forgotPassword,
  markPasswordForgotten,
  forceupdateITrustState,
  showModal,
} from '../../store/actions'
import UnlockPage from './unlock-page.component'

const mapStateToProps = state => {
  const { iTrust: { isUnlocked } } = state
  return {
    isUnlocked,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    forgotPassword: () => dispatch(forgotPassword()),
    tryUnlockMetamask: password => dispatch(tryUnlockMetamask(password)),
    markPasswordForgotten: () => dispatch(markPasswordForgotten()),
    forceupdateITrustState: () => forceupdateITrustState(dispatch),
    showOptInModal: () => dispatch(showModal({ name: 'METAMETRICS_OPT_IN_MODAL' })),
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { markPasswordForgotten, tryUnlockMetamask, ...restDispatchProps } = dispatchProps
  const { history, onSubmit: ownPropsSubmit, ...restOwnProps } = ownProps

  const onImport = () => {
    markPasswordForgotten()
    history.push(RESTORE_VAULT_ROUTE)

    if (getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_POPUP) {
      global.platform.openExtensionInBrowser(RESTORE_VAULT_ROUTE)
    }
  }

  const onSubmit = async password => {
    await tryUnlockMetamask(password)
    history.push(DEFAULT_ROUTE)
  }

  return {
    ...stateProps,
    ...restDispatchProps,
    ...restOwnProps,
    onImport,
    onRestore: onImport,
    onSubmit: ownPropsSubmit || onSubmit,
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps, mergeProps)
)(UnlockPage)
