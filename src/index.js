import axios from 'axios'

const CHISELSTRIKE_DOT_COM = 'chiselstrike.com'
const DEFAULT_TIMEOUT_SEC = 30

export const onPreBuild = async function ({
  inputs,
  netlifyConfig,
  utils: { build },
}) {
  const projectId = getProjectId(inputs)
  if (projectId == null) {
    return build.failBuild(
      'ChiselStrike projectId not found. Add it to the plugin inputs.',
    )
  }

  const deploy = await getChiselStrikeDeploy(inputs)

  if (deploy?.status == 'OK') {
    const domain = deploy.url
    netlifyConfig.build.environment['CHISELSTRIKE_DEPLOY'] = domain
    console.log(
      `ChiselStrike build succeeded. Endpoints available at: https://${domain}`,
    )
    return
  }

  if (deploy?.status == 'ERR') {
    return build.failBuild(
      'ChiselStrike build failed. Interrupting Netlify build.',
    )
  }

  return build.failBuild(
    'ChiselStrike build not found. Interrupting Netlify build.',
  )
}

async function getChiselStrikeDeploy(inputs) {
  let deploy = null

  const start = Date.now()
  const timeout = getTimeoutMs(inputs)
  while (msSince(start) < timeout) {
    deploy = await getDeploy(inputs)
    if (isFinal(deploy?.status)) break
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return deploy
}

function getProjectId(inputs) {
  const { projectId } = inputs
  if (projectId != null) return projectId
  return process.env.CHISELSTRIKE_PROJECT_ID;
}

function msSince(start) {
  return Date.now() - start
}

function isFinal(status) {
  return status === 'OK' || status === 'ERR'
}

function getTimeoutMs(inputs) {
  let timeout = parseInt(inputs.buildTimeoutSec)
  if (isNaN(timeout) || timeout <= 0) {
    timeout = DEFAULT_TIMEOUT_SEC
  }
  return timeout * 1000
}

async function getDeploy(inputs) {
  const projectId = getProjectId(inputs)
  const domain = process.env.CHISEL_STRIKE_DOMAIN ?? CHISELSTRIKE_DOT_COM
  const commitRef = process.env.COMMIT_REF
  const url = `https://${domain}/api/projects/${projectId}/commits/${commitRef}/deployments`
  const data = await axios
    .get(url)
    .then((r) => r.data)
    .catch(() => [])

  if (data.length == 0) {
    return 'UNKNOWN'
  }

  const [latest] = data
  return latest
}
