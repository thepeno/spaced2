# Deploying

0. Log in to wrangler. Create a new <PROJECT_NAME> Cloudflare Pages project.

1. Update the environment variables in the Cloudflare dashboard.

    1. Create your Google OAuth Client ID.
    2. Provide the authorized JavaScript origins and the backend redirect URI. For example, `http://localhost, http://localhost:5173, https://spaced2.zsheng.app` and `https://api.spaced2.zsheng.app`.
    3. Set up the backend Cloudflare Worker.

2. Run `pnpm run deploy` which builds the project and pushes it. Replace `--project-name spaced2` with the name of your Cloudflare Pages project.
   Note: to use the environment variables in the Cloudflare dashboard, you should set up the CI to trigger a new build on push to the `main` branch
   of your repository.

   If not, Vite will bundle your public `VITE_` environment variables from
   the `.env.local` file into the production build.

3. Deploy the [backend](https://github.com/zsh-eng/spaced-backend).
