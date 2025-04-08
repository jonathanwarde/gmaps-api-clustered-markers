

export const mapMarkerFilters = (markerFilters) => {
    const mapFilters = document.querySelector('.js-map-filters')

    if (mapFilters) {
        mapFilters.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                const checkboxValues = {}
                const checkboxes = mapFilters.querySelectorAll('input[type="checkbox"]')

                checkboxes.forEach((checkbox) => {
                    checkboxValues[checkbox.name] = checkbox.checked
                })

                console.log(checkboxValues)
                markerFilters = checkboxValues

                //THIS IS OUT OF SCOPE?
                updateMarkerVisibility();
            }
        })
    }
}

export default mapMarkerFilters
