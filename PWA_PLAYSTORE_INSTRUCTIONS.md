# Publishing Athonix PWA to Google Play Store

This document provides step-by-step instructions for publishing your Athonix Progressive Web App (PWA) to the Google Play Store.

## Prerequisites

1. A Google Play Developer account (requires a one-time $25 USD fee)
2. Completed PWA implementation (which we've now done)
3. App icons and screenshots (placeholders created, need to be replaced with actual assets)

## Steps for Google Play Store Publication

### 1. Build Your PWA for Production

```bash
# Set export mode to static for Play Store compatibility
set EXPORT_MODE=static
npm run build
```

This will create a static export in the `out` directory, which can be used for the Play Store.

### 2. Create a TWA (Trusted Web Activity)

Google Play Store requires Android apps, so you'll need to wrap your PWA in a TWA. The simplest way is using Bubblewrap:

1. Install Bubblewrap CLI:
   ```bash
   npm install -g @bubblewrap/cli
   ```

2. Initialize a new TWA project:
   ```bash
   bubblewrap init --manifest https://your-deployed-site.com/manifest.json
   ```

3. Build the Android App Bundle:
   ```bash
   bubblewrap build
   ```

Alternatively, you can use PWABuilder (https://www.pwabuilder.com/) which provides a simple web UI for generating Android packages from your PWA.

### 3. Prepare Digital Asset Links

1. Deploy your PWA to your production domain
2. Generate a Digital Asset Links file for your app
3. Update the `.well-known/assetlinks.json` file with your app's fingerprint (replace the placeholder)

### 4. Prepare Required Google Play Store Assets

1. App icons (already prepared in `/public/icons/`)
2. Feature graphic (1024x500 pixels)
3. Screenshots (prepared in `/public/screenshots/`)
4. Privacy policy (create a `/privacy-policy` page in your app)
5. App description (short and full versions)

### 5. Submit to Google Play Store

1. Log in to Google Play Console
2. Create a new app
3. Fill in all required information
4. Upload your Android App Bundle (.aab file)
5. Complete the store listing with assets prepared in step 4
6. Set pricing and distribution
7. Submit for review

### 6. Post-Submission

- Google's review process typically takes 1-3 days
- Respond promptly to any clarification requests
- Once approved, your app will be available on the Play Store

## Updating Your App

When you need to update your PWA:

1. Make changes to your web app
2. Deploy the updated web app to your production domain
3. No need to resubmit to Play Store for web content updates (one of the major advantages of PWAs!)
4. Only resubmit to Play Store if you change Android-specific configurations

## Important Notes

- Your app must meet Google Play Store policies
- PWAs on Play Store must provide a good offline experience
- Ensure your app works well on various Android device sizes
- Keep your SSL certificate valid at all times

## Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [Google Play TWA Documentation](https://developers.google.com/web/android/trusted-web-activity)
- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
