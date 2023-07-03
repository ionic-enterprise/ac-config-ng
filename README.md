# Auth Connect Config

The purpose of this application is to allow you to establish and test the parameters of your OIDC connection. You can
also use several different pre-defined OIDC servers that we (Ionic) have set up to test and demo Auth Connect which
allows you to have a starting point if you need one.

This application performs login, logout, refresh, and "is authenticated" but does not use the auth tokens in conjunction with any backend API.

## Building and Running

If you would like to build this app you need to have access to both Identity Vault and Auth Connect, and you will have had to run the <a href="https://ionic.io/docs/supported-plugins/setup#register-your-product-key" target="_blank">registration process</a> on one of your applications. Once you have done that, you can copy the `.npmrc` file from that application to this one in order to gain access to the native solutions.

Once the access is set up, the build processes is the same as for most Ionic applications:

- `npm install`
- `npm run build`
- to start a development server: `npm start`
- to run on an Android device: `ionic cap run android`
- to run on an iOS device: `ionic cap run ios` (you may need to run `ionic cap start ios` and update the development team)

## Native Configuration Files

The `npm run build` command potentially modifies the following files:

```
android/app/build.gradle
android/app/src/main/AndroidManifest.xml
ios/App/App/Info.plist
src/config.ts
```

Do not commit changes to the `android/app/build.gradle` file. The `trapeze` tool adds the following code to it:

```diff
--- a/android/app/build.gradle
+++ b/android/app/build.gradle
@@ -15,6 +15,7 @@ android {
              // Default: https://android.googlesource.com/platform/frameworks/base/+/282e181b58cf72b6ca770dc7ca5f91f135444502/tools/aapt/AaptAssets.cpp#61
             ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
         }
+        manifestPlaceholders = ['AUTH_URL_SCHEME': 'msauth']
     }
     buildTypes {
         release {
```

This is currently performed as an add and not an update due to [limitations in the tooling](https://github.com/ionic-team/trapeze/issues/157).

Changes to the native files can be reverted to the committed content via `npm run clean`.

## Pages

### Test Connection

Use this page to log in, log out, and refresh the tokens. This page will also perform an "is authenticated" check each time it is visited.

### Settings

Use this page to either select one of the "Ionic" IODC servers or modify the existing configuration to match the parameters for your application. Note that you can only change the following parameters:

- authConfig
- clientID
- discoveryUrl
- scope
- audience
- webAuthFlow

You must currently be logged out in order to perform any actions on this page.

### Info

This page contains an explanation of the app itself as well as static information about the current configuration.

## Modifying Other Configuration Parameters

Many of the other configuration parameters do not affect the connection itself and can be changed whoever you see fit.
They are not exposed in the UI because the intention of this app is to focus on items that need to be customized on
per-provider basis.

There are three configuration items, however, that you may want to change that will require changes to the code:

- redirectUri
- logoutUrl
- uiMode

In all cases, you will need to modify these directly in the `environment.ts` and `environment.prod.ts` files.

### Updating the `redirectUri` and the `logoutUrl`

For the `redirectUri` and `logoutUrl`, you will need to also update the allowable schema in the `Info.plist` and
`app/build.gradle` files.

This application uses `msauth` as the protocol. Our Azure instance requires `msauth`, so we use that for the other
three just to keep the code simple. For your own app we suggest using something like `com.your-domain.appname` instead.
You can change this in your build by changing the `AUTH_URL_SCHEME` in the `.env` file and running `npm run build` again.

To use the modified `AUTH_URL_SCHEME`, go to the Settings page, set the custmizable configuration settings as desired,
and press the `Use Customization` button.

### Updating the `uiMode`

If you change the `uiMode` from the default of `POPUP` to `CURRENT` you will need to change the code as well.
With `CURRENT`, the current web context is used for the login. When doing so, all session state is lost. Also, upon
returning to the application, the auth token will be provided as a query parameter that needs to be extracted.

Using `CURRENT` is not suggested due to the extra complexity of coding that is required, and because information is passed via the callback URL rather than in headers. For the web, we suggest `PKCE` for web using a "popup" interface (note that some users will very likely have to adjust their popup blocker settings, but that can be addressed via information displayed in your app if you so wish).

Happy Coding!!
