/**
 * This grabs users current location and updates the input field with the address
 * @see https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding
 * @param googlePlacesAPIConfig
 * @returns {void}
 */
export const navigatorGeolocation = (googlePlacesAPIConfig) => {
    const useLocationCheckbox = document.getElementById('useLocation')
    if (!useLocationCheckbox) return
    useLocationCheckbox.addEventListener('change', () => {
        if (useLocationCheckbox.checked) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude } = position.coords
                        const { longitude } = position.coords
                        console.log(
                            'navigatorGeolocation: USERS CURRENT LOCATION ',
                            latitude,
                            longitude
                        )

                        googlePlacesAPIConfig.latField.value = latitude
                        googlePlacesAPIConfig.lngField.value = longitude

                        // TODO: reverse Geocoding location from users current lt and lng
                        /* eslint-disable no-undef */
                        const geocoder = new google.maps.Geocoder()
                        /* eslint-disable no-undef */
                        const latLng = new google.maps.LatLng(latitude, longitude)

                        console.log('navigatorGeolocation: geolocation ', geocoder)
                        geocoder.geocode({ location: latLng }, (results, status) => {
                            console.error('navigatorGeolocation: geoCode', results)
                            if (status === google.maps.GeocoderStatus.OK) {
                                if (results[0]) {
                                    console.error(
                                        'navigatorGeolocation: address ',
                                        results[0].formatted_address
                                    )
                                    // TODO: update the input field with the address
                                    googlePlacesAPIConfig.propertySearchInput[0].value =
                                        results[0].formatted_address
                                } else {
                                    console.error('navigatorGeolocation: No results !!')
                                }
                            } else {
                                console.log(
                                    `navigatorGeolocation: Geocoder failed due to: ${status}`
                                )
                            }
                        })
                    },
                    (error) => {
                        console.error(`Error Code = ${error.code} - ${error.message}`)
                    }
                )
            } else {
                console.error('Geolocation not suported ...')
            }
        }
    })
}
export default navigatorGeolocation
