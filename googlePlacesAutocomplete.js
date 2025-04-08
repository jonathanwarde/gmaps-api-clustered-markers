import accessibleAutosuggestionDropdown from './accessibleAutosuggestionDropdown'
import formActionUrl from './formActionUrl'
import navigatorGeolocation from './navigatorGeolocation'

const debug = false

/* eslint-disable */
const googlePlacesAPIAutocomplete = () => {
    console.log('googlePlacesAPIAutocomplete running..')
    let map
    let autocomplete
    let filters
    //= ==============================================================/
    //  =autocomplete
    //= ==============================================================/
    autocomplete = {
        propertySearchForms: document.querySelectorAll('.js-development-search-form'),
        propertySearchForm: document.querySelector('.js-development-search-form'),
        propertySearchInput: document.querySelectorAll('[name=development_name]'),
        autocompleteForm: null, // form being used, assigned in initSearch()
        autocomplete: [],
        autoCompleteTypes: ['geocode'], // https://developers.google.com/places/supported_types#table3
        autoCompleteServiceTypes: ['(cities)', '(regions)', 'address', 'geocode'],
        autoCompleteSearchCheck: 0,
        autoCompleteSearchCheckResultsCount: 0,
        autoCompleteSearchCheckID: null,
        postcodeRegex: new RegExp(
            '^(([gG][iI][rR] {0,}0[aA]{2})|((([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y]?[0-9][0-9]?)|(([a-pr-uwyzA-PR-UWYZ][0-9][a-hjkstuwA-HJKSTUW])|([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y][0-9][abehmnprv-yABEHMNPRV-Y])))( {0,}[0-9][abd-hjlnp-uw-zABD-HJLNP-UW-Z]{2})?))$'
        ),
        place: '',
        autoCompleteComponentRestrictions: { country: 'uk' },
        geo: {},
        latField: document.querySelector('[name=Lat]'),
        lngField: document.querySelector('[name=Lng]'),
        geocodeApi: `https://www.googleapis.com/geolocation/v1/geolocate?key=${window.googleApiKey}`,
        errorMessage: '',
        autoCompletePick: document.getElementById('search-picker'),
        autoCompletePickList: document.getElementById('search-picker-list'),
        autoCompletePickClose: document.querySelectorAll('.-picker-close'),
        autoCompleteKeywordField: document.getElementById('modalKeyword'),
        autoCompleteKeywordButton: document.getElementById('modalKeywordButton'),
        searchTypeField: document.querySelector('[name=Search-Type]'),
        searchFormOptions: document.querySelectorAll('.search-group-nav__title-link'),
        searchFormActions: document.querySelectorAll('.search-group-form__action'),
        searchFormKeywords: document.querySelectorAll('[name=keywords]'),
        searchFormDevelopment: document.querySelectorAll('[name=development_name]'),
        searchFormNearMe: document.querySelectorAll('.search-group-form__action-nearme'),
        suggestionBox: document.getElementById('suggestionBox'),
    }

    console.log(
        'googlePlacesAPIAutocomplete running,',
        autocomplete.latField,
        autocomplete.lngField
    )
    console.log('googlePlacesAPIAutocomplete running,', autocomplete.geocodeApi)

    if ('showPopover' in HTMLElement.prototype) {
        console.log('showPopover is supported')
        document.getElementById('popover').classList.remove('-hide-popover')
    }

    // search and geolocation
    window.initSearch = function () {
        autocomplete.searchFormInit()
        // loop through all the possible search forms on the page
        /* eslint-disable no-unary */
        for (let i = 0; i < autocomplete.propertySearchForms.length; i++) {
            // add a unique id to the form
            const _propertySearchForm = autocomplete.propertySearchForms[i]
            _propertySearchForm.id = `property-search-form-${i}`
            // assign the input field within the form responsible for the autocomplete
            const _propertySearchInput = _propertySearchForm.querySelector(
                '[name=development_name]'
            )
            // assign this form as the one being used when the input field is selected
            _propertySearchInput.addEventListener('focus', function () {
                autocomplete.autocompleteForm = this.form
            })
        }

        /**
         * Handle autocomplete pick list close buttons
         */
        autocomplete.autoCompletePickClose.forEach((el) => {
            el.addEventListener('click', (event) => {
                event.preventDefault()
                autocomplete.autoCompletePick.style.display = 'none'
            })
        })

        /**
         * Handle ENTER keypress on development field
         */
        document
            .querySelector('[name=development_name]')
            .addEventListener('keypress', function (event) {
                if (event.keyCode === 13 && this.form) {
                    // this is the input[name=HomeSearch]
                    // Will only have a value if a suggestion from input[name=development_name] has been selected
                    const searchValue = autocomplete.propertySearchInput[0].value

                    // test if field HomeSearch has value
                    if (typeof searchValue === 'undefined') {
                        event.preventDefault()
                        // console.log('open suggestions modal')
                        // open modal
                        autocomplete.displayPlacePredictionsModal()
                    } else {
                        // input[name=HomeSearch] complete seems to be deprecated
                        // this condition would never happen
                    }
                    if (event.srcElement.value.length > 0) {
                        const searchString = event.srcElement.value
                        autocomplete.triggerSearch(searchString)
                    }
                }
            })

        /**
         * Instantiate google services
         */
        autocomplete.autocompleteservice = new google.maps.places.AutocompleteService()
        autocomplete.placesservice = new google.maps.places.PlacesService(
            document.createElement('div')
        )

        const searchForms = Array.from(document.querySelectorAll('.js-development-search-form'))

        searchForms.forEach((searchForm) => {
            const searchFormInput = searchForm.querySelector('.js-search-input')

            searchFormInput.addEventListener('keyup', (event) => {
                if (event.srcElement.value.length > 0) {
                    const searchString = event.srcElement.value

                    autocomplete.triggerSearch(searchString, searchForm)
                }
            })

            const ownershipTypeSelect = searchForm.querySelector('.js-dev-search-ownership-type')
            //TODO: check these slectors still match whats in the filter selects
            const ownershipTypeFields = () => {
                if (!ownershipTypeSelect) return

                const ownershipTypeVal = ownershipTypeSelect.value
                const salePriceField = searchForm.querySelector('.js-sale-price-field')
                const rentalPriceField = searchForm.querySelector('.js-rental-price-field')

                switch (ownershipTypeVal) {
                    case 'rent':
                        if (salePriceField) {
                            salePriceField.classList.add('-hide')
                            const saleSelect = salePriceField.querySelector('select')
                            if (saleSelect) saleSelect.value = ''
                        }
                        if (rentalPriceField) rentalPriceField.classList.remove('-hide')
                        break
                    case 'buy':
                    case 'resale':
                        if (rentalPriceField) {
                            rentalPriceField.classList.add('-hide')
                            const rentalSelect = rentalPriceField.querySelector('select')
                            if (rentalSelect) rentalSelect.value = ''
                        }
                        if (salePriceField) salePriceField.classList.remove('-hide')
                        break
                    default:
                        if (salePriceField) salePriceField.classList.remove('-hide')
                        if (rentalPriceField) rentalPriceField.classList.remove('-hide')
                }
            }

            ownershipTypeFields()

            if (ownershipTypeSelect) {
                ownershipTypeSelect.addEventListener('change', ownershipTypeFields)
            }
        })

        autocomplete.triggerSearch = function (inputPlace, searchForm) {
            autocomplete.autocompleteservice.getPlacePredictions(
                {
                    input: inputPlace,
                    componentRestrictions: autocomplete.autoCompleteComponentRestrictions,
                },
                async (aObjPlaces) => {
                    // console.log(inputPlace)

                    const allPlaces = await searchResultsCustom(inputPlace)

                    console.log(aObjPlaces)

                    let template = ''
                    let templateUl = ''

                    if (aObjPlaces === null) {
                        template +=
                            '<li class="pac-item" role="option" aria-posinset="" aria-setsize="5" aria-selected="false" tabindex="-1">' +
                            '<span class="pac-item-query js-place-select">No results</span>' +
                            '</li>'
                        templateUl +=
                            '<li class="pac-item" role="option" aria-posinset="" aria-setsize="5" aria-selected="false" tabindex="-1">' +
                            '<span class="pac-item-query js-place-select">No results</span>' +
                            '</li>'
                    } else {
                        aObjPlaces = aObjPlaces.concat(allPlaces)

                        template +=
                            '<li class="pac-item" role="option" aria-posinset="" aria-setsize="5" aria-selected="false" tabindex="0">' +
                            '<small>Suggested locations</small>' +
                            '</li>'

                        aObjPlaces.forEach((Place) => {
                            if (Place !== undefined) {
                                template +=
                                    `<li class="pac-item" role="option" aria-posinset="" aria-setsize="5" aria-selected="false" tabindex="0">` +
                                    `<span class="pac-item-query js-place-select">${Place.description}</span>` +
                                    `</li>`
                                templateUl +=
                                    `<li class="pac-item" role="option" aria-posinset="" aria-setsize="5" aria-selected="false" tabindex="0">` +
                                    `<span class="pac-item-query js-place-select -in-modal">${Place.description}</span>` +
                                    `</li>`
                            }
                        })

                        templateUl += '</ul></li>'
                    }

                    if (debug) console.log('googlePlaces: searchForm', searchForm)

                    const suggestionBox = searchForm?.querySelector('#suggestionBox')

                    if (debug) console.log('googlePlaces: suggestionBox...', suggestionBox)

                    const propertySearchInput = searchForm.querySelectorAll(
                        '[name=development_name]'
                    )

                    console.log('propertySearchInput', propertySearchInput)

                    if (inputPlace.length > 3) {
                        suggestionBox.style.display = 'block'
                        suggestionBox.classList.remove('sr-only')
                        suggestionBox.innerHTML = template
                    }

                    // START SUGGESTIONS MODAL - TO BE TRIGGERED ON ENTER OR SEARCH SUBMIT

                    const ulModalSuggestion = document.getElementById('popover')

                    if (aObjPlaces === null) {
                        if (debug) console.log('googlePlaces: suggestionBox: aObjPlaces NULL')
                        ulModalSuggestion.querySelector(
                            '.js-suggestions-popover-results'
                        ).innerHTML = templateUl
                        autocomplete.autoCompletePick.classList.remove('-no-results')

                        propertySearchInput[0].addEventListener('keypress', (event) => {
                            if (event.keyCode === 13) {
                                event.preventDefault()
                                event.stopPropagation()
                                if ('showPopover' in HTMLElement.prototype) {
                                    console.log('showPopover supported')
                                    ulModalSuggestion.showPopover()
                                } else {
                                    ulModalSuggestion.classList.remove('-hide-popover')
                                }
                                ulModalSuggestion.focus()
                            }
                        })
                    } else {
                        if (debug) console.log('googlePlaces: suggestionBox: aObjPlaces NOT NULL')
                        autocomplete.autoCompletePick.classList.add('-no-results')
                        ulModalSuggestion.querySelector(
                            '.js-suggestions-popover-results'
                        ).innerHTML = templateUl
                        propertySearchInput[0].addEventListener('keypress', (event) => {
                            if (event.keyCode === 13) {
                                event.preventDefault()
                                event.stopPropagation()
                                if ('showPopover' in HTMLElement.prototype) {
                                    console.log('showPopover supported')
                                    ulModalSuggestion.showPopover()
                                } else {
                                    ulModalSuggestion.classList.remove('-hide-popover')
                                }
                                ulModalSuggestion.focus()
                            }
                        })
                    }

                    ulModalSuggestion
                        .querySelector('.js-suggestions-popover-results')
                        .addEventListener('click', (event) => {
                            if (event.target.closest('.pac-item')) {
                                setTimeout(() => {
                                    if ('hidePopover' in HTMLElement.prototype) {
                                        console.log('showPopover supported')
                                        ulModalSuggestion.hidePopover()
                                    } else {
                                        ulModalSuggestion.classList.add('-hide-popover')
                                    }
                                    suggestionBox.style.display = 'none'
                                    suggestionBox.classList.add('sr-only')
                                }, 200)
                            }
                        })

                    const popoverClose = ulModalSuggestion.querySelector('.js-popover__close')
                    if (popoverClose) {
                        popoverClose.addEventListener('click', (event) => {
                            if ('hidePopover' in HTMLElement.prototype) {
                                console.log('showPopover supported')
                                ulModalSuggestion.hidePopover()
                            } else {
                                ulModalSuggestion.classList.add('-hide-popover')
                            }
                        })
                    }

                    // END SUGGESTIONS MODAL - TO BE TRIGGERED ON ENTER OR SEARCH SUBMIT

                    // bind onclick event
                    const placeSelect = document.querySelectorAll('.js-place-select')
                    placeSelect.forEach((placeSelectClick) => {
                        if (!placeSelectClick.classList.contains('js-place-link')) {
                            placeSelectClick.addEventListener('click', (e) => {
                                e.preventDefault()
                                propertySearchInput[0].value = placeSelectClick.innerText
                                suggestionBox.style.display = 'none'
                                suggestionBox.classList.add('sr-only')
                                if (placeSelectClick.classList.contains('-in-modal')) {
                                    autocomplete.autoCompletePick.style.display = 'none'
                                }

                                // lookup coordinates based on input field address
                                let geocoder
                                geocoder = new google.maps.Geocoder()
                                geocoder.geocode(
                                    { address: placeSelectClick.innerText },
                                    (results, status) => {
                                        if (status === 'OK') {
                                            const position = results[0].geometry.location
                                            if (position.lat() && position.lng()) {
                                                autocomplete.propertySearchForms[0].querySelector(
                                                    '[name=Lat]'
                                                ).value = position.lat()
                                                autocomplete.propertySearchForms[0].querySelector(
                                                    '[name=Lng]'
                                                ).value = position.lng()
                                            } else {
                                                // not a place
                                            }
                                        } else {
                                            console.log(
                                                `Geocode was not successful for the following reason: ${status}`
                                            )
                                        }
                                    }
                                )
                            })
                        }
                    })
                    document.onclick = function (e) {
                        if (e.target.id !== 'suggestionBox') {
                            // autocomplete.suggestionBox.style.display = 'none'
                            suggestionBox.style.display = 'none'
                            suggestionBox.classList.add('sr-only')
                        }
                    }

                    const searchBoxWidth = propertySearchInput[0].offsetWidth
                    suggestionBox.style.width = `${searchBoxWidth}px`
                    // }
                }
            )

            async function searchResultsCustom(searchTerm) {
                const arrReturn = []
                try {
                    return arrReturn
                } catch (err) {
                    console.log('Error', err)
                }
            }
        }

        navigatorGeolocation(autocomplete)
    }

    autocomplete.searchFormInit = function () {
        // add the submit event searchFormSubmit to the form
        for (let i = 0; i < autocomplete.propertySearchForms.length; i++) {
            autocomplete.propertySearchForms[i].addEventListener(
                'submit',
                autocomplete.searchFormSubmit
            )
        }
    }

    autocomplete.searchFormSubmit = function (e) {
        e.preventDefault()
        // form should've been defined in initSearch()
        if (typeof autocomplete.autocompleteForm === 'undefined') {
            // console.log('form undefined')
        } else if (autocomplete.autocompleteForm === null) {
            autocomplete.autocompleteForm = this
        }
        // this is the full form
        const _propertySearchForm = autocomplete.autocompleteForm

        // this is from where we get our search keyword
        const _propertySearchInput = _propertySearchForm.querySelector('[name=development_name]')
        console.log('searchFormSubmit', _propertySearchInput.value)

        // stop form submission if no value in input
        if (!_propertySearchInput.value.trim()) {
            _propertySearchInput.focus()
            return
        }

        // check for value of input and hidden lat/lng filled by on click event in autocomplete
        if (
            _propertySearchInput.value &&
            autocomplete.latField.value &&
            autocomplete.lngField.value
        ) {
            _propertySearchInput.classList.remove('-error')
            formActionUrl(_propertySearchForm)
            _propertySearchForm.submit()
        } else if (
            _propertySearchInput.value === '' &&
            autocomplete.latField.value === '' &&
            autocomplete.lngField.value === ''
        ) {
            formActionUrl(_propertySearchForm)
            _propertySearchForm.submit()
        } else {
            // if all empty, submit anyway and bring all unfiltered / results
            const searchValue = autocomplete.postcodeRegex.test(_propertySearchInput.value)
                ? `${_propertySearchInput.value} `
                : _propertySearchInput.value

            let order = 0
            autocomplete.autoCompletePickList.innerHTML = ''
            // We'll have to use a setInterval checker function to work out when we've done all of our individual autoCompleteService lookups...
            autocomplete.autoCompleteSearchCheck = 0
            autocomplete.autoCompleteSearchCheckResultsCount = 0
            autocomplete.autoCompleteSearchCheckID = setInterval(() => {
                if (
                    autocomplete.autoCompleteSearchCheck >=
                    autocomplete.autoCompleteServiceTypes.length
                ) {
                    clearInterval(autocomplete.autoCompleteSearchCheckID)
                    autocomplete.autoCompleteSearchCheck = 0
                    autocomplete.displayPlacePredictionsModal() // Actually show the modal now that we've finished all our searches.
                }
            }, 1)
            autocomplete.autoCompleteServiceTypes.forEach((predictType) => {
                autocomplete.getPlacePredictionsByType(searchValue, predictType, order)
                order++
            })
        }
    }

    autocomplete.getPlacePredictionsByType = function (_input, _type, _order) {
        autocomplete.autocompleteservice.getPlacePredictions(
            {
                input: _input,
                componentRestrictions: autocomplete.autoCompleteComponentRestrictions,
                types: [_type],
            },
            (predictions, status, _propertySearchForm, _propertySearchInput) => {
                autocomplete.autoCompleteSearchCheck++ // Increment the search check counter...
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    // autocomplete.displayPlacePredictionsByType(predictions, _type, _order)
                }
            }
        )
    }

    // This actually handles showing the predictions modal - We hold off showing it until the asynchronous prediction calls have finished.
    autocomplete.displayPlacePredictionsModal = function () {
        autocomplete.autoCompletePick.style.display = 'block'
        autocomplete.autocompleteForm.querySelector('[name=development_name]').blur()
        autocomplete.autoCompleteSearchCheckResultsCount = 0
    }
    initSearch()
}
accessibleAutosuggestionDropdown()
export default googlePlacesAPIAutocomplete
