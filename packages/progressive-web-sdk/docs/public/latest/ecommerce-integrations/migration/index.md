The Integration Manager simplifies integration with your ecommerce platform.
However, if your project was started before the Integration Manager existed, you
will need to complete a few steps to take advantage of it.

This document assumes that you have already read the following Integration
Manager guides:

* [Overview](../ecommerce-overview)
* [Integrating Salesforce Commerce Cloud](../integrating-sfcc) or [Integrating
  any Ecommerce Platform](../building-a-connector)
* [Using the Integration Manager](../usage)

## Select a connector

The first step when migrating a project to the Integration Manager is to
determine if you can use the built-in [Salesforce Commerce Cloud
Connector](../integrating-sfcc) or if you will need to build a new connector.

The [Integrating any Ecommerce Platform](../building-a-connector) guide
describes how to build a connector for a new project. This guide will list the
extra steps you'll need to take when building a connector for an existing
project. We will leave out the steps that are already covered in the
[Integrating any Ecommerce Platform](../building-a-connector) guide.

## Identify calls to your ecommerce platform

Once you've got your connector set up, you are ready to start the migration.

Calls to your ecommerce platform in existing actions will be replaced with
equivalent calls to built-in Integration Manager
commands or to custom commands in
an Integration Manager [extension](../extending-a-connector).

## Replace calls with commands

Now that you've identified an action that needs migration, the next step is to
extract the network call to the backend (it might be a REST API call or an AJAX
request to a page along with some HTML parsing). Review the set of Integration
Manager commands to see if there is an equivalent to the call being replaced. If
there is, import that command and dispatch it, passing the required parameters.
As noted in the [Using the Integration Manager](../usage) guide, all commands
return a Promise that resolves when the command completes. This provides a
convenient way to perform "clean up" logic when the command completes.

### Custom connector

When building with a custom connector, the code you are removing and replacing
with a command will still be used. It will just be moved into your custom
connector implementation for that command.

For example, you are working on the login feature. Within the
`app/containers/account/actions.js` file you have a thunk action that is
connected to the submit action of your login form (this example assumes you are
using Redux Form). This action makes an API request to the `api/login` endpoint
of your ecommerce platform. On success, it redirects to the home screen, on
failure it shows a notification, and at the end it clears the loading spinner no
matter if the call succeeded or failed.

#### Before

```javascript
// app/containers/account/actions.js
export const submitLoginForm = (formValues) => (dispatch) => {
    const postBody = {
        username: formValues.username,
        password: formValues.password,
        persistent_login: formValues.rememberMe
    }

    return makeJsonEncodedRequest(`api/login`, postBody, { method: 'POST' })
        .then((response) => response.json)
        .then((responseJSON) => {
            if (responseJSON.success) {
                browserHistory.push('/') // Navigate to home page on login
            } else {
                dispatch(showNotification(responseJSON.errorMessage))
            }

            dispatch(clearSpinner())
        })
}
```

#### After

Let's extract this logic and move it into our custom connector. We only want to
move the network logic into the connector though. The UI-related logic will stay
in our action.

```javascript
// app/containers/account/actions.js
import {login} from 'integration-manager/account/commands'

export const submitLoginForm = (formValues) => (dispatch) => {
    return dispatch(login(formValues.username, formValues.password, formValues.rememberMe))
        .then(() => {
            browserHistory.push('/') // Navigate to home page on login
        })
        .catch((err) {
            dispatch(showNotification(err.message))
        })
        .then(() => {
            dispatch(clearSpinner())
        })
}

// app/custom_connector/account/commands.js
import {setLoggedIn} from 'integration-manager/results'

// This command signature must match the Integration Manager command being
// implemented exactly, with the one exception that you can ignore parameters
// if they aren't relevant to your implementation
// For example: your ecommerce platfrom may not support the "remember me" flag
//              (or it may automatically return a persistent login cookie upon
//              login)
export const login = (username, password, rememberMe) => (dispatch) => {
    const postBody = {
        username: username,
        password: password,
        persistent_login: rememberMe
    }

    // Note that we are returning this Promise chain here. Commands _must_ always
    // return a Promise
    return makeJsonEncodedRequest(`api/login`, postBody, { method: 'POST' })
        .then((response) => response.json)
        .then((responseJSON) => {
            if (responseJSON.success) {
                dispatch(setLoggedIn(true))
            } else {
                // Commands _must_ return a Promise, but `makeJsonEncodedRequest()`
                // returns one so within this `.then()` block we can safely `throw`
                // and that will be turned into a `Promise.reject()`.
                throw new Error(responseJSON.errorMessage)
            }
        })
}
```

Let's note a few things in the refactored sample above:

1) We are still doing UI-related work in the `app/containers/account/actions.js`
   file. Even in a custom connector, you should avoid dealing with UI tasks.

2) The command implementation returns a Promise

3) The command implementation uses a result type imported from the
   Integration Manager to communicate the result of the operation back to the
   app. These result types enforce the official "schema" of the Integration
   Manager.

4) The refactored `app/containers/account/actions.js` action uses `.catch()` to
   deal with errors arising out of the custom connector.

5) We can `throw` errors from the custom connector if we are within a Promise
   chain.

## Update JSX

Once you have updated the calls to the back-end with command calls, there is one
final step in the migration. The Integration Manager manages the Redux schema
and provides a set of selectors related to each
Command. You can find the available selectors in `/app/store/**/selectors.js`.
The `/store` directory is organized into subdirectories by subject area so some
of the `selectors.js` files will be in a subdirectory of `/store` (for example:
cart-related selectors are in `/app/store/cart/selectors.js`).

The React components and containers that depend on the data in the store need to
be updated to use these selectors instead of custom-written ones. This means
that your components will now be using data managed by the Integration Manager
instead of data originating from a custom part of the store.

Open the JSX file that dispatches the action you're migrating. Find the
statement that builds the `mapStateToProps` object and replace any selectors
with the associated Integration Manager selector.

Let's continue the Login example by updating the Account's `container.jsx`
container.

```jsx
// /app/container/account/container.jsx
import {submitLoginForm} from './actions'
import {getIsLoggedIn} from '../../store/user/selectors'

class Login extends React.Component {
    render() {
        const {
            handleSubmit,
            submitForm,
            isLoggedIn
        } = this.props

        if (isLoggedIn) {
            return (
                <h2>Welcome back!</h2>
            )
        } else {
            return (
                <form noValidate={true} onSubmit={handleSubmit(submitForm)}>
            )
        }
    }
}

const mapStateToProps = {
    isLoggedIn: getIsLoggedIn
}

const mapDispatchToProps = {
    submitForm: submitLoginForm
}

export default template(connect(mapStateToProps, mapDispatchToProps)(Login))
```

Notice that we're now using the `getIsLoggedIn` selector. This is the selector
that the `login` command modifies when the login state changes.

This updated component now dispatches the `submitForm` action (as it always did)
when you submit the login form. The difference is that we use the
`getIsLoggedIn` selector to determine if we should just say "Hi" to the
logged-in user or present a login form.

## Wrap-up

In this guide, you learned how to migrate from a pre-Integration Manager
codebase. The basic steps involved are to:

* Identify calls to your ecommerce platform
* Replace those calls with equivalent Integration Manager commands
    * If you are building a custom connector you saw how to extract the logic
      into your custom connector
* Replace custom selectors with the ones provided by the Integration Manager