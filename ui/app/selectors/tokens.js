import { createSelector } from 'reselect'

export const selectedTokenAddressSelector = state => state.iTrust.selectedTokenAddress
export const tokenSelector = state => state.iTrust.tokens
export const selectedTokenSelector = createSelector(
  tokenSelector,
  selectedTokenAddressSelector,
  (tokens = [], selectedTokenAddress = '') => {
    return tokens.find(({ address }) => address === selectedTokenAddress)
  }
)
