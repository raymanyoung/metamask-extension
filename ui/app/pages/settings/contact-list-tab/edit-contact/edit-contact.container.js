import EditContact from './edit-contact.component'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { getAddressBookEntry } from '../../../../selectors/selectors'
import {
  CONTACT_VIEW_ROUTE,
  CONTACT_MY_ACCOUNTS_ROUTE,
  CONTACT_MY_ACCOUNTS_VIEW_ROUTE,
  CONTACT_MY_ACCOUNTS_EDIT_ROUTE,
  CONTACT_LIST_ROUTE,
} from '../../../../helpers/constants/routes'
import { addToAddressBook, removeFromAddressBook, setAccountLabel } from '../../../../store/actions'

const mapStateToProps = (state, ownProps) => {
  const { location } = ownProps
  const { pathname } = location
  const pathNameTail = pathname.match(/[^/]+$/)[0]
  const pathNameTailIsAddress = pathNameTail.includes('0x')
  const address = pathNameTailIsAddress ? pathNameTail.toLowerCase() : ownProps.match.params.id

  const { memo, name } = getAddressBookEntry(state, address) || state.iTrust.identities[address]

  const chainId = state.iTrust.network

  const showingMyAccounts = Boolean(pathname.match(CONTACT_MY_ACCOUNTS_EDIT_ROUTE))

  return {
    address,
    chainId,
    name,
    memo,
    viewRoute: showingMyAccounts ? CONTACT_MY_ACCOUNTS_VIEW_ROUTE : CONTACT_VIEW_ROUTE,
    listRoute: showingMyAccounts ? CONTACT_MY_ACCOUNTS_ROUTE : CONTACT_LIST_ROUTE,
    showingMyAccounts,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addToAddressBook: (recipient, nickname, memo) => dispatch(addToAddressBook(recipient, nickname, memo)),
    removeFromAddressBook: (chainId, addressToRemove) => dispatch(removeFromAddressBook(chainId, addressToRemove)),
    setAccountLabel: (address, label) => dispatch(setAccountLabel(address, label)),
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(EditContact)
