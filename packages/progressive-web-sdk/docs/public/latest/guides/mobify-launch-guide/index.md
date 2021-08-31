<div class="c-callout">
  <p>
    <strong>Note:</strong> This guide is intended for engineers who are working on server-side rendered Mobify Platform projects. Throughout the document, we will use the word <strong>target</strong>, which is Mobify’s word for environment.
  </p>
</div>

## Introduction

In this Guide, we’ll walk you through the steps for launching an app, such as a Progressive Web App (PWA) on the Mobify Platform. We’ll show you how to: 

- Use [Mobify’s API](https://docs.mobify.com/api/cloud/#api-Target_Management) to configure production and staging targets,
- Perform a test DNS cutover on a staging target; and
- Complete the final DNS cutover for production, when it’s time to go live.

Any of the domain name tasks will need to be completed by domain name administrators (usually this will be the Mobify customer, or the brand associated with the domain). For the purposes of this guide, let’s imagine you have an existing site hosted at `www.example.com` and a Mobify project with the ID `example`. Picture that you'd like to serve the Mobify powered site from `www.example.com`.

To achieve that, you must modify the DNS CNAME record for `www.example.com` so that it points to Mobify. If we use our example site from earlier, `www.example.com` would resolve to `example-production-cdn.mobify-storefront.com`. 

By default, this approach will serve the app to all visitors. (You can serve the app to a subset of traffic, for an A/B test for example, using the [request processor](../request-processor/).)

Mobify also supports integration through content delivery networks. Reach out to your Mobify point of contact for specific instructions on how to integrate Mobify through your CDN.

## Pre launch

Ideally, it’s best to complete these steps as soon as you begin your project.

**1. Create your production and staging targets** 

Your production target will already be setup as soon as you’ve created your project in [Mobify Cloud](../../mobify-cloud/overview). That leaves the staging target. You can use [Mobify’s API](https://docs.mobify.com/api/cloud/#api-Target_Management) to create your staging target and set its region, following our code example in the [Target Management API Tutorial](../mobify-api). By default, the targets’ regions will be set to `us-east-1` (North Virginia, USA). Your targets should use the region closest to the data centers for your backend. We'd recommend allocating one hour to complete this step.

**2. Setup access to the site’s original backend**

When the app is running on your production domain, it still needs a way to access your original backend. To do this, we need to create a new domain name that can be used to access the original backend. To explain, let’s go through an example.

Imagine that our website `www.example.com` originally resolved to a Salesforce Commerce Cloud backend. After the cutover at launch, `www.example.com` would resolve to Mobify, not to Salesforce. However, you'll still need a way to access Salesforce Commerce Cloud to fetch data. To maintain access to the backend, you’ll need to move it to another domain-- let’s imagine you choose `api.example.com`. You’d then need to configure your app to request data from `api.example.com` through proxy settings.

**3. Allow Mobify to issue a TLS Certificate**

To allow Mobify to receive a TLS certificate for your domain, you'll need to create a special DNS CNAME record. Reach out to your point of contact at Mobify to receive the required values. You must create the record **within 24 hours** of receiving the values. From there Mobify will be able to create and manage TLS certificates for your domain on your behalf.

As an example, the value for a DNS record will look something like this:

`_xyz.example.com` ⇒ `_abc.acm-validations.aws`

## Test launch

To ensure a smooth launch, it’s important that we initially test the DNS cutover process on a staging target. For example, we want to test the cutover for `staging.example.com` before we test making that change for `www.example.com`. Complete the following steps one to two weeks before the app’s launch: 

**1. Give your staging target’s DNS CNAME record a low Time To Live (TTL)**

It’s important to bring the Time to Live (TTL) for your original staging target CNAME record down to 1-2 minutes. This is for two reasons: it allows the switch-over to happen quickly, and also, in the case of a problem, you can switch back nearly immediately!

**2. Configure your staging target domain**

Now, we will configure targets so they’re ready to receive traffic. First we’ll do this for `staging`, as the staging target will help us to test the DNS cutover before we go live. To configure, update the properties `ssr_external_hostname` and `ssr_external_domain` using [Mobify's API](https://docs.mobify.com/api/cloud/#api-Target_Management). (Check out our [Target Management API Tutorial](../mobify-api/) to see an example of how to configure targets using the API.)

<div class="c-callout c--important">
  <p>
    <strong>Important:</strong> After completing this step, your app will no longer be available from the original <code>ssr_external_hostname</code>.
  </p>
</div>

**3. Test the DNS cutover**

Your point of contact at Mobify will provide you with a stable domain following the convention `$PROJECT-$TARGET-cdn.mobify-storefront.com` where `$PROJECT` is your project ID, and `$TARGET` is your target ID. Create a DNS CNAME record pointing from your original staging domain to Mobify’s stable domain for the staging target. For example, if your staging target is `staging.example.com`, your CNAME record would point `staging.example.com` to `example-staging-cdn.mobify-storefront.com`.

## Launch

When you’re ready to launch, complete the same steps as you did during the test launch phase, only this time you’ll complete them for the production target. After the DNS cutover on production, our fictitious example site `www.example.com` would cutover to `example-production-cdn.mobify-storefront.com`.

From here, Mobify engineers will assist you in monitoring the site’s traffic. The goal is to ensure that everything happens as expected during launch.
