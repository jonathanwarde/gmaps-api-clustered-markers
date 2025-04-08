/**
 * Allow keyboard nvigation from search form input to the google places API dropdown and recent searches dropdown
 */
export const accessibleAutosuggestionDropdown = () => {
    const searchInput = document.querySelector('.js-search-input')
    const suggestionBox = document.getElementById('suggestionBox')

    const focusFirstItem = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            const firstItem = suggestionBox.querySelector('.pac-item')
            if (firstItem) {
                firstItem.focus()
            }
        }
    }

    const handlePacItemKeydown = (event) => {
        const pacItems = Array.from(suggestionBox.querySelectorAll('.pac-item'))
        const currentIndex = pacItems.indexOf(event.target)
        /* eslint-disable default-case */
        switch (event.key) {
            // TODO: handle 'Escape' key here??
            case 'ArrowDown':
                event.preventDefault()
                if (currentIndex < pacItems.length - 1) {
                    pacItems[currentIndex + 1].focus()
                }
                break
            case 'ArrowUp':
                event.preventDefault()
                if (currentIndex > 0) {
                    pacItems[currentIndex - 1].focus()
                }
                break
            case 'Enter':
                /* eslint-disable no-case-declarations */
                const link = event.target.querySelector('a')
                if (link) {
                    window.location.href = link.href
                }
                break
        }
    }

    suggestionBox.addEventListener('keydown', (event) => {
        if (event.target.classList.contains('pac-item')) {
            handlePacItemKeydown(event)
        }
    })

    searchInput.addEventListener('keydown', focusFirstItem)
}
export default accessibleAutosuggestionDropdown
