# Overview:
The Canvas Grades & Courses Viewer is a specialized application tailored to offer users a comprehensive look into their academic progress. By presenting both courses and grades in a structured manner, students can gain insights into their performance and course lineup, all within a custom experience card.

# How It Works:
User Authentication: Upon accessing the application, users undergo a swift login process to verify their identity. This ensures that each student gets a customized view specific to their academic profile.

Middleware with AWS Lambda: To bridge the app with the Canvas API, we deploy AWS Lambda as a middleware. This not only maintains data security but also streamlines the data transfer process, ensuring real-time grade and course updates.

Data Retrieval: After a successful login, a data request is relayed to the Canvas API via the AWS Lambda function. The API responds by returning the corresponding grades and courses for the authenticated user.

Intuitive Display: The retrieved data is then presented, allowing users to effortlessly browse their courses and view their grades.

# Create Experience Extension
This module bootstraps your Ellucian Experience Extension development by creating an extension project. This module is primarily used to create your initial project. From this, you would add cards and make modifications. This project should be placed under your source control.

## Quick Start
Ensure you're running node 16.15.0
```sh
npx https://cdn.elluciancloud.com/assets/SDK/latest/ellucian-create-experience-extension-latest.tgz my-extension
cd my-extension
npm install
```
For Unix based systems:
```
cp sample.env .env
```
For Windows based systems:
```
copy sample.env .env
```
In the .env replace <upload-token> with an extension token from Experience Setup.
```
npm run deploy-dev
```

At this point, you have deployed the updated builds. Please re-run `npm run deploy-dev` if you update `extension.js`, `package.json`, or add a new card.

**NOTE:** This is using the real Experience Dashboard so your extension will not be visible until it is fully set up. This means you must enable your extension in Experience Setup and configure your card(s) in the Dashboard. This will be required each time you change your extension's version number.

### Live reloading the extensions
With live reloading enabled, you can make changes to your extensions locally and see them reflected immediately in your extensions — no browser reload required. Also, in this mode, changes are served directly from your development machine. This should significantly speed up the build/test process. Make sure you have run `npm run deploy-dev` command once to upload the extensions.
```
npm start
```
The server uses local port `8082` to communicate with the Experience Dashboard, by default. If that port is not open — or you need to use a different one, for any reason — you can specify an override. To do this, create a `.env` file if not already created and add the `PORT` environment variable with the port value that is available and save the file. EX: `PORT=8989`. Now run the below command.
```
npm start
```

This will start the local development server of the extension on port `8082` or the port number you have provided in the `.env` file. Now you can open the Experience app on any instances such as https://experience-test.elluciancloud.com/.

To put the Experience app into live reload mode, follow the steps given below.
1. Open browser developer tools
2. Go to the console tab of developer tools.
3. Run this function `enableLiveReload([optional-port-number])` from the console tab. NOTE that if you have launched the extension app on port other than the default `8082` port then provide the same port number while enabling live reload for Experience app.
4. Refresh the Experience app.

After you refresh the app, the cool thing is that only your extensions will show up. Make sure to bookmark your extensions. Now when you make changes to your extension code, locally, you'll see those changes reflected automatically and instantly in your browser, for both cards and pages. There will be no need for an explicit browser reload.

To disable live reload, run this function `disableLiveReload()` from console tab.

**NOTE** that changes to extension metadata (`package.json` and `extension.json`) will not be automatically picked up by live reload, nor will newly-created cards and pages. To see these changes, run the below command. Notice the `forceUpload` command-line argument, this will force the assets to be uploaded with the same version.
```
npm run deploy-dev -- --env forceUpload
```
### Watch and upload extensions
The command `npm start` has been repurposed to put the extension app into live-reload mode. To watch the changes and automatically deploy the updated builds, you can run the below command.
```
npm run watch-and-upload
```
**NOTE:**  This is using the real Experience Dashboard so your extension will not be visible until it is fully set up. This means you must enable your extension in Experience Setup and configure your card(s) in the Dashboard. This will be required each time you change your extension's version number.

