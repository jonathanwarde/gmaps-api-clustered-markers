const devListMap = document.getElementById('dev-list-map')
const debug = true
const importMapsModule = () => {
    if (debug) console.log('importMapsModule ...')
    import(/* webpackChunkName: "developmentsMapBlock" */ '../developmentsMapBlock')
        .then((module) => {
            module.default()
        })
        .catch((error) => {
            console.error('Error loading google maps, error')
        })
}

const loadGoogleMapsAPI = () =>
    new Promise((resolve, reject) => {
        if (!document.getElementById('googleAPIJS')) {
            const script = document.createElement('script')
            script.id = 'googleAPIJS'
            /* eslint-disable no-undef */
            script.src = `https://maps.googleapis.com/maps/api/js?key=${googleAPIKey}&libraries=places`
            script.async = true
            script.onload = () => resolve()
            script.onerror = (error) => reject(error)
            document.body.appendChild(script)
        } else {
            resolve()
        }
    })

const observerOptions = {
    root: null,
    rootMargin: '100px', // before in viewport
    threshold: 0,
}
/* eslint-disable no-shadow */
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            loadGoogleMapsAPI()
                .then(() => {
                    if (debug) console.log('Google Maps API loaded')
                    importMapsModule()
                })
                .catch((error) => {
                    console.error('Error loading Google Maps API:', error)
                })
            observer.unobserve(devListMap)
        }
    })
}, observerOptions)

observer.observe(devListMap)
