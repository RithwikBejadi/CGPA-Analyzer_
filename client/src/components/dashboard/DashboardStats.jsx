import { motion } from 'framer-motion';
import { FiBook, FiAward, FiTrendingUp } from 'react-icons/fi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { SkeletonCard } from '../ui/Skeleton';

const DashboardStats = ({ loading, cgpa, stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {loading ? (
        <SkeletonCard />
      ) : (
        <Card className="p-8 bg-white border-gray-100/50 hover:shadow-lg:shadow-2xl:shadow-black/30 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Current CGPA</p>
              <h2 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4">
                {cgpa || '—'}
              </h2>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <FiBook className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{stats.totalSemesters} semesters</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiAward className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{stats.totalSubjects} subjects</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{stats.totalCredits} credits</span>
                </div>
              </div>
            </div>
            
            {/* Performance Badge */}
            {cgpa && (
              <Badge
                variant={cgpa >= 9 ? 'success' : cgpa >= 8 ? 'primary' : 'default'}
                size="lg"
              >
                {cgpa >= 9 ? 'Outstanding' : cgpa >= 8 ? 'Excellent' : 'Good'}
              </Badge>
            )}
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default DashboardStats;
