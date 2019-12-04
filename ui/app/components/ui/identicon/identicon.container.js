import { connect } from 'react-redux'
import Identicon from './identicon.component'

const mapStateToProps = state => {
  const { iTrust: { useBlockie } } = state

  return {
    useBlockie,
  }
}

export default connect(mapStateToProps)(Identicon)
