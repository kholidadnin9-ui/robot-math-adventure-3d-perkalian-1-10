import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Coins,
  Heart,
  Keyboard,
  Lightbulb,
  MousePointerClick,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Volume2,
  X,
} from "lucide-react";

interface HelpModalProps {
  onClose: () => void;
  onStart?: () => void;
}

export default function HelpModal({ onClose, onStart }: HelpModalProps) {
  const [tab, setTab] = useState<"main" | "tips">("main");

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="help-title" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="modal-card max-h-[92dvh] overflow-y-auto no-scrollbar">
        <div className="relative overflow-hidden border-b border-white/[0.08] px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5">
          <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-electric/12 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 top-2 h-32 w-32 rounded-full bg-sun/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-electric">
                <BookOpen size={13} />
                Buku panduan penjelajah
              </div>
              <h2 id="help-title" className="mt-1.5 font-display text-2xl font-semibold text-white sm:text-[28px]">
                Cara Bermain & Belajar
              </h2>
              <p className="mt-1 text-[11px] font-semibold text-slate-400 sm:text-xs">
                Panduan singkat untuk Robo-Kid dan para penjelajah perkalian.
              </p>
            </div>
            <button type="button" className="icon-btn !h-9 !w-9 shrink-0" onClick={onClose} aria-label="Tutup petunjuk">
              <X size={17} />
            </button>
          </div>

          <div className="relative mt-4 flex gap-1 rounded-xl border border-white/[0.08] bg-night-950/45 p-1">
            <button
              type="button"
              onClick={() => setTab("main")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-extrabold transition ${
                tab === "main" ? "bg-white/[0.09] text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Target size={14} /> Cara Main
            </button>
            <button
              type="button"
              onClick={() => setTab("tips")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-extrabold transition ${
                tab === "tips" ? "bg-white/[0.09] text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Lightbulb size={14} /> Tips Matematika
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {tab === "main" ? (
            <div className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Baca soal",
                    body: "Perhatikan angka perkalian pada panel di atas layar. Hitung hasilnya dengan teliti.",
                    icon: <Sparkles size={17} />,
                  },
                  {
                    step: "02",
                    title: "Pilih gerbang",
                    body: "Ada tiga gerbang dengan angka berbeda. Arahkan robot ke gerbang dengan jawaban benar.",
                    icon: <MousePointerClick size={17} />,
                  },
                  {
                    step: "03",
                    title: "Kumpulkan bintang",
                    body: "Jawaban tepat memberi poin dan koin. Jawab 10 soal untuk menyelesaikan level.",
                    icon: <Target size={17} />,
                  },
                ].map((item) => (
                  <div key={item.step} className="panel-soft relative p-3">
                    <div className="flex items-center justify-between">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-electric/10 text-electric">{item.icon}</span>
                      <span className="font-display text-lg font-semibold text-white/15">{item.step}</span>
                    </div>
                    <div className="mt-2 font-display text-[13px] font-semibold text-white">{item.title}</div>
                    <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-400">{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
                <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Kontrol permainan</div>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5 rounded-lg bg-night-950/35 p-2.5">
                    <Keyboard size={18} className="mt-0.5 shrink-0 text-electric" />
                    <div>
                      <div className="text-[11px] font-extrabold text-white">Komputer</div>
                      <div className="mt-1 grid gap-1 text-[10px] font-semibold text-slate-400">
                        <span><Key>←</Key> <Key>A</Key> pindah ke jalur kiri</span>
                        <span><Key>→</Key> <Key>D</Key> pindah ke jalur kanan</span>
                        <span><Key>1</Key> <Key>2</Key> <Key>3</Key> pilih jalur jawaban</span>
                        <span><Key>Spasi</Key> atau <Key>Esc</Key> jeda permainan</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-lg bg-night-950/35 p-2.5">
                    <Smartphone size={18} className="mt-0.5 shrink-0 text-mint" />
                    <div>
                      <div className="text-[11px] font-extrabold text-white">HP / Tablet</div>
                      <div className="mt-1 space-y-1 text-[10px] font-semibold text-slate-400">
                        <div>Swipe robot ke kiri atau kanan.</div>
                        <div>Ketuk salah satu angka jawaban.</div>
                        <div>Gunakan tombol KIRI / KANAN di bawah layar.</div>
                        <div>Timer dan gerbang berhenti saat jeda.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <Rule icon={<Check size={14} />} title="Jawaban benar" body="+100 poin dan +3 koin. Combo beruntun memberi bonus." color="text-mint" />
                <Rule icon={<Heart size={14} />} title="Jawaban belum tepat" body="Nyawa berkurang satu, tetapi kamu mendapat penjelasan." color="text-coral" />
                <Rule icon={<Clock size={14} />} title="Waktu habis" body="Robot tetap melewati gerbang yang sedang aktif. Jadi pilihlah dengan sengaja!" color="text-sun" />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-electric/20 bg-electric/[0.06] px-3 py-2.5 text-[10px] font-semibold leading-relaxed text-slate-300">
                <ShieldCheck size={16} className="shrink-0 text-electric" />
                Semua jawaban dihitung dari angka pada gerbang yang dilewati robot. Tidak ada tebakan posisi jawaban—pilihan benar diacak di setiap soal.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-sun/20 bg-sun/[0.05] p-3">
                <div className="flex items-center gap-2 font-display text-sm font-semibold text-sun">
                  <Lightbulb size={16} />
                  Ingat: perkalian adalah penjumlahan berulang
                </div>
                <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-slate-400">
                  Contoh <span className="font-extrabold text-white">4 × 3</span> berarti 4 + 4 + 4 = 12. Kamu juga bisa membaliknya menjadi 3 + 3 + 3 + 3 = 12.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { number: "× 1", title: "Jawabannya bilangan itu sendiri", body: "7 × 1 = 7. Setiap angka dikali satu nilainya tetap." },
                  { number: "× 2", title: "Tambahkan angkanya sekali", body: "6 × 2 = 6 + 6 = 12. Bisa juga mengingat dua kali lipat." },
                  { number: "× 5", title: "Gunakan pola lima", body: "4 × 5 = 20 karena 4 kelompok berisi 5. Hasilnya selalu berakhiran 0 atau 5." },
                  { number: "× 10", title: "Tambahkan nol", body: "8 × 10 = 80. Cukup tulis angka lalu tambahkan satu nol." },
                  { number: "× 9", title: "Kurangi dari sepuluh", body: "7 × 9 = 70 − 7 = 63. Trik ini cepat saat tabel 9 sudah dikenal." },
                  { number: "Latihan", title: "Mulai dari tabel yang mudah", body: "Kuasai tabel 1, 2, 5, dan 10 dulu, lalu berlanjut ke tabel 6–9." },
                ].map((tip) => (
                  <div key={tip.number} className="panel-soft flex gap-2.5 p-3">
                    <span className="grid h-9 w-11 shrink-0 place-items-center rounded-lg border border-electric/20 bg-electric/10 font-display text-[13px] font-semibold text-electric">
                      {tip.number}
                    </span>
                    <div>
                      <div className="text-[11px] font-extrabold text-white">{tip.title}</div>
                      <p className="mt-0.5 text-[10px] font-semibold leading-relaxed text-slate-400">{tip.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
                <div className="flex items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sun/10 text-sun"><Coins size={16} /></span>
                  <div>
                    <div className="text-[11px] font-extrabold text-white">Pesan dari Robo-Kid</div>
                    <p className="mt-0.5 text-[10px] font-semibold leading-relaxed text-slate-400">
                      Salah itu bagian dari belajar! Baca penjelasan setelah menjawab, lalu coba lagi. Satu langkah lagi menjadi Master Perkalian!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-[10px] font-semibold text-slate-500">
                <Volume2 size={14} className="text-electric" />
                Musik dan efek suara dapat dimatikan melalui tombol di pojok atas. Progres tersimpan di browser ini.
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.08] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="hidden items-center gap-1.5 text-[10px] font-bold text-slate-500 sm:flex">
              <Sparkles size={12} className="text-sun" />
              5 level • 10 soal per level • 3 nyawa
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1 !min-h-[42px] text-[12px] sm:flex-none">
                MENGERTI
              </button>
              {onStart && (
                <button type="button" onClick={onStart} className="btn btn-primary flex-1 !min-h-[42px] text-[12px] sm:flex-none">
                  MULAI BERMAIN
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Key({ children }: { children: string }) {
  return (
    <span className="inline-grid min-w-[18px] place-items-center rounded border border-white/15 bg-white/[0.07] px-1 py-0.5 font-mono text-[9px] text-white">
      {children}
    </span>
  );
}

function Rule({ icon, title, body, color }: { icon: ReactNode; title: string; body: string; color: string }) {
  return (
    <div className="panel-soft p-2.5">
      <div className={`flex items-center gap-1.5 text-[10px] font-extrabold ${color}`}>{icon}{title}</div>
      <p className="mt-1 text-[9px] font-semibold leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}
