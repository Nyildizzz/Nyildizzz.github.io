class TemperatureGraph {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.data = [];
        this.setupCanvas();
    }

    setupCanvas() {
        const container = document.getElementById('temperature-graph');
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
        // Son 24 saatlik veriyi al
        this.data = data.list.slice(0, 8).map(item => ({
            temp: Math.round(item.main.temp),
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

        // Gradient arka plan
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, 'rgba(92, 156, 229, 0.1)');
        gradient.addColorStop(1, 'rgba(92, 156, 229, 0.3)');

        // Padding ve ölçeklendirme
        const padding = 40;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);

        // Sıcaklık aralığını bul
        const temps = this.data.map(d => d.temp);
        const minTemp = Math.min(...temps) - 2;
        const maxTemp = Math.max(...temps) + 2;
        const tempRange = maxTemp - minTemp;

        // Noktaları hesapla
        const points = this.data.map((d, i) => ({
            x: padding + (i * (graphWidth / (this.data.length - 1))),
            y: height - (padding + ((d.temp - minTemp) / tempRange) * graphHeight)
        }));

        // Izgara çizgileri
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Yatay ızgara
        for (let i = 0; i <= 4; i++) {
            const y = padding + (i * (graphHeight / 4));
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            
            // Sıcaklık değerleri
            const temp = Math.round(maxTemp - (i * (tempRange / 4)));
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '12px Arial';
            ctx.fillText(`${temp}°C`, 5, y + 4);
        }
        ctx.stroke();

        // Gradient alan
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding);
        points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.lineTo(points[points.length - 1].x, height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Çizgi
        ctx.beginPath();
        ctx.strokeStyle = '#5c9ce5';
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

            // Sıcaklık
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(
                `${this.data[i].temp}°`,
                point.x - 10,
                point.y - 15
            );
        });
    }
}

// Grafiği başlat
document.addEventListener('DOMContentLoaded', () => {
    const graph = new TemperatureGraph();
    
    // API'den gelen verileri grafiğe aktar
    window.addEventListener('weatherDataUpdated', (e) => {
        if (e.detail && e.detail.list) {
            graph.setData(e.detail);
        }
    });
});