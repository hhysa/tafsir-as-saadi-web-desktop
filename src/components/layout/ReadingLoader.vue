<script setup>
import { BookOpen } from 'lucide-vue-next'
</script>

<template>
  <div class="reading-loader" role="status" aria-live="polite" aria-label="Duke përgatitur leximin">
    <div class="loader-art" aria-hidden="true">
      <div class="loader-halo"></div>
      <div class="loader-orbit"></div>
      <div class="loader-orbit loader-orbit-inner"></div>
      <div class="loader-book"><BookOpen :size="46" :stroke-width="1.4" /></div>
      <span class="loader-spark loader-spark-one">✦</span>
      <span class="loader-spark loader-spark-two">✦</span>
    </div>
    <h2>Duke përgatitur leximin</h2>
    <p>Një çast qetësie, një hap drejt dijes.</p>
    <div class="loader-track" aria-hidden="true"><span></span></div>
  </div>
</template>

<style scoped>
.reading-loader {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 20px;
}
.loader-art {
  position: relative;
  width: 176px;
  height: 176px;
  display: grid;
  place-items: center;
  margin-bottom: 28px;
}
.loader-halo {
  position: absolute;
  inset: -26px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--soft-accent), transparent 70%);
}
.loader-orbit {
  position: absolute;
  inset: 4px;
  border: 1px solid var(--line);
  border-top: 2px solid var(--secondary-accent);
  border-radius: 50%;
  animation: loader-orbit 5s linear infinite;
}
.loader-orbit::after {
  content: '';
  position: absolute;
  top: 22px;
  right: 20px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 5px var(--soft-accent);
}
.loader-orbit-inner {
  inset: 20px;
  border-style: dashed;
  opacity: 0.5;
  animation-direction: reverse;
  animation-duration: 12s;
}
.loader-orbit-inner::after {
  display: none;
}
.loader-book {
  z-index: 1;
  width: 94px;
  height: 94px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 26px;
  background: var(--paper);
  color: var(--accent);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--accent) 12%, transparent);
  animation: loader-float 3s ease-in-out infinite;
}
.loader-spark {
  position: absolute;
  color: var(--secondary-accent);
  font-size: 19px;
  animation: loader-glow 3s ease-in-out infinite;
}
.loader-spark-one {
  top: 6px;
  left: 22px;
}
.loader-spark-two {
  bottom: 10px;
  right: 18px;
  font-size: 13px;
  animation-delay: -1.5s;
}
h2 {
  font-family: Lora, serif;
  font-size: clamp(21px, 3vw, 26px);
  font-weight: 500;
  color: var(--ink);
  margin: 0 0 12px;
}
p {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
  max-width: 290px;
}
.loader-track {
  width: 116px;
  height: 3px;
  margin-top: 28px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--soft-accent);
}
.loader-track span {
  display: block;
  width: 46px;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  animation: loader-slide 1.8s ease-in-out infinite alternate;
}
@keyframes loader-orbit {
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader-float {
  50% {
    transform: translateY(-5px);
  }
}
@keyframes loader-glow {
  50% {
    opacity: 0.35;
  }
}
@keyframes loader-slide {
  from {
    transform: translateX(-16px);
  }
  to {
    transform: translateX(86px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .loader-orbit,
  .loader-book,
  .loader-spark,
  .loader-track span {
    animation: none;
  }
  .loader-track span {
    margin: 0 auto;
  }
}
@media (max-height: 550px) {
  .loader-art {
    width: 132px;
    height: 132px;
    margin-bottom: 18px;
  }
  .loader-book {
    width: 76px;
    height: 76px;
    border-radius: 22px;
  }
  .loader-track {
    margin-top: 18px;
  }
}
</style>
