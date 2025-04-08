import '../../scss/blocks/_developments-map-block.scss'

import { MarkerClusterer } from '@googlemaps/markerclusterer'
import Mustache from 'mustache'

import {
    markerSVGBuyRent,
    markerSVGBuyRentHover,
    markerSVGNormal,
    markerSVGRegisterInterest,
    markerSVGRegisterInterestHover,
    markerSVGRental,
    markerSVGRentalHover,
} from './maps/gmap-marker'
import { mapStyle } from './maps/gmap-style'

const developmentsMap = () => {
    console.log('developmentsMap...')

    let mustacheTemplateForInfoBox
    const sitePath = document.location.host === 'lifestory.local' ? '/pegasus' : ''
    const mapWrap = document.querySelector('.google-map')
    const infoBox = document.querySelector('.js-map-infobox')
    const infoBoxCloseBtn = document.querySelector('.js-close-infobox')
    let infoBoxState = 'closed'
    const isSingleDevelopmentPage = !!document.documentElement.classList.contains(
        'ss-developmentpage'
    )
    let curDevelopmentLat
    let curDevelopmentLng
    let filteredByLocation = false
    const singleDevelopmentZoomLevel = 10
    const filteredByLocationZoomLevel = 8
    const markerFilters = {}
    const mq = window.matchMedia('(max-width: 700px)')

    const checkIfCardHasBanner = () => {
        const banner = infoBox.querySelector('.js-map-infobox-banner')
        if (banner) {
            infoBox.classList.add('-banner')
            infoBoxCloseBtn.classList.add('-banner')
        } else {
            infoBox.classList.remove('-banner')
            infoBoxCloseBtn.classList.remove('-banner')
        }
    }

    const getLatLngFromURL = () => {
        const params = new URLSearchParams(window.location.search)
        const lat = params.get('Lat')
        const lng = params.get('Lng')
        return { lat: parseFloat(lat), lng: parseFloat(lng) }
    }

    const searchIsFilteredByLocation = getLatLngFromURL()
    filteredByLocation =
        !Number.isNaN(searchIsFilteredByLocation.lat) &&
        !Number.isNaN(searchIsFilteredByLocation.lng)

    const loadTemplate = () =>
        fetch(`${sitePath}/developments-map-infobox-template/`)
            .then((response) => response.text())
            .then((templateData) => {
                mustacheTemplateForInfoBox = templateData
            })

    const modifyContent = (item) => {
        const displayDiv = document.querySelector('.js-map-content')
        const renderedMapMarkerInfoBox = Mustache.render(mustacheTemplateForInfoBox, item)
        displayDiv.innerHTML = renderedMapMarkerInfoBox
    }

    const setInfoBoxOpenedState = () => {
        if (infoBoxState === 'open') {
            mapWrap.classList.add('-infobox-open')
            infoBox.classList.add('-show')
            checkIfCardHasBanner()
        } else {
            mapWrap.classList.remove('-infobox-open')
            infoBox.classList.remove('-show')
        }
    }

    const closeInfoBoxListener = () => {
        infoBoxCloseBtn.addEventListener('click', () => {
            console.log('closeInfoBoxListener clicked')
            infoBoxState = 'closed'
            setInfoBoxOpenedState()
        })
    }

    document.getElementById('dev-list-map').addEventListener('click', (e) => {
        if (e.target.tagName === 'DIV') {
            console.log('closeDevListMap clicked')
            infoBoxState = 'closed'
            setInfoBoxOpenedState()
        }
    })

    const markers = [] // Keep track of all markers
    let activeMarker = null // Store the currently active marker

    const markerSVGRegisterInterestEncoded = encodeURIComponent(markerSVGRegisterInterest)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22')
    const markerSVGRegisterInterestHoverEncoded = encodeURIComponent(markerSVGRegisterInterestHover)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22')
    const markerSVGRentalEncoded = encodeURIComponent(markerSVGRental)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22')
    const markerSVGRentalHoverEncoded = encodeURIComponent(markerSVGRentalHover)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22')
    const markerSVGBuyRentEncoded = encodeURIComponent(markerSVGBuyRent)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22')
    const markerSVGBuyRentHoverEncoded = encodeURIComponent(markerSVGBuyRentHover)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22')
    const markerSVGNormalEncoded = encodeURIComponent(markerSVGNormal)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22')

    const markerRegisterInterest = {
        url: `data:image/svg+xml;utf8,${markerSVGRegisterInterestEncoded}`,
        /* eslint-disable no-undef */
        scaledSize: new google.maps.Size(50, 50),
        /* eslint-disable no-undef */
        anchor: new google.maps.Point(25, 25),
    }

    const markerRegisterInterestHover = {
        url: `data:image/svg+xml;utf8,${markerSVGRegisterInterestHoverEncoded}`,
        /* eslint-disable no-undef */
        scaledSize: new google.maps.Size(50, 50),
        /* eslint-disable no-undef */
        anchor: new google.maps.Point(25, 25),
    }

    const markerRental = {
        url: `data:image/svg+xml;utf8,${markerSVGRentalEncoded}`,
        /* eslint-disable no-undef */
        scaledSize: new google.maps.Size(50, 50),
        /* eslint-disable no-undef */
        anchor: new google.maps.Point(25, 25),
    }

    const markerRentalHover = {
        url: `data:image/svg+xml;utf8,${markerSVGRentalHoverEncoded}`,
        /* eslint-disable no-undef */
        scaledSize: new google.maps.Size(50, 50),
        /* eslint-disable no-undef */
        anchor: new google.maps.Point(25, 25),
    }

    const markerBuyRent = {
        url: `data:image/svg+xml;utf8,${markerSVGBuyRentEncoded}`,
        /* eslint-disable no-undef */
        scaledSize: new google.maps.Size(50, 50),
        /* eslint-disable no-undef */
        anchor: new google.maps.Point(25, 25),
    }

    const markerBuyRentHover = {
        url: `data:image/svg+xml;utf8,${markerSVGBuyRentHoverEncoded}`,
        /* eslint-disable no-undef */
        scaledSize: new google.maps.Size(50, 50),
        /* eslint-disable no-undef */
        anchor: new google.maps.Point(25, 25),
    }

    const markerNormal = {
        url: `data:image/svg+xml;utf8,${markerSVGNormalEncoded}`,
        /* eslint-disable no-undef */
        scaledSize: new google.maps.Size(50, 50),
        /* eslint-disable no-undef */
        anchor: new google.maps.Point(25, 25),
    }

    const getStatusMarker = (value) => {
        const statusToMarkerMap = {
            RegisterInterest: markerRegisterInterest,
            RentOnly: markerRental,
            BuyAndRent: markerBuyRent,
            Normal: markerNormal,
        }

        return statusToMarkerMap[value]
    }

    const getStatusMarkerHover = (value) => {
        const statusToMarkerMap = {
            RegisterInterest: markerRegisterInterestHover,
            RentOnly: markerRentalHover,
            BuyAndRent: markerBuyRentHover,
        }

        return statusToMarkerMap[value]
    }

    const setActiveMarker = (newActiveMarker) => {
        // Reset the icon of the previously active marker
        if (activeMarker && activeMarker !== newActiveMarker) {
            const status = activeMarker.customStatus
            activeMarker.setIcon(getStatusMarker(status))
        }

        // Update the icon of the new active marker
        // newActiveMarker.setIcon(markerHover)
        activeMarker = newActiveMarker
    }

    const updateMapCenterAndZoom = (map, center, zoomLevel) => {
        map.setCenter(center)
        map.setZoom(zoomLevel)
    }

    const updateMarkerVisibility = () => {
        console.log('updateMarkerVisibility called ', markerFilters)

        markers.forEach((marker) => {
            console.log('marker.customStatus', marker.customStatus)
            const shouldBeVisible = markerFilters[marker.customStatus] === true
            marker.setVisible(shouldBeVisible)
        })
    }

    const scrollDevelopmentToView = (id) => {
        const development = document.getElementById(`development-${id}`)
        if (development) {
            development.scrollIntoView({ behavior: 'instant' })
        }
    }

    const grabSingleDevelopmentObjectFromJSONArrayOfAllDevelopments = (devData, lat, lng) =>
        Object.values(devData).find((item) => item.Lat === lat && item.Lng === lng)

    const createMarkers = (data, map) => {
        /* eslint-disable no-undef */
        const bounds = new google.maps.LatLngBounds()

        if (isSingleDevelopmentPage) {
            const mapContainer = document.getElementById('dev-list-map')
            curDevelopmentLat = mapContainer.getAttribute('data-lat')
            curDevelopmentLng = mapContainer.getAttribute('data-lng')
            const targetDevelopment = grabSingleDevelopmentObjectFromJSONArrayOfAllDevelopments(
                data,
                curDevelopmentLat,
                curDevelopmentLng
            )
            data = { singleDevelopment: targetDevelopment }
        }

        if (
            !Number.isNaN(searchIsFilteredByLocation.lat) &&
            !Number.isNaN(searchIsFilteredByLocation.lng)
        ) {
            console.log(
                `Latitude: ${searchIsFilteredByLocation.lat}, Longitude: ${searchIsFilteredByLocation.lng}`
            )
            filteredByLocation = true
        }

        Object.values(data).forEach((item) => {
            /* eslint-disable no-undef */
            const position = new google.maps.LatLng(parseFloat(item.Lat), parseFloat(item.Lng))

            if (!filteredByLocation) {
                bounds.extend(position)
            }

            // TODO: get map marker type from item.Status

            /* eslint-disable no-undef */
            const marker = new google.maps.Marker({
                position,
                map,
                icon: getStatusMarker(item.Status),
            })

            marker.customStatus = item.Status
            // marker.customID = `development${item.ID}`

            // Store the marker in the markers array
            markers.push(marker)

            marker.addListener('click', () => {
                setActiveMarker(marker)
                modifyContent(item)
                infoBoxState = 'open'
                setInfoBoxOpenedState()
                scrollDevelopmentToView(item.ID)

                console.log('marker filters? ', markerFilters)
            })

            marker.addListener('mouseover', () => {
                marker.setIcon(getStatusMarkerHover(marker.customStatus))
            })

            marker.addListener('mouseout', () => {
                if (marker !== activeMarker) {
                    marker.setIcon(getStatusMarker(marker.customStatus))
                }
            })
        })

        if (!filteredByLocation) {
            map.fitBounds(bounds)
        } else {
            setTimeout(() => {
                map.setZoom(filteredByLocationZoomLevel)
            }, 300)
        }

        if (isSingleDevelopmentPage) {
            setTimeout(() => {
                map.setZoom(singleDevelopmentZoomLevel)
            }, 300)
        }
    }

    /* eslint-disable no-shadow */
    const markerClusters = (map, markers) => {
        const markerCluster = new MarkerClusterer({
            map,
            markers,
            renderer: {
                render: ({ markers, _position: position }) =>
                    new google.maps.Marker({
                        position: {
                            lat: position.lat(),
                            lng: position.lng(),
                        },
                        label: {
                            text: String(markers.length),
                            color: 'white',
                        },
                        icon: getStatusMarker('Normal'),
                    }),
            },
        })
    }

    const fetchJSONData = (map) => {
        fetch(`${sitePath}/api/developments-json/`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                return response.json()
            })
            .then((data) => {
                console.log('Data received:', data) // Log the data to see what it is
                createMarkers(data, map)
                markerClusters(map, markers)
            })
            .catch((e) => {
                console.error(
                    'Error fetching developments from endpoint /api/developments-json/',
                    e
                )
            })
    }

    const initMap = () => {
        loadTemplate().then(() => {
            // TODO: determine the center of the map based on the markers
            let mapCenter = { lat: 51.56742843962218, lng: -0.13079828715721828 }
            let zoomLevel = 16

            if (filteredByLocation) {
                mapCenter = {
                    lat: searchIsFilteredByLocation.lat,
                    lng: searchIsFilteredByLocation.lng,
                }
                zoomLevel = filteredByLocationZoomLevel
            } else if (isSingleDevelopmentPage) {
                mapCenter = {
                    lat: parseFloat(curDevelopmentLat),
                    lng: parseFloat(curDevelopmentLng),
                }
                zoomLevel = singleDevelopmentZoomLevel
            }

            const mapOptions = {
                zoom: zoomLevel,
                center: mapCenter,
                styles: mapStyle,
                // gestureHandling: 'cooperative',
                // scrollwheel: true,
                streetViewControl: false,
                overviewMapControl: false,
            }

            // if (mq.matches) {
            mapOptions.zoomControlOptions = {
                position: google.maps.ControlPosition.RIGHT_CENTER,
            }
            // }

            /* eslint-disable no-undef */
            const map = new google.maps.Map(document.getElementById('dev-list-map'), mapOptions)
            google.maps.event.addListenerOnce(map, 'idle', () => {
                fetchJSONData(map)

                if (filteredByLocation) {
                    console.log('filteredByLocation', filteredByLocation)
                    setTimeout(() => {
                        map.setZoom(filteredByLocationZoomLevel)
                    }, 300)
                }
            })
            closeInfoBoxListener()
        })
    }

    const mapMarkerFilters = () => {
        const mapFilters = document.querySelector('.js-map-filters')

        if (mapFilters) {
            mapFilters.addEventListener('change', (event) => {
                if (event.target.type === 'checkbox') {
                    const checkboxes = mapFilters.querySelectorAll('input[type="checkbox"]')
                    checkboxes.forEach((checkbox) => {
                        markerFilters[checkbox.name] = checkbox.checked
                    })
                    updateMarkerVisibility()
                }
            })
        }
    }

    initMap()
    mapMarkerFilters(markerFilters)
}

export default developmentsMap
