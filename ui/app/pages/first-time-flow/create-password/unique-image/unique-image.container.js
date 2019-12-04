import { connect } from 'react-redux'
import UniqueImage from './unique-image.component'

const mapStateToProps = ({ iTrust }) => {
  const { selectedAddress } = iTrust

  return {
    address: selectedAddress,
  }
}

export default connect(mapStateToProps)(UniqueImage)
