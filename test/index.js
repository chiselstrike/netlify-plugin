import test from 'ava'
import { fileURLToPath } from 'url'

import netlifyBuild from '@netlify/build'

const NETLIFY_CONFIG = fileURLToPath(
  new URL('../netlify.toml', import.meta.url),
)

// Unit tests are using the AVA test runner: https://github.com/avajs/ava
// A local build is performed using the following command:
//   netlify-build --config ../netlify.toml
// Please see this netlify.toml configuration file. It simply runs the
// Build plugin.
// This is a smoke test. You will probably want to write more elaborate unit
// tests to cover your plugin's logic.
test('Unconfigured Netlify Build should fail', async (t) => {
  const { success } = await netlifyBuild({
    config: NETLIFY_CONFIG,
    buffer: true,
  })

  // Check that build does not succeed, because the project ID isn't set.
  t.false(success)
})
