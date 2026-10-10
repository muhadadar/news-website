const BASE_URL = "https://berita-indo-api-next.vercel.app/api/cnn-news"
const JUMLAH_PER_HALAMAN = 8

const elBerita = document.getElementById("berita")
const elHero = document.getElementById("hero")
const elPopuler = document.getElementById("populer")
const elTicker = document.getElementById("ticker")
const elPreloader = document.getElementById("preloader")
const elStatus = document.getElementById("status")
const elCari = document.getElementById("cari")
const elKategori = document.getElementById("kategori")
const elTema = document.getElementById("tema")
const elJudulSeksi = document.getElementById("judulSeksi")
const elJumlah = document.getElementById("jumlah")
const elMuatLagi = document.getElementById("muatLagi")

let semuaBerita = []
let hasilTampil = []
let tampilSampai = JUMLAH_PER_HALAMAN
let kategoriAktif = "terbaru"

const NAMA_KATEGORI = {
    terbaru: "Terbaru",
    nasional: "Nasional",
    internasional: "Internasional",
    ekonomi: "Ekonomi",
    olahraga: "Olahraga",
    teknologi: "Teknologi",
    hiburan: "Hiburan",
    "gaya-hidup": "Gaya Hidup"
}

/* ---------- Helper ---------- */
function escapeHTML(teks = "") {
    return String(teks)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function amankanLink(link = "") {
    return /^https?:\/\//i.test(link) ? link : "#"
}

function waktuLalu(tanggal) {
    const waktu = new Date(tanggal)
    if (isNaN(waktu)) return ""
    const detik = Math.floor((Date.now() - waktu) / 1000)
    if (detik < 60) return "Baru saja"
    if (detik < 3600) return `${Math.floor(detik / 60)} menit lalu`
    if (detik < 86400) return `${Math.floor(detik / 3600)} jam lalu`
    if (detik < 604800) return `${Math.floor(detik / 86400)} hari lalu`
    return waktu.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

function ambilGambar(item) {
    return item.image?.large || item.image?.small || ""
}

function ambilRingkas(item) {
    return item.contentSnippet || item.description || ""
}

function ambilWaktu(item) {
    return waktuLalu(item.isoDate || item.pubDate)
}

function labelKategori() {
    return escapeHTML(NAMA_KATEGORI[kategoriAktif] || "Berita")
}

function tampilkanStatus(pesan, tombolUlang = false) {
    elStatus.hidden = false
    elStatus.innerHTML = `<span>${escapeHTML(pesan)}</span>` +
        (tombolUlang ? `<br><button id="ulangi">Coba lagi</button>` : "")
    if (tombolUlang) {
        document.getElementById("ulangi").addEventListener("click", () => muatBerita(kategoriAktif))
    }
}

function sembunyikanStatus() {
    elStatus.hidden = true
    elStatus.innerHTML = ""
}

function tampilkanSkeleton() {
    elHero.hidden = false
    elHero.innerHTML = `<div class="skeleton hero-sk"></div><div class="hero-samping"><div class="skeleton"></div><div class="skeleton"></div></div>`
    elBerita.innerHTML = Array.from({ length: 4 }, () => `<div class="skeleton"></div>`).join("")
    elPopuler.innerHTML = ""
    elMuatLagi.hidden = true
}

function sembunyikanPreloader() {
    elPreloader.classList.add("hilang")
    setTimeout(() => (elPreloader.style.display = "none"), 400)
}

/* ---------- Render komponen ---------- */
function gambarHTML(item, alt) {
    const src = ambilGambar(item)
    return src
        ? `<img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" loading="lazy" onerror="this.style.display='none'">`
        : ""
}

function renderHero(daftar) {
    if (daftar.length === 0) {
        elHero.hidden = true
        elHero.innerHTML = ""
        return
    }

    const [utama, ...samping] = daftar
    const kecil = samping.slice(0, 2)
    const waktuUtama = ambilWaktu(utama)
    const ringkasUtama = ambilRingkas(utama)

    const htmlKecil = kecil.map((item, i) => `
        <article class="hero-kecil" style="animation-delay:${(i + 1) * 80}ms">
            ${gambarHTML(item, item.title)}
            <div class="hero-teks">
                <span class="label">${labelKategori()}</span>
                <h2>${escapeHTML(item.title)}</h2>
            </div>
            <a class="tautan-penuh" href="${escapeHTML(amankanLink(item.link))}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(item.title)}"></a>
        </article>`).join("")

    elHero.hidden = false
    elHero.innerHTML = `
        <article class="hero-utama">
            ${gambarHTML(utama, utama.title)}
            <div class="hero-teks">
                <span class="label">Berita Utama</span>
                <h2>${escapeHTML(utama.title)}</h2>
                ${ringkasUtama ? `<p>${escapeHTML(ringkasUtama)}</p>` : ""}
                ${waktuUtama ? `<span class="waktu">${escapeHTML(waktuUtama)}</span>` : ""}
            </div>
            <a class="tautan-penuh" href="${escapeHTML(amankanLink(utama.link))}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(utama.title)}"></a>
        </article>
        <div class="hero-samping">${htmlKecil}</div>`
}

function renderTicker(daftar) {
    const judul = daftar.slice(0, 10)
    elTicker.innerHTML = judul.map(item =>
        `<a href="${escapeHTML(amankanLink(item.link))}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.title)}</a>`
    ).join("")
}

function renderPopuler(daftar) {
    const item5 = daftar.slice(0, 5)
    elPopuler.innerHTML = item5.map((item, i) => {
        const waktu = ambilWaktu(item)
        return `
        <li style="animation-delay:${i * 60}ms">
            <span class="nomor">${i + 1}</span>
            <div>
                <a href="${escapeHTML(amankanLink(item.link))}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.title)}</a>
                ${waktu ? `<span class="waktu">${escapeHTML(waktu)}</span>` : ""}
            </div>
        </li>`
    }).join("")
}

function kartuHTML(item, i) {
    const ringkas = ambilRingkas(item)
    const waktu = ambilWaktu(item)
    const link = escapeHTML(amankanLink(item.link))
    const gambar = ambilGambar(item)

    return `
    <article style="animation-delay:${Math.min(i % JUMLAH_PER_HALAMAN, 12) * 40}ms">
        <a class="gambar" href="${link}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">
            ${gambar ? `<img src="${escapeHTML(item.image?.small || gambar)}" alt="${escapeHTML(item.title)}" loading="lazy" onerror="this.style.display='none'">` : ""}
        </a>
        <div class="isi">
            <div class="meta">
                <span class="label">${labelKategori()}</span>
                ${waktu ? `<span class="waktu">${escapeHTML(waktu)}</span>` : ""}
            </div>
            <h3><a href="${link}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.title)}</a></h3>
            ${ringkas ? `<p class="ringkas">${escapeHTML(ringkas)}</p>` : ""}
            <a class="baca" href="${link}" target="_blank" rel="noopener noreferrer">Baca selengkapnya →</a>
        </div>
    </article>`
}

function renderGrid() {
    const potong = hasilTampil.slice(0, tampilSampai)
    elBerita.innerHTML = potong.map(kartuHTML).join("")
    elMuatLagi.hidden = tampilSampai >= hasilTampil.length
    elJumlah.textContent = hasilTampil.length ? `${potong.length} dari ${hasilTampil.length} berita` : ""
}

/* ---------- Susun halaman ---------- */
function susunHalaman() {
    const kata = elCari.value.trim().toLowerCase()
    tampilSampai = JUMLAH_PER_HALAMAN

    if (kata) {
        // Mode pencarian: hero disembunyikan, tampilkan semua hasil di grid
        hasilTampil = semuaBerita.filter(b => (b.title || "").toLowerCase().includes(kata))
        elHero.hidden = true
        elHero.innerHTML = ""
        elJudulSeksi.textContent = `Hasil pencarian: "${elCari.value.trim()}"`

        if (hasilTampil.length === 0) {
            elBerita.innerHTML = ""
            elMuatLagi.hidden = true
            elJumlah.textContent = ""
            tampilkanStatus("Tidak ada berita yang cocok.")
            return
        }
    } else {
        // Mode normal: 3 berita pertama jadi headline, sisanya masuk grid
        const hero = semuaBerita.slice(0, 3)
        hasilTampil = semuaBerita.slice(3)
        renderHero(hero)
        elJudulSeksi.textContent = `Berita ${NAMA_KATEGORI[kategoriAktif] || ""}`.trim()

        if (semuaBerita.length === 0) {
            elBerita.innerHTML = ""
            elMuatLagi.hidden = true
            elJumlah.textContent = ""
            tampilkanStatus("Belum ada berita untuk kategori ini.")
            return
        }
    }

    sembunyikanStatus()
    renderGrid()
}

/* ---------- Ambil data ---------- */
async function muatBerita(kategori = "terbaru") {
    kategoriAktif = kategori
    sembunyikanStatus()
    tampilkanSkeleton()

    try {
        const respons = await fetch(`${BASE_URL}/${kategori}`)
        if (!respons.ok) throw new Error(`Status ${respons.status}`)

        const hasil = await respons.json()
        semuaBerita = Array.isArray(hasil.data) ? hasil.data : []
        renderTicker(semuaBerita)
        renderPopuler(semuaBerita.slice(3).length >= 5 ? semuaBerita.slice(3) : semuaBerita)
        susunHalaman()
    } catch (error) {
        console.error("Gagal memuat berita:", error)
        elHero.hidden = true
        elHero.innerHTML = ""
        elBerita.innerHTML = ""
        elMuatLagi.hidden = true
        tampilkanStatus("Gagal memuat berita. Periksa koneksi internet Anda.", true)
    } finally {
        sembunyikanPreloader()
    }
}

/* ---------- Event ---------- */
elKategori.addEventListener("click", e => {
    const tombol = e.target.closest("button[data-kategori]")
    if (!tombol) return

    elKategori.querySelectorAll("button").forEach(b => b.classList.remove("aktif"))
    tombol.classList.add("aktif")
    elCari.value = ""
    muatBerita(tombol.dataset.kategori)
})

elCari.addEventListener("input", susunHalaman)

elMuatLagi.addEventListener("click", () => {
    tampilSampai += JUMLAH_PER_HALAMAN
    renderGrid()
})

document.getElementById("logo").addEventListener("click", e => {
    e.preventDefault()
    elKategori.querySelector('[data-kategori="terbaru"]').click()
    window.scrollTo({ top: 0, behavior: "smooth" })
})

/* ---------- Tema gelap / terang ---------- */
function setTema(tema) {
    document.documentElement.setAttribute("data-theme", tema)
    elTema.textContent = tema === "dark" ? "☀️" : "🌙"
    try { localStorage.setItem("tema", tema) } catch (e) {}
}

elTema.addEventListener("click", () => {
    const sekarang = document.documentElement.getAttribute("data-theme")
    setTema(sekarang === "dark" ? "light" : "dark")
})

let temaTersimpan = null
try { temaTersimpan = localStorage.getItem("tema") } catch (e) {}
setTema(temaTersimpan || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"))

/* ---------- Mulai ---------- */
document.getElementById("tanggal").textContent = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
})
document.getElementById("tahun").textContent = new Date().getFullYear()

muatBerita("terbaru")
