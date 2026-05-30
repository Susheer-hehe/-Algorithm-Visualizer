import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const teamMembers = [
  {
    name: 'Muhammad Shaheer Ahsan',
    role: 'Full-Stack Developer',
    color: 'from-indigo-500 to-purple-600',
    glow: 'shadow-indigo-500/20',
    icon: '👨‍💻',
  },
  {
    name: 'Abdullah',
    role: 'Frontend Developer',
    color: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/20',
    icon: '🎨',
  },
  {
    name: 'Adeel Furqan',
    role: 'Backend Developer',
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/20',
    icon: '⚙️',
  },
];

const techStack = [
  { name: 'C++', desc: 'Backend Engine', icon: '🔧' },
  { name: 'React.js', desc: 'Frontend UI', icon: '⚛️' },
  { name: 'Tailwind CSS', desc: 'Styling', icon: '🎨' },
  { name: 'Framer Motion', desc: 'Animations', icon: '✨' },
  { name: 'cpp-httplib', desc: 'HTTP Server', icon: '🌐' },
  { name: 'Raw Arrays', desc: 'No std::vector', icon: '📦' },
];

function MemberCard({ member, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 text-center hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 hover:${member.glow} hover:shadow-xl`}
    >
      {/* Gradient accent at top */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${member.color}`} />

      {/* Avatar */}
      <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-4xl mb-4 shadow-lg ${member.glow}`}>
        {member.icon}
      </div>

      {/* Name */}
      <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>

      {/* Role */}
      <span className={`inline-block text-sm font-medium bg-gradient-to-r ${member.color} bg-clip-text text-transparent`}>
        {member.role}
      </span>
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-pulse-slow animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </motion.div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h1 className="text-5xl font-extrabold">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              About
            </span>
            <span className="text-white ml-3">Us</span>
          </h1>
          <p className="mt-3 text-slate-400 text-lg max-w-lg mx-auto">
            A DSA course project built with passion, raw pointers, and zero <code className="text-indigo-400 text-sm">std::vector</code>.
          </p>
        </motion.div>

        {/* Team Section */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-6"
          >
            👥 The Team
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {teamMembers.map((member, i) => (
              <MemberCard key={member.name} member={member} index={i} />
            ))}
          </div>
        </section>

        {/* Project Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-6">📋 About the Project</h2>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 space-y-4">
            <p className="text-slate-300 leading-relaxed">
              <span className="text-white font-semibold">Algorithm Visualizer</span> is a full-stack web application
              that brings sorting and pathfinding algorithms to life through interactive step-by-step animations.
            </p>
            <p className="text-slate-400 leading-relaxed">
              The architecture follows a clean client-server model: the <span className="text-indigo-400">C++ backend</span> acts
              as the computational engine, executing algorithms on raw arrays and manually implemented data structures.
              It logs every single state change and returns the complete history as JSON.
              The <span className="text-purple-400">React frontend</span> then replays this history frame-by-frame like a video player.
            </p>
            <p className="text-slate-400 leading-relaxed">
              All backend data structures — queues, stacks, and priority queues — are built from scratch
              using linked lists. <span className="text-rose-400 font-medium">No standard dynamic containers</span> are used.
            </p>
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-14"
        >
          <h2 className="text-2xl font-bold text-white mb-6">🛠️ Tech Stack</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + i * 0.08 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <span className="text-2xl">{tech.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{tech.name}</p>
                  <p className="text-xs text-slate-500">{tech.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center pt-8 border-t border-white/[0.04]"
        >
          <p className="text-xs text-slate-600 font-mono">
            Data Structures &amp; Algorithms Course Project &nbsp;•&nbsp; 2025
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
