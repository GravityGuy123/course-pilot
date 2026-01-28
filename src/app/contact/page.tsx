"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-violet-400 to-purple-400 dark:from-violet-800 dark:to-purple-900 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Contact <span className="text-yellow-300">Us</span>
          </h1>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
            {`Got questions or suggestions? We'd love to hear from you.`}
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-6">
          <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4">
            <FaEnvelope className="text-violet-600 dark:text-violet-300 text-2xl" />
            <Link
              href="mailto:info@course-pilot.com"
              className="inline-block text-sm md:text-base font-medium text-violet-600 dark:text-indigo-300
             hover:underline underline-offset-4
             hover:decoration-violet-600 dark:hover:decoration-indigo-500
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:focus-visible:ring-indigo-400
             rounded transition-colors duration-300"
            >
              info@course-pilot.com
            </Link>
          </motion.div>

          <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4">
            <FaPhone className="text-violet-600 dark:text-violet-300 text-2xl" />
            <Link
              href="tel:+2349032192949"
              className="inline-block text-sm md:text-base font-medium text-violet-600 dark:text-indigo-300
             hover:underline underline-offset-4
             hover:decoration-violet-600 dark:hover:decoration-indigo-500
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:focus-visible:ring-indigo-400
             rounded transition-colors duration-300"
            >
              +234 903 219 2949
            </Link>
          </motion.div>

          <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4">
            <FaMapMarkerAlt className="text-violet-600 dark:text-violet-300 text-2xl" />
            <span
              className="text-sm inline-block md:text-base font-medium text-violet-600 dark:text-indigo-300
             hover:decoration-violet-600 dark:hover:decoration-indigo-500
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:focus-visible:ring-indigo-400
             rounded transition-colors duration-300"
            >
              Anambra, Nigeria
            </span>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.form
          whileHover={{ scale: 1.01 }}
          className="bg-violet-50 dark:bg-violet-900 p-6 rounded-2xl shadow-md space-y-4"
        >
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500"
          />
          <textarea
            placeholder="Your Message"
            rows={5}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="w-full bg-violet-500 hover:bg-violet-600 dark:bg-violet-700 dark:hover:bg-violet-800 text-white py-3 rounded-lg transition-colors"
          >
            Send Message
          </button>
        </motion.form>
      </section>
    </div>
  );
}
