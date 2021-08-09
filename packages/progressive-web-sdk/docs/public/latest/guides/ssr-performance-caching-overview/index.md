<div class="c-callout">
  <p>
    <strong>Note:</strong> The Server-Side Rendering Performance series is designed to dive into the most important topics you'll encounter while building, testing and deploying a server-side rendered Progressive Web App (PWA). To learn how these PWAs differ from Mobify’s tag-loaded PWAs, read our <a href="../../architecture/#two-types-of-pwas">overview</a>.
  </p>
</div>

## Introduction

Server-side rendered (SSR) PWAs are Mobify’s **fastest PWA technology**. SSR PWAs run on Mobify’s servers, and integrate with your site at either the DNS level or through your CDN. The resulting PWA is **served from a cache** to maximize speed.

In this article, we’ll show you how to build the fastest-possible SSR PWA by making sure that most pages are *cached* through the [CDN Cache](../ssr-performance-cdn-cache) and/or [Application Cache](../ssr-performance-application-cache), and ensuring that any remaining un-cached pages render quickly. We’ll introduce the differences between the CDN and Application Cache, before delving into the key steps for creating cacheable SSR versions of pages: removing personalized and frequently-changing information, setting HTTP cache control headers, and using the Mobify Platform’s request processor. To wrap up, we will introduce some helpful debugging tools, so you can pinpoint and diagnose any performance issues that may arise. 

<div class="c-callout">
  <p>
    <strong>Note:</strong> If you’re seeking guidance on client-side performance optimization, you can find it in our article <a href="../client-side-performance">Best Practices for Improving your PWA’s Client-Side Performance</a>.
  </p>
</div>

## About Mobify's CDN Cache and Application Cache

For an optimal user experience and for search engine optimization, it’s important that content is rendered as quickly as possible. In server-side rendered PWAs, the quickest way to send a response is from either Mobify’s [CDN Cache](../ssr-performance-cdn-cache) or from the [Application Cache](../ssr-performance-application-cache).

### CDN Caching

The CDN Cache has five regional caches that allow for fast responses from different regions around the world. This cache is optimal for improving shoppers’ user experience, as the response is very fast:

<figure class="u-text-align-center" style="background-color: #fafafa;">

  ![Mobify CDN Cache Hit](images/cdn-cache-hit-flow.png)
  <figcaption>Mobify’s content delivery network (CDN) checks its cache to see if it has a fresh version of that page available. If it does, it responds right away.</figcaption>

</figure>

As the CDN Cache has limited storage, infrequently-accessed items tend to be evicted in order to cache in-demand, frequently-accessed items.

Learn more about leveraging the CDN Cache in our article, [Using Mobify's CDN Cache to Boost PWA Performance](../ssr-performance-cdn-cache).

### Application Caching

Mobify also provides one Application Cache per target, which runs *behind* the CDN cache. The Application Cache can be used to augment the CDN cache. Unlike the CDN Cache, the Application Cache provides guaranteed storage of items. It offers abundant, permanent storage of the full HTTP response, or data that's needed to generate the response. This Cache is optimal for caching responses to web crawlers, as they tend to make requests to infrequently-used content, exactly the type of content that gets evicted from the CDN cache.

While it’s not quite as fast as the CDN cache response, the Application Cache provides guaranteed storage with response times that are still much quicker than rendering the page:

<figure class="u-text-align-center" style="background-color: #fafafa;">

  ![Mobify Application Cache Hit](images/application-cache-hit-flow.png)

</figure>

Learn more about leveraging the Application Cache in our article, [Using Mobify's Application Cache to Boost PWA Performance](../ssr-performance-application-cache).

### Uncached Responses

When a page is *not* cached, the response process is slower because we need to run the PWA server-side and render the page to get the output. The rendered page can then be cached for future requests:

<figure class="u-text-align-center" style="background-color: #fafafa;">

  ![Cache Miss](images/cache-miss-flow.png)
  <figcaption>The request/response flow is much longer when a page is not cached.</figcaption>

</figure>

## Using the CDN Cache together with the Application Cache

### HTTP Responses

The CDN Cache and the Application Cache are complementary, and as such, most projects can simultaneously use both to optimize HTTP responses. While the CDN Cache provides the fastest response, it’s *temporary* in nature. Due to its limited space, the CDN Cache cannot guarantee it will keep items in the cache, and when needed it will evict older, less-popular responses for newer, more-visited responses. While this is often optimal for shoppers, it’s not ideal for requests from web crawlers, which tend to request random, infrequently-visited content. The Application Cache addresses the temporary shortcoming of the CDN Cache, by guaranteeing that a response is cached.

You can store a response in *both* the CDN Cache and the Application Cache, which optimizes the response for both shoppers and for web crawlers, guaranteeing a fast response. In this design, the CDN Cache will initially store the content, providing the fastest-possible response. If the CDN Cache evicts the response, the SSR Server would then be able to find the response within the Application Cache.

### Additional uses for the Application Cache

In addition to storing full HTTP responses, the Application Cache can also store data that's used to generate responses. For example, the Application Cache can store data in order to avoid network calls to an ecommerce backend. Let’s imagine that your website features a navigation menu that changes frequently, almost daily. You could use the Application Cache to store the data for the navigation menu to avoid having to request it from the ecommerce backend every time. Rather than having short cache lifetimes and needing to request new data from the ecommerce backend daily, the SSR server can request the required data from the Application Cache.

## Before you can cache: creating the SSR representation of a page

To build fast, cacheable pages, responses should be appropriate to serve to all users, and they should be appropriate to serve for some duration of time. To achieve this, pages for caching by CDN or Application Cache should not contain any *personalized* or *frequently-changing* content.

*Personalized* information such as a user’s name, number of items in the cart, and preferred payment method is inappropriate to cache and send to different users. If a page includes personalized information, that page is not relevant to other users.

*Frequently-changing* content can also be less suitable for caching, because there’s a risk that we would respond with stale content. Examples are a product’s price, remaining inventory, or sales promotions. Imagine a product details page which typically shows the remaining inventory for a product. We would exclude the inventory from the rendered version of the page, to prevent rendering an out of date inventory count.

Because we avoid including any personalized or frequently-changing information in the server-side rendered page, it will always be a subset of the client side page. That is, the client side version of the page will have the addition of any personalized or frequently-changing content. This is critical for any entry pages in your site that are relevant to guest users, such as the home page, category listing, product listing, and product detail pages, as they need to leverage the cache to load as quickly as possible. Personalized or frequently-changing content can be requested once the PWA has loaded on the user’s device.

You can achieve this using the `isServerSideOrHydrating` flag in the Redux store.

Let’s consider a product detail page, as an example. Typically, cacheable content on this page would include the product name, images, description, and price. We would not cache personalized content such as the shopping cart, or saved items. We would also avoid caching frequently-changing information such as the price of remaining inventory.

<div class="c-callout">
  <p>
    <strong>Note:</strong> To preview a server-side rendered page, append the <code>?mobify_server_only</code> query string to the URL you'd like to preview. For example, you could test the server-side rendered version of <code>www.example.com</code> by visiting the URL <code>www.example.com?mobify_server_only</code>.
  </p>
</div>

### Example: cacheable product description component

```javascript
// To use the `isServerSideOrHydrating` state, we must import its selector
import {isServerSideOrHydrating} from 'progressive-web-sdk/dist/store/app/selectors'


// This component renders cacheable content, and non-cacheable content
const ProductDescription = ({bag, img, isServerSideOrHydrating, name, price}) => {
    return (
        <div>
            <header>
                <h1>{name}</h1>
                <div>
                    <img src="/cart.png" />

                    {/* The shopping bag consists of personalized content,
                      * so we only render it client side */}
                    {!isServerSideOrHydrating && <span>{bag.count}</span>}
                </div>
            </header>

            <main>
                <img {...img}/>
                <p>${price}</p>

                {/* Here, the sale price and inventory are only shown
                  * client side, because they change frequently */}
                {!isServerSideOrHydrating &&
                    <>
                        <p>Sale: ${sale}</p>
                        <p>Stock: {inventory} left!</p>
                    </>
                }

                <button>Add to cart</button>
            </main>
        </div>
    )
}


// To use the `isServerSideOrHydrating` state, we must map it to props
const mapStateToProps = createPropsSelector({isServerSideOrHydrating})
export default connect(mapStateToProps)(ProductDescription)
```

## Customizing cache lifetimes for HTTP status codes

For search engine optimization (SEO) as well as performance, it’s important to set the [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) for all responses and cache the page accordingly. For example, if a web crawler lands on a page such as `www.example.com/product/does-not-exist`, we will want to set a status code to communicate that no product was found. Otherwise, it may misrepresent that page in search listings.

We also recommend customizing cache lifetimes for different status codes. For example, you may consider setting a shorter cache lifetime in the case of a transient error, when there is a problem connecting to the ecommerce API. This would ensure that you can serve your users the correct version of the content more rapidly when the error is resolved. Meanwhile, successful responses should have a longer cache lifetime to maximize cache hits.

You can set the status code for responses in the parameters to `ssrRenderingComplete`(within `progressive-web-sdk/dist/utils/universal-utils`) or in the [`responseHook`](https://docs.mobify.com/progressive-web/latest/utility-functions/reference/SSRServer.html), which is located within `pwa/app/ssr.js`.

## Maximizing performance by making sure uncached pages are fast

Before a page can be cached, it must first be rendered as a response from the server-side rendering server. With that in mind, we want to ensure that rendering of responses is as fast as possible. This is important for both users’ experience and for SEO. While users may abandon a site that’s slow to load, Googlebot has an upper bound on how long it will wait for the first byte when crawling. If your rendering of the page exceeds that limit, Googlebot won’t crawl your page! To avoid this, we need to keep the response time under three seconds, and ideally much quicker.

Your PWA’s rendering speed correlates directly to the amount of time it takes to fulfill these requests. Consider the following techniques to improve response times:

1. Test and monitor your API response time
2. Check that your Mobify target is as close to your API datacenter as possible
3. Use cache control response headers on your API responses, where possible
4. Reduce the size of the Redux store in the response from the SSR server, which will decrease the size of your initial HTML, making it quicker to load

In many cases, there are two main culprits that slow your PWA’s uncached rendering time: network requests to get data for the page on the server-side, and the speed of parsing.

When building your page on the server-side, strive to have the SSR server make as few external requests as possible, and avoid making requests in serial. Ideally, all data for a page should come from only one external request, or two requests made in parallel. Making more than a few external requests, or making the requests in serial will drastically reduce performance. In addition to external network requests, a significant contribution toward initial load speed is the time it takes for requests to get from the SSR server to the backend server, and for the responses to be returned.

For builds using a [scraping connector](../../integrations/commerce-integrations/#implementing-a-custom-scraping-connector), the speed of parsing can also have a significant impact on rendering time. While DOM operations are extremely fast in browsers, these same operations are not as fast in the DOM-like environment that the SSR server uses. This can cause some selectors to be slow. When possible, use simple [selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors) to parse data.

In general, strive to do the least amount of work necessary to render the page. Wherever possible, avoid long-running computations or multiple React rendering passes, which will slow down server-side rendering.

## Next steps

Next, you can continue through our Server-Side Rendering Performance series, with articles about using Mobify's [CDN Cache](../ssr-performance-cdn-cache) and [Application Cache](../ssr-performance-application-cache) to boost performance. Or, explore [best practices to optimize your PWA’s client-side performance](../client-side-performance/).



<div id="toc"><p class="u-text-size-smaller u-margin-start u-margin-bottom"><b>IN THIS ARTICLE:</b></p></div>