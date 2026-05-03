# 🏆 Dünya Kupası 2026 — Web Uygulaması Planı

> **Amaç:** 2026 FIFA Dünya Kupası'nı canlı takip edebileceğin, fiksür, puan tablosu, takım kadroları, istatistikler ve eleme tablosunu görebileceğin tam kapsamlı bir web uygulaması.
>
> **Deploy:** VPS üzerinde Docker Compose ile multi-container (Frontend, Backend, DB, Cache) mimarisinde çalışacak.

---

## 📐 Sistem Mimarisi

Dış API'lere bağımlılığı minimize eden, hızlı ve ölçeklenebilir bir mimari. Frontend sadece bizim kendi backend'imizle konuşur. Backend arka planda verileri toplayıp veritabanına ve önbelleğe yazar.

```text
┌──────────────────────────────────────────────────────────────┐
│                        KULLANICI                             │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP/REST
┌──────────────────────────────▼───────────────────────────────┐
│                        FRONTEND                              │
│             Next.js 15 (React, TypeScript)                   │
│      Sadece kendi backend'imizden veri çeker, UI sunar       │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP/REST
┌──────────────────────────────▼───────────────────────────────┐
│                        BACKEND                               │
│              Node.js + Express (TypeScript)                  │
│                                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐  │
│  │   API Sunucu    │ │  Data Aggregator│ │ Cron/Workers   │  │
│  │ (İstemciye veri │ │(Veri birleştirme│ │(Periyodik fetch│  │
│  │    sunar)       │ │ ve normalizasyon│ │  ve senkronize)│  │
│  └───────┬─────────┘ └────────┬────────┘ └────────┬───────┘  │
└──────────┼────────────────────┼───────────────────┼──────────┘
           │                    │                   │
     ┌─────▼─────┐        ┌─────▼─────┐       ┌─────▼──────────┐
     │   REDIS   │        │ POSTGRESQL│       │ DIŞ API'LER    │
     │(Canlı skor,        │ (Takımlar,        │ 1. football-data│
     │ anlık veri)        │ Fiksür, Stadlar,  │ 2. API-Football │
     │           │        │ İstatistikler)    │ 3. openfootball │
     └───────────┘        └───────────┘       └────────────────┘
```

---

## ⚙️ Backend & Veri Senkronizasyon Stratejisi

Backend, dış API'lerin limitlerine takılmamak ve uygulamanın hızını maksimize etmek için verileri kendi üzerinde tutar.

### 1. Veri Kaynakları ve Kullanım Amaçları

*   **football-data.org (v4):** Ana fiksür, temel skorlar, gruplar ve puan durumu. (Birincil kaynak)
*   **API-Football v3 (RapidAPI):** Kadrolar, detaylı maç istatistikleri (şut, korner vb.), asist ve kart istatistikleri, oyuncu detayları. (İkincil kaynak, zenginleştirici)
*   **openfootball (GitHub):** Statik turnuva ağacı, stadyum verileri, fallback fiksür. (Statik kaynak)

### 2. Akıllı API Senkronizasyon Stratejisi (Smart Polling)

API limitlerini aşmamak ve en güncel veriyi sunmak için "zamanlanmış cron" yerine **"maç saatine duyarlı (Event-driven) polling"** algoritması kullanılacak.

**API Limitlerimiz:**
*   `football-data.org`: 10 istek / dakika (Ana skor kaynağı)
*   `API-Football`: 100 istek / gün (Detaylı istatistik, çok kısıtlı!)

**Senkronizasyon Durum Makinesi:**

1.  **Boşta (Idle) Durumu - Maç Olmayan Zamanlar:**
    *   Sistem bir sonraki maçın ne zaman olduğunu DB'den bilir.
    *   **Günde 1 Kez:** `openfootball` ve `API-Football` üzerinden takımlar, kadrolar ve stadyumlar senkronize edilir (Maliyet: Günlük 1-2 istek).
    *   **6 Saatte 1 Kez:** `football-data.org` üzerinden genel fiksür kontrolü yapılır.

2.  **Maç Öncesi (Pre-Match) Durumu - Maça 1 Saat Kala:**
    *   `API-Football` üzerinden maçın **İlk 11'leri** (Lineups) çekilir. Maç başlayana kadar 15 dakikada bir kontrol edilir. (Maliyet: Maç başı ~2-3 istek).

3.  **CANLI (Live) Durumu - Maç Oynanırken:**
    *   **Canlı Skor (`football-data.org`):** Limitimiz yüksek (10/dk) olduğu için **her 30 saniyede bir** sadece devam eden maçların skoru çekilir ve hemen Redis'e atılır. (Maliyet: Dakikada 2 istek, limite çok uzak).
    *   **Canlı İstatistik & Olaylar (`API-Football`):** Günlük 100 istek limitimiz var. Günde ortalama 3-4 Dünya Kupası maçı oynandığını varsayarsak, maç başına ~25 istek hakkımız var. Bu yüzden maç istatistikleri ve kart/gol dakika olayları **her 5 dakikada bir** çekilir. (90 dk maç / 5 dk = 18 istek. Limit için çok güvenli).

4.  **Maç Sonu (Post-Match) Durumu - Maç Bittiğinde:**
    *   Maç bitiş düdüğünden sonra son bir kez `API-Football` tetiklenip kesinleşen istatistikler çekilir.
    *   `football-data.org` üzerinden güncel **Grup Puan Tablosu** ve **Gol Krallığı** listesi çekilip DB'ye yazılır.
    *   Sistem bir sonraki maça kadar tekrar "Boşta" durumuna geçer.

### 3. Veritabanı Şeması (PostgreSQL)

*   `teams`: Takım id, isim, bayrak_url, grup_id
*   `players`: Oyuncu id, isim, takim_id, pozisyon, forma_no, yas, fotograf_url
*   `matches`: Maç id, ev_sahibi_id, deplasman_id, tarih, saat, stadyum_id, durum (SCHEDULED, LIVE, FINISHED), skor_ev, skor_dep, round
*   `venues`: Stadyum id, isim, sehir, kapasite, fotograf_url
*   `groups`: Grup id, isim (A-L)
*   `standings`: takim_id, grup_id, oynanan, galibiyet, beraberlik, maglubiyet, atilan_gol, yenilen_gol, puan
*   `stats`: Oyuncu turnuva istatistikleri (gol, asist, sarı/kırmızı kart)

---

## 🖥️ Frontend Ekranları (Next.js)

Frontend sadece bizim `/api/v1/matches`, `/api/v1/standings` gibi kendi endpoint'lerimize istek atacak.

1.  **Ana Sayfa:** Hero banner, Turnuva geri sayımı, Bugünün Maçları (Redis'ten canlı veya DB'den günlük), Sonuçlar, Haberler/Öne Çıkanlar.
2.  **Gruplar:** 12 grubun (A-L) puan tabloları. Backend'den hesaplanmış haliyle gelir.
3.  **Fiksür:** Tarih ve aşamaya (Grup, Son 32, vb.) göre filtrelenebilir maç listesi.
4.  **Eleme Tablosu (Bracket):** Son 32'den Finale kadar görsel eşleşme ağacı.
5.  **Takımlar:** 48 takımın listesi ve detay sayfaları (Kadro, oynadığı maçlar).
6.  **İstatistikler:** Gol, Asist, Kart krallığı.
7.  **Stadyumlar:** 16 ev sahibi şehir ve stadyum detayları.
8.  **Maç Detay:** Canlı skor, gol dakikaları, kartlar, topla oynama yüzdeleri, ilk 11 dizilişleri.

---

## 🎨 Tasarım & UI/UX

*   **Tema:** Koyu tema ağırlıklı, modern UI (Koyu Lacivert `#0f172a`, Vurgular: Dünya Kupası Sarısı/Altını, Canlı maçlar için neon yeşil).
*   **Komponentler:** Glassmorphism efektli kartlar, iskelet (skeleton) yükleme ekranları.
*   **Kütüphaneler:** Tailwind CSS (Stilleme), Framer Motion (Animasyonlar), Lucide React (İkonlar).

---

## 🛠️ Teknik Stack Detayı

| Bileşen | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15, React, Tailwind CSS | Kullanıcı arayüzü, SSR/SSG avantajları |
| **Backend** | Node.js, Express, TypeScript | Kendi REST API'miz, veri toplayıcı |
| **Veritabanı** | PostgreSQL (Prisma ORM) | İlişkisel veri saklama |
| **Önbellek** | Redis | Canlı skor ve sık erişilen veriler için in-memory cache |
| **Görev Yönetimi**| node-cron veya BullMQ | Arka plan periyodik veri çekme işlemleri |
| **Altyapı** | Docker & Docker Compose | Tek tıkla tüm sistemi VPS üzerinde ayağa kaldırma |

---

## 📁 Dosya ve Proje Yapısı

```text
world-cup/
├── PLAN.md
├── docker-compose.yml
├── .env
│
├── backend/                  # NODE.JS + EXPRESS BACKEND
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma     # Veritabanı şeması
│   ├── src/
│   │   ├── index.ts          # Express sunucu başlangıcı
│   │   ├── routes/           # /api/matches, /api/teams vb.
│   │   ├── controllers/      # İstek işleyiciler
│   │   ├── services/         # İş mantığı (DB ve Redis işlemleri)
│   │   ├── aggregators/      # Dış API'lerden veri çeken servisler (football-data, api-football vb.)
│   │   ├── jobs/             # node-cron task'ları (saatlik veri çekimi vb.)
│   │   └── utils/
│   │
└── frontend/                 # NEXT.JS FRONTEND
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.ts
    ├── src/
    │   ├── app/              # Next.js App Router sayfaları (page.tsx, layout.tsx)
    │   ├── components/       # UI bileşenleri (Navbar, MatchCard, Bracket vb.)
    │   ├── hooks/            # SWR veya React Query ile backend'den veri çekme
    │   ├── lib/              # Utility fonksiyonları
    │   └── types/            # Ortak veri tipleri
```

---

## 🐳 Docker Compose Yapısı (VPS İçin)

Tüm sistemi tek bir `docker-compose up -d` ile ayağa kaldıracağız:

1.  `postgres`: Resmi PostgreSQL imajı (Veritabanı).
2.  `redis`: Resmi Redis imajı (Cache).
3.  `backend`: Express.js sunucumuz ve cron job'larımız (Node.js imajı tabanlı).
4.  `frontend`: Next.js uygulamamız (Node.js imajı tabanlı).

---

## 📋 Geliştirme Adımları (Milestones)

### Faz 1: Altyapı ve Veritabanı
1. Proje klasör yapısını kur (`frontend`, `backend`).
2. Docker ve `docker-compose.yml` dosyalarını oluştur (Postgres ve Redis servislerini ekle).
3. Backend'de Prisma kur ve veritabanı şemalarını (`teams`, `matches`, `groups` vb.) tasarla.

### Faz 2: Backend Veri Toplama (Aggregator & Cron)
1. Dış API'ler için (football-data, api-football) HTTP client'ları yaz.
2. İlk veritabanı "seed" işlemini yap (Takımları, stadyumları ve grupları DB'ye kaydet).
3. Fiksür ve maçları çekip DB'ye kaydeden fonksiyonları yaz.
4. Saatlik/Günlük çalışacak cron job'ları ayarla.

### Faz 3: Backend REST API
1. Frontend'in kullanacağı kendi API endpoint'lerimizi oluştur:
   - `GET /api/v1/matches`
   - `GET /api/v1/standings`
   - `GET /api/v1/teams/:id`
2. Redis entegrasyonunu yap (Özellikle `/matches/live` gibi sık çağrılacak endpoint'ler için).

### Faz 4: Frontend Temeli
1. Next.js kurulumunu tamamla, Tailwind CSS ayarlarını yap.
2. Layout, Navbar ve Footer oluştur.
3. Kendi backend'imizden verileri çekecek servis katmanını/hook'ları (`swr` veya `fetch`) yaz.

### Faz 5: Frontend Ekranları
1. Ana sayfa (Canlı skorlar, bugünün maçları).
2. Fiksür ve Grup Puan durumları.
3. Eleme Tablosu (Bracket) bileşeni.
4. Takım ve Maç detay sayfaları.

### Faz 6: Test ve Deployment
1. Sistemi lokalde Docker ile uçtan uca test et.
2. API limitlerini aşmadığımızı kontrol et (Cron job logları).
3. VPS sunucusuna dosyaları at ve `docker-compose up -d` ile canlıya al.

