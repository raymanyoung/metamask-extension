const defaultNetworksData = [
  {
    labelKey: 'mainnet',
    iconColor: '#29B6AF',
    providerType: 'mainnet',
    rpcUrl: 'https://api.infura.io/v1/jsonrpc/mainnet',
    chainId: '1',
    ticker: 'ETH',
    blockExplorerUrl: 'https://etherscan.io',
  },
  {
    labelKey: 'itrust',
    iconColor: '#3099f2',
    providerType: 'nwchain',
    rpcUrl: 'https://localhost:8545/v1/jsonrpc',
    chainId: '1256',
    ticker: 'GAS',
    blockExplorerUrl: 'https://goerli.etherscan.io',
  }, 
  {
    labelKey: 'localhost',
    iconColor: 'white',
    border: '1px solid #6A737D',
    providerType: 'localhost',
    rpcUrl: 'http://localhost:8545/',
    blockExplorerUrl: 'https://etherscan.io',
  },
]

export {
  defaultNetworksData,
}
