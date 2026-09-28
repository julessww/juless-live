import { r as toESM } from "./rolldown-runtime-S-ySWqyJ.js";
import { i as requireReact, r as requireJsx } from "./framework-CXnKph_e.js";
const { useEffect, useRef } = toESM(requireReact(), 1);
const { jsx: _jsx } = requireJsx();
export function ScrollMotion() {
    const anchor = useRef(null);
    useEffect(() => {
        const root = anchor.current?.closest("main");
        if (!root || !("IntersectionObserver" in window))
            return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const mobile = window.matchMedia("(max-width: 760px)");
        const animations = new Map();
        const revealed = new WeakSet();
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting)
                    continue;
                const element = entry.target;
                observer.unobserve(element);
                if (reduced.matches || revealed.has(element))
                    continue;
                revealed.add(element);
                const image = element.dataset.motionReveal === "image";
                const distance = mobile.matches ? 14 : 30;
                const animation = element.animate([
                    { opacity: image ? .65 : .2, transform: `translateY(${distance}px)`, clipPath: image ? "inset(6% 4% 6% 4% round 16px)" : "inset(0 0 85% 0)" },
                    { opacity: 1, transform: "translateY(0)", clipPath: image ? "inset(0 0 0 0 round 16px)" : "inset(-10% -2% -10% -2%)" },
                ], { duration: mobile.matches ? 420 : 650, delay: Number(element.dataset.motionDelay || 0), easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
                animations.set(element, animation);
                void animation.finished.catch(() => { }).finally(() => animations.delete(element));
            }
        }, { threshold: .08, rootMargin: "0px 0px -5% 0px" });
        if (!reduced.matches)
            root.querySelectorAll("[data-motion-reveal]").forEach(element => observer.observe(element));
        const stopMotion = () => {
            if (!reduced.matches)
                return;
            observer.disconnect();
            animations.forEach(animation => animation.cancel());
        };
        const showImmediately = (target) => {
            revealed.add(target);
            observer.unobserve(target);
            animations.get(target)?.cancel();
            animations.delete(target);
        };
        const showAnchorTarget = (hash) => {
            if (!hash || hash === "#")
                return;
            let id;
            try {
                id = decodeURIComponent(hash.slice(1));
            }
            catch {
                return;
            }
            const destination = document.getElementById(id);
            if (!destination || destination === root || !root.contains(destination))
                return;
            const heading = destination.matches("[data-motion-reveal]")
                ? destination
                : destination.querySelector('[data-motion-reveal="heading"]');
            if (heading)
                showImmediately(heading);
        };
        const showClickedAnchor = (event) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
                return;
            if (!(event.target instanceof Element))
                return;
            const link = event.target.closest('a[href^="#"]');
            if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self"))
                return;
            showAnchorTarget(link.getAttribute("href") || "");
        };
        const showHashTarget = () => showAnchorTarget(window.location.hash);
        const showFocused = (event) => {
            if (!(event.target instanceof HTMLElement))
                return;
            const target = event.target.closest("[data-motion-reveal]");
            if (target)
                showImmediately(target);
        };
        showHashTarget();
        window.addEventListener("hashchange", showHashTarget);
        root.addEventListener("click", showClickedAnchor);
        reduced.addEventListener("change", stopMotion);
        root.addEventListener("focusin", showFocused);
        return () => {
            observer.disconnect();
            animations.forEach(animation => animation.cancel());
            window.removeEventListener("hashchange", showHashTarget);
            root.removeEventListener("click", showClickedAnchor);
            reduced.removeEventListener("change", stopMotion);
            root.removeEventListener("focusin", showFocused);
        };
    }, []);
    return _jsx("span", { ref: anchor, hidden: true, "aria-hidden": "true" });
}
