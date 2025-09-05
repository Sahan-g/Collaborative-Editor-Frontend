import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import "./Home.css";
import type { Variants } from "framer-motion";
import { features } from "../constants/features";
import { testimonials } from "../constants/testimonials";
import { advancedFeatures } from "../constants/AdvancedFeatures";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: "easeOut",
    },
  },
};

const floatY: Variants = {
  initial: {
    y: 0,
  },
  animate: {
    y: [-8, 0, -8],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    },
  },
};

const blobPulse: Variants = {
  initial: {
    scale: 1,
    opacity: 0.9,
  },
  animate: {
    scale: [1, 1.06, 1],
    opacity: [0.9, 0.75, 0.9],
    transition: {
      duration: 6.5,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    },
  },
};


const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-cyan-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Hero copy */}
          <motion.div initial="hidden" animate="show" variants={container}>
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500"
            >
              Real-time collaboration, simplified.
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-700 max-w-xl">
              Write, review and iterate together — live cursors, instant sync, and permissioned
              sharing. Built for teams that move fast and ship with confidence.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/documents/new")}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3 text-white shadow-lg hover:translate-y-[-2px] transform transition"
              >
                Create new document
              </button>

              <button
                onClick={() => navigate("/documents")}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700 hover:shadow-sm transition"
              >
                View documents
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="rounded-full bg-white/80 px-3 py-1">Secure by design</span>
              <span className="rounded-full bg-white/80 px-3 py-1">Low-latency sync</span>
              <span className="rounded-full bg-white/80 px-3 py-1">Fine-grained sharing</span>
            </motion.div>

            <motion.div
              className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
              initial="hidden"
              animate="show"
              variants={container}
            >
              {features.slice(0, 4).map((f) => (
                <motion.div key={f.title} variants={fadeUp} className="rounded-xl bg-white/90 p-4 shadow-sm">
                  <div className="text-2xl">{f.icon}</div>
                  <div className="mt-2 font-semibold text-slate-800">{f.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{f.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero visual */}
          <motion.div className="relative flex justify-center items-center">
            <motion.div
              className="w-[520px] max-w-full rounded-2xl bg-gradient-to-br from-white/40 to-white/10 p-6 shadow-2xl backdrop-blur-sm"
              variants={floatY}
              initial="initial"
              animate="animate"
            >
              {/* faux editor card */}
              <div className="rounded-lg bg-slate-900 text-white overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-700 to-cyan-500">
                  <div className="h-8 w-8 rounded-full bg-white/20" />
                  <div className="flex-1">
                    <div className="h-2.5 w-44 rounded bg-white/30" />
                  </div>
                  <div className="h-2 w-8 rounded bg-white/30" />
                </div>

                <div className="p-6">
                  <div className="h-3 w-56 mb-4 rounded bg-white/6" />
                  <div className="space-y-3">
                    <div className="h-3 w-full rounded bg-white/6" />
                    <div className="h-3 w-5/6 rounded bg-white/6" />
                    <div className="h-3 w-3/4 rounded bg-white/6" />
                    <div className="h-3 w-2/3 rounded bg-white/6" />
                  </div>
                </div>
              </div>

              {/* floating cursors */}
              <motion.div
                className="absolute top-6 right-8 flex items-center gap-2"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="h-8 w-8 rounded-full bg-red-400 shadow-lg"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                />
                <motion.div
                  className="h-8 w-8 rounded-full bg-sky-300 shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.3 }}
                />
              </motion.div>
            </motion.div>

            {/* decorative blobs */}
            <motion.div className="pointer-events-none absolute -left-8 -top-8" variants={blobPulse} initial="initial" animate="animate">
              <div className="h-32 w-32 rounded-full bg-gradient-to-r from-purple-400 to-cyan-300 opacity-80 blur-2xl" />
            </motion.div>

            <motion.div className="pointer-events-none absolute -right-6 -bottom-8" variants={blobPulse} initial="initial" animate="animate">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-80 blur-2xl" />
            </motion.div>
          </motion.div>
        </div>

        {/* Testimonials & deeper features */}
        <section className="mt-32 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-cyan-50/50 -z-10" />
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={container}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent"
              >
                Trusted by innovative teams worldwide
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-slate-600">
                Join thousands of teams who've made CollabZ their go-to platform for real-time
                collaboration
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={container}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {testimonials.map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  className="bg-white rounded-2xl p-6 shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-shadow duration-500"
                >
                  <div className="flex items-start gap-4">
                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full ring-2 ring-purple-100" />
                    <div>
                      <div className="font-semibold text-slate-900">{t.name}</div>
                      <div className="text-sm text-slate-500">{t.role}</div>
                    </div>
                  </div>
                  <blockquote className="mt-4 text-slate-600 leading-relaxed">"{t.quote}"</blockquote>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <FiCheck className="text-emerald-500" />
                        Verified user
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats section */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={container}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { label: "Active users", value: "50K+" },
                { label: "Documents created", value: "1M+" },
                { label: "Team collaboration", value: "99.9%" },
                { label: "Customer satisfaction", value: "4.9/5" },
              ].map((stat) => (
                <motion.div key={stat.label} variants={fadeUp} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Advanced features section (isolated to prevent bleed) */}
        <section className="mt-32 relative overflow-hidden isolate z-0 pb-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={container}
            className="max-w-7xl mx-auto px-6"
          >
            <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900">Advanced features for power users</h2>
              <p className="mt-4 text-slate-600">Go beyond basic editing with our professional-grade toolset</p>
            </motion.div>

            <motion.div variants={container} className="mt-16 grid md:grid-cols-3 gap-8">
              {advancedFeatures.map((feature) => (
                <motion.div key={feature.title} variants={fadeUp} className="relative group">
                  {/* glow behind card */}
                  <div className="absolute -inset-0.5 z-0 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                  {/* card content above glow */}
                  <div className="relative z-10 bg-white rounded-xl p-6">
                    <div className="text-3xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-slate-600 text-sm">{feature.description}</p>
                    <button className="mt-4 flex items-center gap-1 text-sm font-medium text-purple-600 group-hover:text-purple-700 transition-colors">
                      Learn more
                      <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* CTA strip (raised above anything below/above) */}
        <section className="relative z-20 mx-auto max-w-7xl px-6 mt-24 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl"
          >
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">Ready to collaborate in realtime?</h3>
              <p className="text-white/90">Start a document and invite your team — it's fast and secure.</p>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <button
                onClick={() => navigate("/documents")}
                className="rounded-lg bg-white px-6 py-3 text-purple-700 font-semibold hover:bg-white/90 transition-colors"
              >
                Get started
              </button>
              <button
                onClick={() => navigate("/documents")}
                className="rounded-lg border-2 border-white/30 px-6 py-3 text-white hover:bg白/10 transition-colors"
              >
                Explore
              </button>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Enhanced footer */}
      <footer className="mt-32 border-t border-slate-200 bg-slate-50/50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-purple-600">CollabZ</h3>
              <p className="mt-4 text-sm text-slate-600 max-w-md">
                Real-time collaboration platform for modern teams. Built with security, speed, and simplicity in mind.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>Features</li>
                <li>Security</li>
                <li>Enterprise</li>
                <li>Pricing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} CollabZ — Built with realtime in mind.
            </div>
            <div className="flex gap-4 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-900">
                Terms
              </a>
              <a href="#" className="hover:text-slate-900">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-900">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
