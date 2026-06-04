// 1. Inisialisasi peta dengan tambahan fitur Double Tap Drag Zoom
var map = L.map('map', {
    doubleTapDragZoom: true, // Mengaktifkan fitur zoom satu jari
    doubleTapDragZoomOptions: {
        reverse: false // 'false' berarti geser bawah untuk zoom in, geser atas untuk zoom out (standar map)
    }
}).setView([-7.8159, 110.9256], 13);

// 2. Tambahkan layer peta OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

var marker, circle;
var statusText = document.getElementById('status');

// Flag (penanda) agar kamera peta hanya fokus di awal saja
var isFirstZoom = true; 

// 3. Konfigurasi akurasi GPS
var gpsOptions = {
    enableHighAccuracy: true, 
    timeout: 10000,           
    maximumAge: 0             
};

// 4. Fungsi saat lokasi terdeteksi/update
function onLocationFound(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var accuracy = position.coords.accuracy;

    statusText.innerHTML = "GPS Aktif (Akurasi: " + Math.round(accuracy) + " meter)";

    if (!marker) {
        // Jika marker BELUM ada (deteksi pertama), buat markernya
        marker = L.marker([lat, lng]).addTo(map);
        circle = L.circle([lat, lng], { radius: accuracy, color: 'blue', fillOpacity: 0.2 }).addTo(map);
    } else {
        // Jika marker SUDAH ada, cukup update koordinatnya saja (tanpa hapus-buat ulang)
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        circle.setRadius(accuracy);
    }

    // 5. Cek apakah ini pencarian lokasi yang pertama kali
    if (isFirstZoom) {
        map.setView([lat, lng], 17); // Fokuskan kamera ke lokasi user
        isFirstZoom = false;         // Ubah penanda jadi 'false' agar baris ini tidak dijalankan lagi
    }
}

// Fungsi jika gagal mendapat lokasi
function onLocationError(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    statusText.innerHTML = "Gagal mengakses GPS. Pastikan izin lokasi aktif.";
    statusText.style.color = "red";
}

// 6. Jalankan pemantauan (Watch) GPS Real-Time
if (!navigator.geolocation) {
    statusText.innerHTML = "Browser kamu tidak mendukung fitur GPS.";
} else {
    navigator.geolocation.watchPosition(onLocationFound, onLocationError, gpsOptions);
}
