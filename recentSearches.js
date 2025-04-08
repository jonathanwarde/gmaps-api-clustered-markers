const suggestionBox = document.getElementById('suggestionBox')
const localPath = window.location.host === 'lifestory.local' ? '/pegasus' : ''

export const setLocalStorage = (newSearch) => {
    const storedSearches = localStorage.getItem('recentSearches')
    let searches = storedSearches ? JSON.parse(storedSearches) : []

    if (!Array.isArray(searches)) {
        searches = []
    }

    // NOTE: only 10 searches at a time!
    if (searches.length > 10) {
        searches.shift()
    }

    // chnage object to array
    const newSearchEntry = Object.entries(newSearch)[0]

    const searchExists = searches.some(
        ([location, query]) => location === newSearchEntry[0] && query === newSearchEntry[1]
    )

    if (!searchExists) {
        searches.push(newSearchEntry)
    }
    localStorage.setItem('recentSearches', JSON.stringify(searches))
}

export const checkLocalStorage = () => {
    const storedSearches = localStorage.getItem('recentSearches')
    if (storedSearches) {
        console.log('recentSearches: found in localStorage', storedSearches)
        return JSON.parse(storedSearches)
    }
    return {}
}

export const getSearchedDevelopment = () => {
    console.log('getSearchedDevelopment')
    const queryString = window.location.search
    if (queryString) {
        const urlParams = new URLSearchParams(queryString)
        const developmentName = urlParams.get('development_name')
        const lat = urlParams.get('Lat')
        const lng = urlParams.get('Lng')
        // lets not bother with the rest of the params for now - just get the dev name, lat and lng

        if (developmentName && lat && lng) {
            const newQueryString = `development_name=${encodeURIComponent(
                developmentName
            )}&Lat=${lat}&Lng=${lng}&ownership-type=&sale-price=&rental-price=#search-target`

            console.log('dev name: ', { [developmentName]: newQueryString })

            return { [developmentName]: newQueryString }
        }

        return null
    }
    return null
}

export const addSavedSearchesToFormAsLinks = (searches) => {
    if (searches && Array.isArray(searches)) {
        const prevSearches = searches.map(
            ([
                location,
                query,
            ]) => `<li class="pac-item" role="option" aria-setsize="5" aria-selected="false" tabindex="0">
                <a href="https://${
                    window.location.host + localPath
                }/our-developments/?${query}">${location}</a>
                </li>`
        )

        const label = `<li class="pac-item" role="option" aria-setsize="5" aria-selected="false" tabindex="0">
                        <small>Recent Searches</small></li>`

        prevSearches.unshift(label)
        suggestionBox.innerHTML = prevSearches?.join('')
        suggestionBox.style = 'display: block;'
        suggestionBox.classList.remove('sr-only')
    }
}

if (suggestionBox) {
    document.addEventListener('click', (e) => {
        const isSuggestionBox = suggestionBox.contains(e.target)
        const isSearchInput =
            e.target.classList.contains('js-search-input') || e.target.closest('.js-search-input')
        if (suggestionBox && !isSuggestionBox && !isSearchInput) {
            suggestionBox.style = null
            suggestionBox.classList.add('sr-only')
        }
    })
}
