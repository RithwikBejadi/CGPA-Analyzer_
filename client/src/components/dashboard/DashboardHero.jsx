import { motion } from 'framer-motion';

const DashboardHero = ({ username, title, subtitle }) => {
  return (
    <div className="border-b border-gray-100/50 bg-white transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
            {title || `Welcome back, ${username}`}
          </h1>
          <p className="text-gray-600">
            {subtitle || "Here's your academic overview for this semester."}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHero;
