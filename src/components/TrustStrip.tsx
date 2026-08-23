import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { trustPoints } from "@/lib/site";

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const value = useMotionValue(to - 12);
  const spring = useSpring(value, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState(to - 12);

  useEffect(() => {
    if (inView) value.set(to);
  }, [inView, to, value]);

  useEffect(() => spring.on("change", (v) => setDisplay(Math.round(v))), [spring]);

  return <span ref={ref}>{display}</span>;
}

export function TrustStrip() {
  return (
    <section aria-label="Credentials" className="border-y border-border bg-card">
      <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-5">
        {trustPoints.map((point, i) => (
          <motion.div
            key={point.prefix}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="border-l-2 border-brass/50 pl-4"
          >
            <p className="font-display text-base font-semibold text-foreground">
              {point.prefix}
              {point.value ? <Counter to={point.value} /> : null}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{point.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
