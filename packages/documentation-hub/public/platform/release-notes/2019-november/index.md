Released on November 14th, 2019 which corresponds to version `1.14.0` of our libraries.

In this release, we’re releasing a brand new server side rendering architecture, and are also shipping improvements to our Progressive Web App (PWA) scaffold and PWA SDK.

## <span class="c-label c--features">Features</span>

### Progressive Web Apps (PWAs)

#### Node server-side-rendering (SSR) environment

Node SSR is a new environment being introduced to the Mobify Platform to handle server-side-rendering. With Node SSR, the goal was to move to a server-side-rendering approach that's more reflective of what React recommends. The Node SSR environment uses a combination of [Node.js](https://nodejs.org/en/) and [Express](https://expressjs.com/), and leverages React's [`renderToString()`](https://reactjs.org/docs/react-dom-server.html#rendertostring) function to return HTML server-side.

Some key benefits and changes developers will enjoy while using the new Node SSR environment include:

-   **Familiarity and simplicity:** Developers well-versed in conventional server-side-rendering with React will feel right at home with Node SSR.
-   **Decoupled:** The Node SSR environment is completely state management library agnostic. Redux dependencies are now optional.
-   **Improved developer experience:** Node SSR provides developers with full access to your application's HTML and HTTP responses so that they can easily make changes.
-   **Interoperability:** Since Node SSR leverages conventional React SSR practices, third party libraries and tools will work better with Mobify. Additionally, developers will be able to easily leverage existing React and third party library documentation for SSR.

For this release cycle, we'll be releasing Node SSR in a separate **"V2"** release, that will be marked as a **release candidate**. This version will be released as `2.0.0-preview.0`. As a release candidate, developers can expect the code to frequently change with continued iteration on Node SSR, and can also expect breaking changes to occur.

Users who are interested in using Node SSR early for their projects are free to generate their projects from the initial **"V2"** release candidate. **"V2"** will fall under our [early access policy](https://docs.mobify.com/platform/support/). Once we've progressed Node SSR to a point the Mobify team is happy with, we'll be dropping the release candidate marking from the **"V2"** release, officially move the Platform to the **"V2"** version, and commit to pausing frequent, breaking changes to the interface.

Mobify is committed to continue supporting _both_ the new and previous SSR environments. However, the previous SSR environment will no longer be actively developed further outside of bug fixes and maintenance. The previous SSR environment will only available as part of the `1.x.x` release stream.

[Refer to our blog article](https://www.mobify.com/insights/server-side-rendering-mobify/) for the backstory on what's new and different with the new Node SSR environment.

#### Content Security Policy (CSP) support for inline scripts

The PWA SDK has been updated to support adding a strict [CSP](https://developers.google.com/web/fundamentals/security/csp), while still allowing the usage of inline scripts.

Typically, strict content security policies prevent users from using any inline scripts. There are a couple of methods for users to take should they still need to use inline scripts with a CSP. A user's primary motivation for protecting their inline scripts would be to avoid XSS attacks which inject JavaScript into a page's HTML. The method supported by Mobify's SDK is based on **script hashing**.

With script hashing, we calculate a hash for every inline script embedded within a page, and include that list of hashes as a whitelist in the CSP header. Since Mobify does not have ownership of all inline scripts within a project, we're unable to set the CSP header automatically. However, the SDK has been updated to at least generate all the hashes for every inline script.

## <span class="c-label c--updates">Updates</span>

### Node 10 Support

Mobify targets are the environments that run your app using Node.js. Previously, targets used Node.js version 8.10.x but that's changing going forward, as [version 8 will be discontinued in January 2020](https://github.com/nodejs/Release/blob/master/README.md#release-schedule). As part of this release, the Progressive Web SDK and Accelerated Mobile Pages (AMP) now supports Node.js 10. For PWAs, it’s supported in our latest version of the Mobify Platform (1.14.0) and we’ve also released patches for older SDK versions 1.11.3, 1.12.2 and 1.13.2. No SDK update is required to consume the update for AMP.

**For Server-side rendered customers:**

-   Mobify customers using server-side rendering must upgrade to Node.js 10 by January 1st, and we’ve already been spreading the word to affected customers. For more details on how you can upgrade your server-side rendered application, visit our [Node.js upgrade instructions](https://docs.mobify.com/progressive-web/latest/upgrades/node/).

**For Mobify tag customers:**

-   There are no actions required for tag-loaded projects, though you can choose to upgrade to an SDK version that supports Node.js 10 for local development benefits.

**For AMP customers:**

-   Mobify customers with AMP projects must upgrade to Node.js 10 by January 1st, and we've already been spreading the word to affected customers. For more details on how you can upgrade your AMP application, visit our [Node.js upgrade instructions](https://docs.mobify.com/amp-sdk/latest/upgrades/node-10/).

### Progressive Web Apps

#### Redeploying Bundles using the Mobify API

Back in July we released the [Mobify API](https://docs.mobify.com/progressive-web/latest/guides/mobify-api/), which had an initial focus on target management. This release we’ve started to expand the API with new functionality:

-   You can now create a new bundle and deploy it immediately without using the Mobify Cloud user interface.
-   You can roll back to a previous bundle using the API.
-   Redeploying the current live bundle is now possible. Redeploying bundles can be useful for a number of common operations such as applying new target configuration or invalidating the cache.

To use the new feature, check out our [Mobify API Reference docs](https://docs.mobify.com/api/cloud/#api-Target_Management-CreateDeploy).

## <span class="c-label c--bugs">Bug Fixes</span>

### PWA SDK

-   Both `lerna` and `nightwatch` dependencies have been updated to use their latest versions to resolve new security vulnerabilities associated with each library.

### PWA Scaffold

-   Resolved an issue where transitioning from the product listing page to the product detail page would cause janky horizontal re-centering.

## <span class="c-label c--known">Known Issues</span>

None!

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS RELEASE:</b></p></div>