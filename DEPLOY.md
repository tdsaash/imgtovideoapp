# Deploy `imgtovideoapp` To Render (Free)

This project is already ready for Render with `render.yaml`.

## 1. Install Git (one time)

If `git` is not available in terminal:

```powershell
winget install --id Git.Git -e
```

Close and reopen terminal after install, then confirm:

```powershell
git --version
```

## 2. Push This Project To GitHub

Run inside `c:\Applications\imgtovideoapp`:

```powershell
git init
git add .
git commit -m "Initial commit: image split video studio"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 3. Deploy On Render Using Blueprint

1. Open Render dashboard.
2. Click `New` -> `Blueprint`.
3. Connect your GitHub account/repo.
4. Select this repository.
5. Click deploy.

Render reads `render.yaml` and creates:

- Node web service
- Free plan
- Build command: `npm install`
- Start command: `npm start`

## 4. URL + Behavior

After deploy you get:

`https://<your-service-name>.onrender.com`

Free plan note:

- Service sleeps after inactivity.
- First request after sleep can take some time to wake.

## 5. Optional: Manual Render Setup (without Blueprint)

If you choose `Web Service` instead of `Blueprint`, use:

- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
