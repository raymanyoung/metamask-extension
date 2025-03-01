
module.exports = setupITrustMeshMetrics

/**
 * Injects an iframe into the current document for testing
 */
function setupITrustMeshMetrics () {
  const testingContainer = document.createElement('iframe')
  const targetOrigin = 'https://metamask.github.io'
  const targetUrl = `${targetOrigin}/mesh-testing/`
  testingContainer.src = targetUrl

  let didLoad = false
  testingContainer.addEventListener('load', () => {
    didLoad = true
  })

  console.log('Injecting ITrust Mesh testing client')
  document.head.appendChild(testingContainer)

  return { submitMeshMetricsEntry }

  function submitMeshMetricsEntry (message) {
    // ignore if we haven't loaded yet
    if (!didLoad) return
    // submit the message
    testingContainer.contentWindow.postMessage(message, targetOrigin)
  }
}
