/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {ChakraProvider} from '@chakra-ui/react'

// Removes focus for non-keyboard interactions for the whole application
import 'focus-visible/dist/focus-visible'

import theme from '../../theme'
import CommerceAPI from '../../commerce-api'
import {
    CommerceAPIProvider,
    CustomerProvider,
    BasketProvider,
    CustomerProductListsProvider
} from '../../commerce-api/contexts'
import {commerceAPIConfig} from '../../commerce-api.config'
import {einsteinAPIConfig} from '../../einstein-api.config'
import {DEFAULT_LOCALE, SUPPORTED_LOCALES} from '../../constants'

const apiConfig = {
    ...commerceAPIConfig,
    einsteinConfig: einsteinAPIConfig
}

/**
 * Use the AppConfig component to inject extra arguments into the getProps
 * methods for all Route Components in the app – typically you'd want to do this
 * to inject a connector instance that can be used in all Pages.
 *
 * You can also use the AppConfig to configure a state-management library such
 * as Redux, or Mobx, if you like.
 */
const AppConfig = ({children, locals = {}}) => {
    const [basket, setBasket] = useState(null)
    const [customer, setCustomer] = useState(null)

    return (
        <CommerceAPIProvider value={locals.api}>
            <CustomerProvider value={{customer, setCustomer}}>
                <BasketProvider value={{basket, setBasket}}>
                    <CustomerProductListsProvider>
                        <ChakraProvider theme={theme}>{children}</ChakraProvider>
                    </CustomerProductListsProvider>
                </BasketProvider>
            </CustomerProvider>
        </CommerceAPIProvider>
    )
}

AppConfig.restore = (locals = {}) => {
    // TODO: There is probably a better way to do this. Maybe build it into the SDK too.
    if (typeof window !== 'undefined') {
        locals.originalUrl = window.location.pathname
    }

    const [locale] = AppConfig.getUserPreferredLocales(locals)

    locals.api = new CommerceAPI({...apiConfig, locale})
}

AppConfig.freeze = () => undefined

AppConfig.extraGetPropsArgs = (locals = {}) => {
    return {
        api: locals.api
    }
}

AppConfig.getUserPreferredLocales = (locals) => {
    // TODO: `locals` as an argument doesn't seem right think a little bit more about this one.
    // Like do we need the request object here?
    const {originalUrl} = locals

    const localeUrl = originalUrl && originalUrl.split('/')[1]

    const locale = originalUrl
        ? SUPPORTED_LOCALES.includes(localeUrl)
            ? localeUrl
            : DEFAULT_LOCALE
        : window?.__PRELOADED_STATE__?.appProps?.targetLocale

    return [locale]
}

AppConfig.importLocaleData = async (locale) => {
    let module
    try {
        module = await import(`../../translations/compiled/${locale}.json`)
    } catch (err) {
        console.error(err)
        console.log(`Loading the default locale '${DEFAULT_LOCALE}' instead`)
        module = await import(`../../translations/compiled/${DEFAULT_LOCALE}.json`)
    }
    return module.default
}

AppConfig.propTypes = {
    children: PropTypes.node,
    locals: PropTypes.object
}

export default AppConfig
