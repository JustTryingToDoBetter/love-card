// lib/sound.ts
export function makeAudio(src: string, volume = 1) {
  const a = new Audio(src);
  a.preload = "auto";
  a.volume = volume;
  return a;
}
