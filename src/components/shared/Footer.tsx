"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaGithub,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    {
      href: "https://web.facebook.com/billy.rex.7334",
      Icon: FaFacebookF,
      hoverColor: "violet",
    },
    {
      href: "https://x.com/Galaxies_Grafx",
      Icon: FaTwitter,
      hoverColor: "violet",
    },
    { href: "https://wa.link/k9dm3u", Icon: FaWhatsapp, hoverColor: "green" },
    {
      href: "https://www.linkedin.com/in/ifeanyi-ejidike-310029357",
      Icon: FaLinkedinIn,
      hoverColor: "violet",
    },
    {
      href: "https://github.com/gravityguy123",
      Icon: FaGithub,
      hoverColor: "violet",
    },
  ];

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-16 mt-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* BRAND */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-linear-to-tr from-violet-600 to-indigo-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl text-gray-900 dark:text-white">
              Course-Pilot
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Empowering minds through expert-led online learning. Study anywhere,
            anytime.
          </p>

          {/* SOCIAL ICONS */}
          <div className="flex gap-3 pt-2">
            {socialLinks.map(({ href, Icon, hoverColor }, i) => (
              <a
                key={i}
                href={href}
                aria-label="Social icons"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  p-2 rounded-full bg-gray-100 dark:bg-gray-800 transition 
                  hover:scale-110
                  ${
                    hoverColor === "green"
                      ? "hover:bg-green-500 hover:text-white"
                      : "hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
            Quick Links
          </h3>

          <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
            {[
              ["Home", "/"],
              ["Courses", "/courses"],
              ["About Us", "/about"],
              ["Contact", "/contact"],
              ["Mentorship", "/mentorship"],
            ].map(([label, href], i) => (
              <li key={i}>
                <Link
                  href={href}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* RESOURCES */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
            Resources
          </h3>

          <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
            {[
              ["Privacy Policy", "/privacy"],
              ["Terms of Service", "/terms"],
              ["Cookie Policy", "/cookies"],
              ["Security", "/security"],
              ["FAQs", "/faqs"],
            ].map(([label, href], i) => (
              <li key={i}>
                <Link
                  href={href}
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
            Get in Touch
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {`Have questions? We’re here to support your learning journey`}.
          </p>

          <div className="flex items-center gap-3 mb-3 group">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-violet-600 transition group-hover:text-white">
              <FaEnvelope className="h-5 w-5" />
            </div>
            <Link
              href="mailto:simmyifeanyi@gmail.com"
              className="hover:text-violet-600 dark:hover:text-violet-400 transition"
            >
              info@course-pilot.com
            </Link>
          </div>

          <div className="flex items-center gap-3 group">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-violet-600 transition group-hover:text-white">
              <FaPhone className="h-5 w-5" />
            </div>
            <Link
              href="tel:+2349032192949"
              className="hover:text-violet-600 dark:hover:text-violet-400 transition"
            >
              +234 903 219 2949
            </Link>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} Course-Pilot. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
