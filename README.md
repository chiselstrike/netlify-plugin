# netlify-plugin-chiselstrike

Sync Netlify and ChiselStrike build from projects in the same Git repository.

### Why?

Netlify allows you to deploy your frontend and functions as a single unit. With
this plugin you can also include your ChiselStrike backend to the bundle. So you
can be sure that once your frontend is built, you have a backend ready to
persist and serve your data.

### How?

It makes the ChiselStrike build a step inside the Netlify build. For that to
happen, it assumes that both ChiselStrike and Netlify code are in the same Git
repository.

# Install

Please install this plugin from the Netlify app. You can find instalation
instructions
[here](https://docs.netlify.com/integrations/build-plugins/#install-a-plugin).

# Configuration

`netlify-plugin-chiselstrike` needs a ChiselStrike project ID as configuration
parameter. This parameter can be set through the `projectId` input, or through
the `CHISELSTRIKE_PROJECT_ID` env var.

You can find your ChiselStrike project ID by opening the Settings tab inside
your projects dashboard in `chiselstrike.com`.
