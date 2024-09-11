import { motion } from 'framer-motion'

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
          </div>
          <div className="flex items-center">
            <motion.a
              href="#"
              className="text-gray-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              About
            </motion.a>
            <motion.a
              href="#"
              className="text-gray-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Contact
            </motion.a>
          </div>
        </div>
      </nav>
    </header>
  )
}