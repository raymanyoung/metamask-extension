import assert from 'assert'
import {
  getMaxModeOn,
} from '../amount-max-button.selectors.js'

describe('amount-max-button selectors', () => {

  describe('getMaxModeOn()', () => {
    it('should', () => {
      const state = {
        iTrust: {
          send: {
            maxModeOn: null,
          },
        },
      }

      assert.equal(getMaxModeOn(state), null)
    })
  })

})
