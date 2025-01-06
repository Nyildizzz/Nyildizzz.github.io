document.addEventListener('DOMContentLoaded', () => {
    const cities = document.querySelectorAll('.city');
    const cityNameElement = document.getElementById('hoveredCityName');
    
    cities.forEach(city => {
        // Tıklama olayı
        city.addEventListener('click', (e) => {
            const cityName = e.currentTarget.getAttribute('data-iladi');
            
            // Yeni bir flag ekleyelim - haritadan seçim yapıldığını belirtmek için
            localStorage.setItem('citySelectedFromMap', 'true');
            localStorage.setItem('selectedCity', cityName);
            
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            window.location.href = `${basePath}/anasayfa.html`;
        });

        // Hover olayları aynı kalacak
        city.addEventListener('mouseenter', (e) => {
            const cityName = e.currentTarget.getAttribute('data-iladi');
            cityNameElement.textContent = cityName;
            cityNameElement.classList.add('visible');
        });

        city.addEventListener('mouseleave', () => {
            cityNameElement.classList.remove('visible');
        });
    });
});
