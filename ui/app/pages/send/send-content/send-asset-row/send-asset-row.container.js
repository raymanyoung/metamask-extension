import { connect } from 'react-redux'
import SendAssetRow from './send-asset-row.component'
import {getMetaMaskAccounts} from '../../../../selectors/selectors'
import { setSelectedToken } from '../../../../store/actions'

function mapStateToProps (state) {
  return {
    tokens: state.iTrust.tokens,
    selectedAddress: state.iTrust.selectedAddress,
    selectedTokenAddress: state.iTrust.selectedTokenAddress,
    accounts: getMetaMaskAccounts(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setSelectedToken: address => dispatch(setSelectedToken(address)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SendAssetRow)
