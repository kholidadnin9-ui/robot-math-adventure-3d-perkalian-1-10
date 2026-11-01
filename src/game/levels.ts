export type ThemeKey = "city" | "forest" | "tunnel" | "tech" | "galaxy";

export interface LevelPalette {
  sky: string;
  fog: string;
  ground: string;
  track: string;
  trackAlt: string;
  accent: string;
  accentSoft: string;
  glow: string;
  prop: string;
  propAlt: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  shortName: string;
  theme: ThemeKey;
  themeLabel: string;
  description: string;
  focus: string;
  tables: number[];
  timer: number;
  speed: number;
  difficulty: string;
  icon: "building" | "trees" | "tunnel" | "cpu" | "rocket";
  colors: LevelPalette;
  missions: string[];
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Pemula",
    shortName: "Kota Robot",
    theme: "city",
    themeLabel: "Kota Robot",
    description:
      "Mulai perjalananmu di kota penuh robot ramah. Kenali cara kerja perkalian sambil mengumpulkan koin emas.",
    focus: "Perkalian 1, 2, dan 3",
    tables: [1, 2, 3],
    timer: 8,
    speed: 0.78,
    difficulty: "Santai",
    icon: "building",
    colors: {
      sky: "#0a1730",
      fog: "#102447",
      ground: "#122b4d",
      track: "#1d3b62",
      trackAlt: "#274e7c",
      accent: "#59d8ff",
      accentSoft: "#a8efff",
      glow: "#ffd45c",
      prop: "#31597f",
      propAlt: "#f2ae45",
    },
    missions: ["Kenali soal perkalian", "Pilih gerbang yang tepat", "Kumpulkan 3 nyawa"],
  },
  {
    id: 2,
    name: "Petualang",
    shortName: "Hutan Energi",
    theme: "forest",
    themeLabel: "Hutan Energi",
    description:
      "Lintasan berubah menjadi hutan bercahaya. Perkalian makin seru dengan daun energi dan kristal hijau.",
    focus: "Perkalian 2, 3, 4, dan 5",
    tables: [2, 3, 4, 5],
    timer: 7.4,
    speed: 0.95,
    difficulty: "Mulai seru",
    icon: "trees",
    colors: {
      sky: "#071e25",
      fog: "#0d3631",
      ground: "#103b33",
      track: "#195a4b",
      trackAlt: "#22705a",
      accent: "#79f2b2",
      accentSoft: "#c4ffe0",
      glow: "#ffd45c",
      prop: "#2f7a5d",
      propAlt: "#b6ff76",
    },
    missions: ["Hitung dengan teliti", "Gunakan pola perkalian", "Jaga jawaban tetap tepat"],
  },
  {
    id: 3,
    name: "Penjelajah",
    shortName: "Terowongan Angka",
    theme: "tunnel",
    themeLabel: "Terowongan Angka",
    description:
      "Masuk ke terowongan cahaya penuh angka. Kecepatan bertambah, tetapi setiap gerbang masih bisa kamu pilih.",
    focus: "Perkalian 4, 5, 6, dan 7",
    tables: [4, 5, 6, 7],
    timer: 6.8,
    speed: 1.08,
    difficulty: "Butuh fokus",
    icon: "tunnel",
    colors: {
      sky: "#0e0a2a",
      fog: "#21134a",
      ground: "#1b1443",
      track: "#31236b",
      trackAlt: "#44308b",
      accent: "#c29bff",
      accentSoft: "#eadcff",
      glow: "#5ef2ff",
      prop: "#533a94",
      propAlt: "#5ef2ff",
    },
    missions: ["Kenali tabel 4–7", "Perhatikan posisi gerbang", "Latih kecepatan berhitung"],
  },
  {
    id: 4,
    name: "Ahli Matematika",
    shortName: "Kota Teknologi",
    theme: "tech",
    themeLabel: "Kota Teknologi",
    description:
      "Menara neon dan drone mengiringi perjalananmu. Taklukkan perkalian besar dengan strategi yang tepat.",
    focus: "Perkalian 6, 7, 8, dan 9",
    tables: [6, 7, 8, 9],
    timer: 6.2,
    speed: 1.22,
    difficulty: "Menantang",
    icon: "cpu",
    colors: {
      sky: "#061a2e",
      fog: "#0c2b46",
      ground: "#0d3550",
      track: "#155a78",
      trackAlt: "#1b7394",
      accent: "#45f0ff",
      accentSoft: "#c5fbff",
      glow: "#ffb84d",
      prop: "#1d617f",
      propAlt: "#5df2ff",
    },
    missions: ["Kuasai tabel 6–9", "Tetap tenang saat cepat", "Raih skor tertinggi"],
  },
  {
    id: 5,
    name: "Master Perkalian",
    shortName: "Galaksi Robot",
    theme: "galaxy",
    themeLabel: "Galaksi Robot",
    description:
      "Petualangan terakhir di antara bintang. Semua tabel 1–10 bercampur dalam tantangan paling seru.",
    focus: "Perkalian 1–10 lengkap",
    tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    timer: 5.8,
    speed: 1.35,
    difficulty: "Master",
    icon: "rocket",
    colors: {
      sky: "#0b0721",
      fog: "#1b0f3e",
      ground: "#1b1140",
      track: "#3b2674",
      trackAlt: "#56379b",
      accent: "#ff8de0",
      accentSoft: "#ffd6f5",
      glow: "#ffdd66",
      prop: "#5a3a9c",
      propAlt: "#8de8ff",
    },
    missions: ["Campur semua tabel 1–10", "Pertahankan combo terbaik", "Jadilah Master Perkalian"],
  },
];

export const getLevel = (id: number): LevelConfig =>
  LEVELS.find((level) => level.id === id) ?? LEVELS[0];
