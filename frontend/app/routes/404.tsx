import { motion } from "framer-motion";
import { Home } from "lucide-react"; // Using Lucide icon for navigation

const NotFoundPage = () => {
  return (
    <motion.div
      className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Main Heading */}
        <motion.h1
          className="text-6xl font-extrabold text-[color:var(--color-primary)] dark:text-[color:var(--color-foreground)]"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          404
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-xl font-medium text-teal-500"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Oops! The page you're looking for cannot be found.
        </motion.p>

        {/* Description */}
        <motion.p
          className="text-sm text-teal-600"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.6 }}
        >
          It seems that the link is broken or the page has been moved.
        </motion.p>

        {/* Action Button */}
        <motion.div
          className="mt-8"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 bg-[color:var(--color-primary)] text-white hover:text-accent-foreground font-medium rounded-lg shadow-md hover:bg-[color:var(--color-primary-foreground)] transition duration-200 ease-in-out"
          >
            <Home className="mr-2" />
            Go Home
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFoundPage;
