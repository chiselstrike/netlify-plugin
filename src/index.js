import axios from 'axios'

export const onPreBuild = async function ({ inputs, utils: { build } }) {
  const { projectId } = inputs
  if (projectId == null) {
    return build.failBuild(
      'ChiselStrike projectId not found. Add it to the plugin inputs.',
    )
  }

  const csBuild = await getChiselStrikeBuildResult(
    projectId,
    process.env.COMMIT_REF,
  )

  if (csBuild == 'OK') {
    console.log(`ChiselStrike build succeeded.`)
    return
  }

  if (csBuild == 'ERR') {
    return build.failBuild(
      'ChiselStrike build failed. Interrupting Netlify build.',
    )
  }

  return build.failBuild(
    'ChiselStrike build not found. Interrupting Netlify build.',
  )
}

async function getChiselStrikeBuildResult(projectId, commitRef) {
  let status = 'UNKNOWN'
  const start = Date.now()

  while (msSince(start) < 10 * 1000) {
    status = await getDeployStatus(projectId, commitRef)
    if (isFinal(status)) break
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return status
}

function msSince(start) {
  return Date.now() - start
}

function isFinal(status) {
  return status === 'OK' || status === 'ERR'
}

async function getDeployStatus(projectId, commitRef) {
  const url = `https://chiselstrike.com/api/projects/${projectId}/commits/${commitRef}/deployments`
  const data = await axios
    .get(url)
    .then((r) => r.data)
    .catch((e) => [])
  if (data.length == 0) {
    return 'UNKNOWN'
  }

  const [latest] = data
  return latest.status
}
