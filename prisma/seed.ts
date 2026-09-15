import { PrismaClient, UserRole, VideoStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const curatedFilms = [
  {
    title: 'Tears of Steel',
    slug: 'tears-of-steel',
    originalTitle: 'Project Mango',
    director: 'Ian Hubert',
    studio: 'Blender VFX Institute • Amsterdam',
    year: '2024 Remaster',
    duration: '12:14',
    aspectRatio: '2.39:1 Scope',
    audioFormat: 'Dolby Digital 5.1 Surround',
    colorGrade: 'ACES / Cyberpunk Desaturated Cyan',
    colorPalette: ['#172554', '#0f766e', '#d97706', '#334155', '#020617'],
    synopsis: 'Berlatar di distopia masa depan di Amsterdam, sekelompok ilmuwan dan pejuang gerilya berusaha mementaskan kembali rekaman emosional masa lalu untuk menenangkan kecerdasan robot raksasa penghancur peradaban.',
    curatorQuote: '“Eksplorasi fiksi ilmiah yang memadukan kerapuhan romansa manusia di bawah bayang-bayang dentuman logam mesin mekanis.”',
    awards: ['Koleksi Khusus Arsip Sinema Terbuka', 'Official Selection SIGGRAPH', '4K Master Edition'],
    mood: 'dystopia',
    moodLabel: 'Distopia & Rekayasa',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=90',
    poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=700&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    isFeatured: true,
    tags: ['Sci-Fi', 'VFX', 'Cyberpunk', 'Blender'],
    chapters: [
      { id: 'tos-1', title: 'Babak I: Pertemuan di Kanal Oude Kerk', timestamp: '00:00', seconds: 0, description: 'Thom dan Celia bertukar sinyal purwarupa di bawah guyuran hujan kota tua Amsterdam.' },
      { id: 'tos-2', title: 'Babak II: Kalibrasi Memori Emosional', timestamp: '03:15', seconds: 195, description: 'Para pejuang gerilya merekonstruksi ilusi kenangan romansa masa lalu.' },
      { id: 'tos-3', title: 'Babak III: Invasi Unit Mekanis Raksasa', timestamp: '06:40', seconds: 400, description: 'Robot raksasa berkaki baja merangsek menembus kubah pertahanan katedral.' },
      { id: 'tos-4', title: 'Babak IV: Rekonsiliasi & Fajar Baru', timestamp: '09:50', seconds: 590, description: 'Keputusan krusial Thom untuk melepas dendam masa lalu demi menyelamatkan sisa peradaban.' },
    ],
  },
  {
    title: 'Sprite Fight',
    slug: 'sprite-fight',
    originalTitle: 'English Countryside Mayhem',
    director: 'Matthew Luhn',
    studio: 'Blender Studio • London Unit',
    year: '2023',
    duration: '10:24',
    aspectRatio: '2.35:1 Anamorphic',
    audioFormat: 'Discrete 5.1 Surround',
    colorGrade: 'Rich Autumn Foliage & Horror Contrast',
    colorPalette: ['#451a03', '#78350f', '#15803d', '#b91c1c', '#0c0a09'],
    synopsis: 'Ketika lima remaja bertualang ke hutan terpencil di pedesaan Inggris tahun 80-an, mereka berhadapan dengan makhluk hutan bertubuh mungil yang ternyata haus darah dan tak berbelas kasihan.',
    curatorQuote: '“Pemberian hormat yang nakal dan berani terhadap film horor komedi dekade 80-an dengan timing komedi gerak tingkat tinggi.”',
    awards: ['Festival Animasi Annecy - Official Selection', 'Best Indie Horror Comedy Short'],
    mood: 'adrenalin',
    moodLabel: 'Adrenalin & Ketegangan',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&auto=format&fit=crop&q=90',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=700&auto=format&fit=crop&q=85',
    videoUrl: 'https://files.vidstack.io/sprite-fight/hls/stream.m3u8',
    isFeatured: false,
    tags: ['Action', 'Horror-Comedy', 'Animation'],
    chapters: [
      { id: 'sf-1', title: 'Babak I: Ketibaan di Hutan Keramat Blackwood', timestamp: '00:00', seconds: 0, description: 'Lima remaja berkemah tanpa menyadari kehadiran penjaga rimba kuno.' },
      { id: 'sf-2', title: 'Babak II: Penampakan Sprite Bersayap', timestamp: '02:40', seconds: 160, description: 'Makhluk mungil lucu yang seketika berubah wujud menjadi predator buas.' },
      { id: 'sf-3', title: 'Babak III: Perang Gerilya di Semak Belukar', timestamp: '05:30', seconds: 330, description: 'Aksi kejar-kejaran seru menggunakan peralatan kemah sederhana.' },
      { id: 'sf-4', title: 'Babak IV: Jebakan Lumpur & Pelarian Pamungkas', timestamp: '08:15', seconds: 495, description: 'Usaha terakhir untuk melarikan diri dari kepungan kawanan sprite.' },
    ],
  },
  {
    title: 'Cosmos Laundromat',
    slug: 'cosmos-laundromat',
    originalTitle: 'First Cycle: Franck & Victor',
    director: 'Mathieu Auvray',
    studio: 'Blender Animation Film Foundation',
    year: '2023 4K',
    duration: '12:08',
    aspectRatio: '2.39:1 Panavision',
    audioFormat: 'Binaural / Dolby Atmos Bed',
    colorGrade: 'Desolate Monochromatic to Hyper-Color',
    colorPalette: ['#3f3f46', '#e4e4e7', '#f43f5e', '#6366f1', '#18181b'],
    synopsis: 'Di sebuah tebing pulau terasing yang suram, seekor domba depresi bernama Franck bertemu dengan Victor—penjual misterius yang menawarinya pintu gerbang ke ribuan reinkarnasi kehidupan baru di semesta paralel.',
    curatorQuote: '“Penceritaan surealis eksistensial yang menantang batas teknis render rambut dan pencahayaan atmosferik.”',
    awards: ['Pemenang Jury Award Animago', 'Best Visual Design Ottawa Animation Festival'],
    mood: 'kontemplatif',
    moodLabel: 'Kontemplatif & Filosofis',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=90',
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    isFeatured: false,
    tags: ['Surreal', 'Philosophy', 'Sci-Fi'],
    chapters: [
      { id: 'cl-1', title: 'Babak I: Keputusasaan di Tepi Jurang Karang', timestamp: '00:00', seconds: 0, description: 'Franck sang domba menatap kehampaan samudra abu-abu yang tak bertepi.' },
      { id: 'cl-2', title: 'Babak II: Victor & Tawaran Mesin Cuci Semesta', timestamp: '03:10', seconds: 190, description: 'Sosok flamboyan berkoper kuno memperkenalkan kontrak pergantian hidup.' },
      { id: 'cl-3', title: 'Babak III: Ledakan Dimensi & Tubuh Ulat Bulu', timestamp: '06:50', seconds: 410, description: 'Perjalanan psikedelik menembus pusaran warna dan hukum fisika baru.' },
      { id: 'cl-4', title: 'Babak IV: Takdir Siklus Pertama', timestamp: '09:40', seconds: 580, description: 'Kesadaran eksistensial tentang siklus reinkarnasi kosmik yang tak berujung.' },
    ],
  },
  {
    title: 'Sintel: The Dragon Huntress',
    slug: 'sintel',
    originalTitle: 'Project Durian',
    director: 'Colin Levy',
    studio: 'Blender Creative Arts',
    year: '2022 Remaster',
    duration: '15:10',
    aspectRatio: '1.85:1 Academy Flat',
    audioFormat: 'Dolby 5.1 Cinematic Mix',
    colorGrade: 'Desert Ochre & Frozen Glacial Cyan',
    colorPalette: ['#7c2d12', '#ea580c', '#0891b2', '#f59e0b', '#1c1917'],
    synopsis: 'Perjalanan penuh luka seorang pengembara wanita melintasi gurun tandus dan pegunungan es beku demi menyelamatkan seekor bayi naga yang menjadi satu-satunya ikatan emosional dalam hidupnya.',
    curatorQuote: '“Tragedi naratif yang menohok dengan klimaks yang merobek perasaan penonton tentang arti pengorbanan.”',
    awards: ['Koleksi Master Sinema Terbuka', 'Best Epic Fantasy Narrative'],
    mood: 'adrenalin',
    moodLabel: 'Adrenalin & Petualangan',
    backdrop: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&auto=format&fit=crop&q=90',
    poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&auto=format&fit=crop&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    isFeatured: false,
    tags: ['Fantasy', 'Adventure', 'Dragon'],
    chapters: [
      { id: 'sin-1', title: 'Babak I: Menemukan Scales di Lorong Kumuh', timestamp: '00:00', seconds: 0, description: 'Sintel merawat sayap terluka seekor bayi naga yang menjadi sahabat sejatinya.' },
      { id: 'sin-2', title: 'Babak II: Penculikan & Penjelajahan Gurun Ishtar', timestamp: '04:10', seconds: 250, description: 'Scales diculik naga dewasa; Sintel memulai pencarian panjang tanpa menyerah.' },
      { id: 'sin-3', title: 'Babak III: Badai Salju di Gerbang Puncak Beku', timestamp: '08:30', seconds: 510, description: 'Pertarungan hidup mati melawan bandit gunung dan dingin yang membekukan darah.' },
      { id: 'sin-4', title: 'Babak IV: Penebusan Tragis di Sarang Naga', timestamp: '12:00', seconds: 720, description: 'Klimaks yang menghancurkan hati ketika waktu telah mengubah segalanya.' },
    ],
  },
  {
    title: 'Big Buck Bunny',
    slug: 'big-buck-bunny',
    originalTitle: 'A Peach Open Movie',
    director: 'Sacha Goedegebure',
    studio: 'Peach Project Studios',
    year: '2024 HDR',
    duration: '09:56',
    aspectRatio: '1.78:1 HD Widescreen',
    audioFormat: 'Uncompressed Stereo / 5.1 PCM',
    colorGrade: 'Vibrant Daylight & Saturated Forest Green',
    colorPalette: ['#14532d', '#15803d', '#84cc16', '#eab308', '#052e16'],
    synopsis: 'Kisah seekor kelinci bertubuh raksasa berhati damai yang akhirnya merancang perangkap mekanis jenius untuk membalas keisengan kelompok hewan pengerat jahil di hutan.',
    curatorQuote: '“Tonggak sejarah perfilman open source dunia yang mendefinisikan standar animasi 3D modern tanpa batas lisensi komersial.”',
    awards: ['Koleksi Legenda Sinema Independen', 'Pionir Standar Pengujian 4K Dunia'],
    mood: 'animasi',
    moodLabel: 'Visual Puisi & Animasi',
    backdrop: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1920&auto=format&fit=crop&q=90',
    poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=700&auto=format&fit=crop&q=85',
    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    isFeatured: false,
    tags: ['Animation', 'Comedy', 'Nature'],
    chapters: [
      { id: 'bbb-1', title: 'Babak I: Pagi Damai Bersama Kupu-Kupu', timestamp: '00:00', seconds: 0, description: 'Bunny menikmati semilir angin hutan musim semi yang tenang.' },
      { id: 'bbb-2', title: 'Babak II: Serangan Buah Busuk Frank & Teman-Teman', timestamp: '02:30', seconds: 150, description: 'Tiga bajing nakal melempari apel dan merusak keindahan rimba.' },
      { id: 'bbb-3', title: 'Babak III: Perakitan Ketapel & Katrol Mekanis', timestamp: '05:15', seconds: 315, description: 'Bunny menyusun cetak biru perangkap cerdik menggunakan dahan lentur.' },
      { id: 'bbb-4', title: 'Babak IV: Pembalasan Manis Sang Kelinci Raksasa', timestamp: '07:40', seconds: 460, description: 'Pemberian pelajaran berharga dengan akrobat udara yang menggelitik tawa.' },
    ],
  },
];

async function main() {
  console.log('🌱 Starting database seeding with chapters...');

  // 1. Create Curator / Admin User
  const hashedPassword = await bcrypt.hash('curator123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'curator@watchr.cinema' },
    update: {},
    create: {
      name: 'Watchr Curator Guild',
      email: 'curator@watchr.cinema',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log(`👤 User ready: ${user.email} (${user.id})`);

  // 2. Insert Curated Films with Chapters
  for (const film of curatedFilms) {
    await prisma.video.upsert({
      where: { slug: film.slug },
      update: {
        title: film.title,
        originalTitle: film.originalTitle,
        director: film.director,
        studio: film.studio,
        year: film.year,
        duration: film.duration,
        aspectRatio: film.aspectRatio,
        audioFormat: film.audioFormat,
        colorGrade: film.colorGrade,
        colorPalette: film.colorPalette,
        description: film.synopsis,
        curatorQuote: film.curatorQuote,
        awards: film.awards,
        mood: film.mood,
        moodLabel: film.moodLabel,
        backdrop: film.backdrop,
        poster: film.poster,
        videoUrl: film.videoUrl,
        thumbnailUrl: film.backdrop,
        isFeatured: film.isFeatured,
        tags: film.tags,
        status: VideoStatus.PUBLISHED,
        chapters: film.chapters,
      },
      create: {
        title: film.title,
        slug: film.slug,
        originalTitle: film.originalTitle,
        director: film.director,
        studio: film.studio,
        year: film.year,
        duration: film.duration,
        aspectRatio: film.aspectRatio,
        audioFormat: film.audioFormat,
        colorGrade: film.colorGrade,
        colorPalette: film.colorPalette,
        description: film.synopsis,
        curatorQuote: film.curatorQuote,
        awards: film.awards,
        mood: film.mood,
        moodLabel: film.moodLabel,
        backdrop: film.backdrop,
        poster: film.poster,
        videoUrl: film.videoUrl,
        thumbnailUrl: film.backdrop,
        isFeatured: film.isFeatured,
        tags: film.tags,
        status: VideoStatus.PUBLISHED,
        userId: user.id,
        chapters: film.chapters,
      },
    });
    console.log(`🎬 Film synced: ${film.title} (${film.chapters.length} chapters)`);
  }

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
