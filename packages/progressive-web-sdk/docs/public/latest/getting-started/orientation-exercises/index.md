Now that your [development server is running](../running-dev-server), it's a great time to do some hands-on exercises to get the feel for Mobify PWA development. We recommend completing the two exercises below to make your first changes to the PWA and understand how it's built.

## Adding a banner to the home page

In this short tutorial, we'll add a banner to the PWA home page.

Open the file that renders the home page in your text editor:

```bash
your-project-directory/packages/pwa/app/pages/home/index.jsx
```

Inside `index.jsx`, notice the `Home` React component. This component renders the content for the app.  

Let’s add a message to inform shoppers of a special free shipping promotion.

To do that, add the following code within the `render()` function, below the
`<h1>` tag:

```javascript
<h2>Free Shipping on orders over $50</h2>
```

Save the file and refresh the PWA in your browser. *You should now see your message!*

<div class="c-callout">
  <p>
    <strong>How it works:</strong> Behind the scenes, <code>npm run tag-loaded</code> and <code>npm run ssr</code> watch for changes to your files and automatically rebuild the PWA.
  </p>
</div>

Now it’s time to use our first component!

Mobify’s PWA SDK comes with a library of [React components](../../components/all/), one of which is for creating a [Banner](../../components/#!/Banner). Let’s modify our code to replace the simple message we added above with the Banner component from
SDK and take advantage of its enhanced styling.

First, let’s import the base styles for the Banner component.

Open the following file:

```bash
your-project-directory/packages/pwa/app/styles/themes/_pw-components.scss
```

This file defines the styles for all the components that come from Mobify's Component Library.

Look for the comment `// [AAA] Progressive Web SDK Base Styles`, and add the following import statement below it:

```js
@import 'node_modules/progressive-web-sdk/dist/components/banner/base';
```

<div class="c-callout c--important">
  <p>
    <strong>Why do I need to import the styles?</strong> To keep the size of your CSS files down, you should only import the styles for the components you plan on using. That is why a freshly-generated project, which does not use the Banner component, does not already import the styles for the Banner component.
  </p>
</div>

Now go back to the `index.jsx` file for the home page.

Let’s use the Banner component inside our Home component. We’ll need to import the component and add the Banner component inside the render function, like this:

```js
  import ListTile from 'progressive-web-sdk/dist/components/list-tile'
  // Add this import statement:
  import Banner from 'progressive-web-sdk/dist/components/banner'
  ...
  <h1 className="u-padding-top-md u-margin-bottom-sm">Home page</h1>
  // Remove this Free Shipping heading, we will handle it within the Banner component instead.
  <h2>Free Shipping on orders over $50</h2>
  // Add the Banner component here:
  <Banner icon="info" title="info">
    Free Shipping on orders over $50
  </Banner>
```

Save the file and refresh to see the new Banner.

## Styling the banner

To create our own styles for the banner on top of the base SDK theme styles, we need to create a new file under
`your-project-directory/packages/pwa/app/styles/themes/pw-components/` called `_banner.scss`.

Let's add some styles to `_banner.scss`:

```css
.pw-banner {
    background-color: $brand-color;
    color: $neutral-00;
}
```

Now go back to `your-project-directory/packages/pwa/app/styles/themes/_pw-components.scss`. Look for the comment, `// [BBB] Progressive Web SDK Custom Styles` and add the following import statement below it:

```css
@import 'pw-components/banner';
```

Reload, and you'll see your banner with the new background color.

Great work! You just learned how to customize your home page using your first SDK Component! From here, you may want to explore the parts of the Mobify Platform and how they fit together, in our [Architecture Overview](../../architecture/).

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>