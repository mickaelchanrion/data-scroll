import { gsap, Expo } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import "./style.css";
import { useDataScroll } from "../../src/index";

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 0.8,
  easing: Expo.easeOut,
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

useDataScroll();
