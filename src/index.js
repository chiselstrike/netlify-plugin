import axios from 'axios'

export const onPreBuild = async function ({
  inputs,
  netlifyConfig,
  utils: { build },
}) {
  const { projectId } = inputs
  if (projectId == null) {
    return build.failBuild(
      'ChiselStrike projectId not found. Add it to the plugin inputs.',
    )
  }

  const deploy = await getChiselStrikeDeploy(projectId, process.env.COMMIT_REF)

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

async function getChiselStrikeDeploy(projectId, commitRef) {
  let deploy = null
  const start = Date.now()

  while (msSince(start) < 10 * 1000) {
    deploy = await getDeploy(projectId, commitRef)
    if (isFinal(deploy?.status)) break
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return deploy
}

function msSince(start) {
  return Date.now() - start
}

function isFinal(status) {
  return status === 'OK' || status === 'ERR'
}

async function getDeploy(projectId, commitRef) {
  const url = `https://chiselstrike.com/api/projects/${projectId}/commits/${commitRef}/deployments`
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
