"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Target, BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-violet-400 to-purple-400 dark:from-violet-800 dark:to-purple-900 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            About <span className="text-yellow-300">CoursePilot</span>
          </h1>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
            Empowering minds, shaping futures. Our mission is to make
            world-class learning accessible to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Mission / Vision / Story */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid gap-10 md:grid-cols-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-violet-50 dark:bg-violet-900 rounded-2xl p-6 shadow-md text-center"
        >
          <Target className="h-12 w-12 mx-auto text-violet-600 dark:text-violet-300" />
          <h3 className="mt-4 font-bold text-xl">Our Mission</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            To provide engaging, affordable, and flexible learning opportunities
            that help learners achieve their goals.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-violet-50 dark:bg-violet-900 rounded-2xl p-6 shadow-md text-center"
        >
          <Users className="h-12 w-12 mx-auto text-violet-600 dark:text-violet-300" />
          <h3 className="mt-4 font-bold text-xl">Our Community</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            A vibrant community of learners and mentors across the globe,
            sharing knowledge and building connections.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-violet-50 dark:bg-violet-900 rounded-2xl p-6 shadow-md text-center"
        >
          <BookOpen className="h-12 w-12 mx-auto text-violet-600 dark:text-violet-300" />
          <h3 className="mt-4 font-bold text-xl">Our Story</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Founded with a belief that education should be limitless,
            CoursePilot bridges the gap between passion and profession.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
