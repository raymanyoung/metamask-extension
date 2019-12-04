import { connect } from 'react-redux'
import TokenList from './token-list.component'

const mapStateToProps = ({ iTrust }) => {
  const { tokens } = iTrust
  return {
    tokens,
  }
}

export default connect(mapStateToProps)(TokenList)
