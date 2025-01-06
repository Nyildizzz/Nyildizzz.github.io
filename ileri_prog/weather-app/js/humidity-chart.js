class HumidityChart {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.data = [];
        this.setupCanvas();
    }

    setupCanvas() {
        const container = document.getElementById('humidity-chart');
        container.appendChild(this.canvas);
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.draw();
    }

    setData(data) {
        // Son 24 saatlik nem verilerini al
        this.data = data.list.slice(0, 8).map(item => ({
            humidity: item.main.humidity,
            time: new Date(item.dt * 1000).getHours(),
            date: new Date(item.dt * 1000)
        }));
        this.draw();
    }

    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Canvas'ı temizle
        ctx.clearRect(0, 0, width, height);
        if (this.data.length === 0) return;

        // Gradient arka plan - Yeşil tonları
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, 'rgba(76, 175, 80, 0.1)');  // Açık yeşil
        gradient.addColorStop(1, 'rgba(76, 175, 80, 0.3)');  // Koyu yeşil

        // Padding ve ölçeklendirme
        const padding = 40;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);

        // Izgara çizgileri
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Yatay ızgara ve nem değerleri
        for (let i = 0; i <= 4; i++) {
            const y = padding + (i * (graphHeight / 4));
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            
            const humidityValue = 100 - (i * 25); // 100%'den 0%'e
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '12px Arial';
            ctx.fillText(`${humidityValue}%`, 5, y + 4);
        }
        ctx.stroke();

        // Noktaları hesapla
        const points = this.data.map((d, i) => ({
            x: padding + (i * (graphWidth / (this.data.length - 1))),
            y: height - (padding + (d.humidity / 100 * graphHeight))
        }));

        // Gradient alan
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding);
        points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.lineTo(points[points.length - 1].x, height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Çizgi - Yeşil ton
        ctx.beginPath();
        ctx.strokeStyle = '#4CAF50';  // Ana yeşil renk
        ctx.lineWidth = 3;
        points.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // Noktalar ve değerler
        points.forEach((point, i) => {
            // Nokta
            ctx.beginPath();
            ctx.fillStyle = '#ffffff';
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Saat
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '12px Arial';
            ctx.fillText(
                `${this.data[i].time}:00`,
                point.x - 15,
                height - 10
            );

            // Nem değeri - Background ile
            const value = `${this.data[i].humidity}%`;
            const textWidth = ctx.measureText(value).width;
            
            // Arka plan dikdörtgeni
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(
                point.x - (textWidth / 2) - 4,
                point.y - 25,
                textWidth + 8,
                20
            );
            
            // Nem değeri metni
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(
                value,
                point.x - (textWidth / 2),
                point.y - 12
            );
        });

        // Su damlası ikonları sadece yüksek nem değerlerinde
        points.forEach((point, i) => {
            const humidity = this.data[i].humidity;
            if (humidity > 75) { // Eşik değerini 75'e yükselttik
                this.drawDroplet(ctx, point.x - 5, point.y - 35, '#4CAF50');
            }
        });
    }

    // Su damlası ikonu çizimi
    drawDroplet(ctx, x, y, color) {
        ctx.beginPath();
        ctx.moveTo(x + 5, y);
        ctx.bezierCurveTo(x + 5, y - 4, x + 9, y - 4, x + 9, y);
        ctx.bezierCurveTo(x + 9, y + 4, x + 5, y + 8, x + 5, y + 8);
        ctx.bezierCurveTo(x + 5, y + 8, x + 1, y + 4, x + 1, y);
        ctx.bezierCurveTo(x + 1, y - 4, x + 5, y - 4, x + 5, y);
        ctx.fillStyle = color;
        ctx.fill();
    }
}

// Grafiği başlat
document.addEventListener('DOMContentLoaded', () => {
    const humidityChart = new HumidityChart();
    
    // API'den gelen verileri grafiğe aktar
    window.addEventListener('weatherDataUpdated', (e) => {
        if (e.detail && e.detail.list) {
            humidityChart.setData(e.detail);
        }
    });
}); 