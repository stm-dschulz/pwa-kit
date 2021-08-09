A selector is a [pure
function](http://www.nicoespeon.com/en/2015/01/pure-functions-javascript/) that
takes a state object from the Redux store and returns some information extracted
from that state object. Selectors are most commonly used in `mapStateToProps`
functions to provide data to your React components. They are also used in
Integration Manager commands.

In a Mobify Progressive Web App, we always use selectors to get data from the
Redux store rather than accessing the Redux store directly. This lets us change
the structure of the Redux store without having to update every
`mapStateToProps` function that accesses the store. Instead, we just have to
update any selectors that are affected by the change.

Here's what a basic selector function looks like:

```javascript
const getProducts = ({products}) => products
```

In the example above, we're using two new language features from ES6: [arrow
functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
and [destructuring
assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment).
Destructuring assignment allows us to take the state object as a function
argument, extract the value from the object's `products` key, and assign it to
an argument named `products`. The arrow function syntax gives us a shorthand for
returning the value of `products` every time the function is called.

This is equivalent to the following code in ES5:

```javascript
var getProducts = function(state) {
    return state.products
}
```

## The Reselect library

The [Reselect library](https://github.com/reactjs/reselect) provides a number of
useful features for creating selectors. Most importantly, selectors built with
Reselect are _memoized_. A memoized function has a _memory_: it keeps track of
the previous arguments that were passed into it and keeps track of the previous
result. If the function is pure and the inputs don't change between sequential
calls to the function, we don't have to execute the body of the function more
than once. Memoization helps avoid unnecessary re-renders, as we'll see later
when we discuss how to use selectors within our `mapStateToProps` functions.

In addition to adding memoization, we can use Reselect to create selectors that
find and extract data inside the state tree in more sophisticated ways. To do
this, we need to use Reselect's `createSelector` function.

### Using the createSelector function

To call the `createSelector` function, start by passing in one or more basic
selector functions like the `getProducts` selector that we looked at earlier.
The last parameter that `createSelector` takes is a function to further process
the results of the supplied selector (or selectors).

Let's use Reselect to create a selector that returns the current product. First,
we call `createSelector` and pass in the `getProducts` selector and another
selector called `getCurrentProductId`. Then, as the last parameter, we pass in a
function that returns the current product from the Immutable.js map of products
that is returned by `getProducts`. To extract the current product from that map,
we need to call the `get()` method on it and pass in the result of the
`getCurrentProductId` selector.

Here's the code:

```javascript
import {getProducts, getCurrentProductId} from 'progressive-web-sdk/dist/store/products/selectors'
import {createSelector} from 'reselect'

export const getCurrentProduct = createSelector(
    getProducts,            // First basic selector
    getCurrentProductId,    // Second basic selector
    (                       // Function to process the results of the basic selectors
        products,           // Value returned by the getProducts selector
        currentProductId    // Value returned by the getCurrentProductId selector
    ) => {
        return products.get(currentProductId)
    }
)
```

**Important**: When using Reselect's `createSelector` function with more than
one basic selector, the resulting compound selector is still memoized. But for
it to return the memoized result, each of the basic selectors must return the
same result as the last time the compound selector was called.

## The Reselect Immutable Helpers library

We use a helper library (included via an npm package) called
`reselect-immutable-helpers` that simplifies working with selectors and
[Immutable.js](../../architecture/#immutablejs/) objects.

Immutable.js objects are very useful in the Redux store, but they can be awkward
and confusing to use when writing React components. The
`reselect-immutable-helpers` library will automatically convert plain JavaScript
objects into Immutable.js objects when necessary. It also contains functions for
simplifying the construction of selectors that traverse a tree of Immutable.js
objects.

### Using the createPropsSelector function within mapStateToProps

A common pattern when writing `mapStateToProps` functions with selectors is to
return an object with each key storing the result of a particular selector. The
`createPropsSelector` function lets us use this pattern without having to
repeatedly pass in the state object to each selector. All we have to do is pass
in an object where the keys are the desired prop names and the values are the
selectors that retrieve those props from the store.

For example, if we write:

```javascript
const mapStateToProps = createPropsSelector({
    title: getProductTitle,
    price: getProductPrice,
    image: getProductImage
})
```

This is equivalent to:

```javascript
const mapStateToProps = (state) => {
    return {
        title: getProductTitle(state),
        price: getProductPrice(state),
        image: getProductImage(state)
    }
}
```

The `createPropsSelector` function uses Reselect to create a memoized selector
function. Memoization allows us to take advantage of the built-in update checks
in `react-redux`. If each of the product details in this example are the same
from one update to the next, the `mapStateToProps` function will return exactly
the same object both times. The `connect()` function in `react-redux` checks if
this result is the same as before and will not update a component if its props
haven't changed. This is how we avoid most unnecessary re-renders without having
to write `shouldComponentUpdate` methods.

The `createPropsSelector` function also handles the conversion from
[Immutable.js](../../architecture/#immutablejs/) objects to plain JavaScript objects
automatically. If the `mapStateToProps` function is built using this function,
the resulting props are guaranteed to be plain JavaScript objects that do not
change unless the underlying Immutable.js object also changes.

We recommend that you use `createPropsSelector` in all your `mapStateToProps`
functions so that all your reducers and selectors can use Immutable.js objects
and all your components can use plain JavaScript objects, thereby avoiding the
errors associated with confusing the two types of object.

### Using the createGetSelector function

The `createGetSelector` function is a wrapper around the `.get` method of an
[Immutable.js](../../architecture/#immutablejs/) object using Reselect to reduce the repeated
code that comes with converting each Immutable.js object into a plain JavaScript
object. The `createGetSelector` function takes three parameters:

 1. A selector that returns an Immutable.js object
 1. A key _or_ a selector that returns a key
 1. An optional default value

The `createGetSelector` function is useful when we have a fixed key that is
already known when the selector is created. In this case, we would write the
following:

```javascript
const getProductTitle = createGetSelector(getProduct, 'title', '')
```

This is equivalent to:

```javascript
const getProductTitle = createSelector(
    getProduct,
    (product) => product.get('title', '')
)
```

A common pattern in the Progressive Web Redux store is to have a branch
containing details for different pages of the same type, keyed on the current
path. This is easily navigable using the more complex form of
`createGetSelector` where we pass in a selector instead of a string representing
a key:

```javascript
const getCurrentCategory = createGetSelector(
    getCategories,
    getCurrentPath,
    Immutable.Map()
)
```

This is equivalent to:

```javascript
const getCurrentCategory = createSelector(
    getCategories,
    getCurrentPath,
    (categories, currentPath) => categories.get(currentPath, Immutable.Map())
)
```

### Using the createHasSelector function

The `createHasSelector` function is very similar to `createGetSelector`, but
uses the `.has()` method on the [Immutable.js](../../architecture/#immutablejs/) object that is
passed into the function rather than the `.get()` method. It can take either a
constant key or a key selector, in the same way as `createGetSelector`. For
example:

```javascript
const isCurrentCategoryLoaded = createHasSelector(
    getCategories,
    getCurrentPath
)
```

This is equivalent to:

```javascript
const isCurrentCategoryLoaded = createSelector(
    getCategories,
    getCurrentPath,
    (categories, currentPath) => categories.has(currentPath)
)
```

## A complete annotated example

This is a simplified version of the selectors used in the product details page
for newly generated projects.

```javascript
// An example of what the relevant parts of the state would look like:

const state = Immutable.fromJS({
    app: {
        currentURL: '/books.html'
    },
    products: {
        8: {
            id: '8',
            title: 'Beginner\'s Guide To Transfiguration',
            price: '10.00',
            available: true,
            href: 'https://www.merlinspotions.com/books/beginners-guide-to-transfiguration.html',
            thumbnail: {
                alt: 'Beginner\'s Guide To Transfiguration Book',
                src: 'https://www.merlinspotions.com/media/catalog/product/cache/1/small_image/240x300/beff4985b56e3afdbeabfc89641a4582/b/e/beginners-guide-to-transfiguration-1.jpg'
            },
            images: [{
                alt: 'Beginner\'s Guide To Transfiguration Book',
                src: 'https://www.merlinspotions.com/media/catalog/product/cache/1/small_image/240x300/beff4985b56e3afdbeabfc89641a4582/b/e/beginners-guide-to-transfiguration-1.jpg'
            }]
        },
        9: {
            id: '9',
            title: 'Dragon Breeding For Pleasure and Profit',
            price: '30.00',
            available: true,
            href: 'https://www.merlinspotions.com/books/dragon-breeding-for-pleasure-and-profit.html',
            thumbnail: {
                alt: 'Dragon Breeding For Pleasure and Profit',
                src: 'https://www.merlinspotions.com/media/catalog/product/cache/1/small_image/240x300/beff4985b56e3afdbeabfc89641a4582/d/r/dragon-breeding-for-pleasure-and-profit-1.jpg'
            },
            images: [{
                alt: 'Dragon Breeding For Pleasure and Profit',
                src: 'https://www.merlinspotions.com/media/catalog/product/cache/1/small_image/240x300/beff4985b56e3afdbeabfc89641a4582/d/r/dragon-breeding-for-pleasure-and-profit-1.jpg'
            }]
        }
    },
    /* ... */
})
```

```javascript
// web/app/containers/product-details/selectors.js

import {createSelector} from 'reselect'
import Immutable from 'immutable'
import {createGetSelector, createHasSelector} from 'reselect-immutable-helpers'

// Many selectors are already available in the SDK
// You can import these selectors and use them to build other selectors
import {getProducts, getCurrentProductId} from 'progressive-web-sdk/dist/store/products/selectors'

// getProducts returns an Immutable.js map where all products are stored using their ID as the key, and
// createGetSelector gets the value returned by the getProducts selector,
// and gets the product with the key that matches the current product ID
export const getSelectedProductDetails = createGetSelector(
    getProducts,
    getCurrentProductId,
    // This default value allows downstream selectors to have
    // reasonable return values, even if the product isn't currently present
    Immutable.Map()
)

// The following selectors extract the various parts of the product details

// This selector builds on the getSelectedProductDetails selector we just defined
export const getItemQuantity = createGetSelector(
    getSelectedProductDetails,
    'itemQuantity'
)

export const getAddToCartInProgress = createGetSelector(
    getSelectedProductDetails,
    'addToCartInProgress',
    false
)

// createHasSelector checks if the value returned by the getProducts selector
// contains a product with a key that matches the current product ID
export const getProductDetailsContentsLoaded = createHasSelector(
    getProducts,
    getCurrentProductId
)

// This selector combines the results of multiple selectors to get a new value
export const getAddToCartDisabled = createSelector(
    getProductDetailsContentsLoaded,
    getAddToCartInProgress,
    (contentsLoaded, addToCartInProgress) => !contentsLoaded || addToCartInProgress
)
```

```javascript
// web/app/containers/product-details/partials/product-details-add-to-cart.jsx

import {createPropsSelector} from 'reselect-immutable-helpers'
import * as selectors from '../selectors'

/* ... */

const mapStateToProps = createPropsSelector({
    quantity: selectors.getItemQuantity,
    disabled: selectors.getAddToCartDisabled
})

/* ... */

export default connect(
    mapStateToProps
)(ProductDetailsAddToCart)

```

```javascript
// web/app/containers/product-details/actions.js

import IntegrationManager from 'mobify-integration-manager/dist/'
import {getCurrentProductId} from 'progressive-web-sdk/dist/store/products/selectors'
import * as selectors from './selectors'

/* ... */

// You can use createPropsSelector within actions and commands to extract data from the state. This will ensure that you're always working with a plain JavaScript object instead of an Immutable.js object (which is how most data is stored in the Redux store).
const submitCartFormSelector = createPropsSelector({
    productId: getCurrentProductId,
    qty: selectors.getItemQuantity
})

export const submitCartForm = () => (dispatch, getState) => {
    const {productId, qty} = submitCartFormSelector(getState())

    return dispatch(IntegrationManager.cart.addToCart(productId, qty))
}
```

<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>