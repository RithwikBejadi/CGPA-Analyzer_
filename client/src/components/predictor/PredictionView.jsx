import { useState, useEffect } from 'react';
import { assessmentScoreService } from '../../services/assessmentService';
import { getAllSemesters } from '../../services/semesterApi';

const PredictionView = () => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [predictedSGPA, setPredictedSGPA] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchPredictions();
    }
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    try {
      const response = await getAllSemesters();
      if (response.success) {
        setSemesters(response.data);
      }
    } catch (err) {
      console.error('Error fetching semesters:', err);
    }
  };

  const fetchPredictions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await assessmentScoreService.getPredictionsBySemester(selectedSemester);
      if (response.success) {
        setPredictions(response.data.predictions);
        setPredictedSGPA(response.data.predictedSGPA);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  const calculateComponentProgress = (subjectAssessment) => {
    const total = subjectAssessment.template.components.length;
    const completed = subjectAssessment.scores.length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const calculateWeightedScore = (subjectAssessment) => {
    let totalWeighted = 0;
    let totalWeightageUsed = 0;

    subjectAssessment.scores.forEach(score => {
      const percentage = (score.scoreObtained / score.maxScore) * 100;
      const weighted = (percentage * score.component.weightage) / 100;
      totalWeighted += weighted;
      totalWeightageUsed += score.component.weightage;
    });

    return { totalWeighted, totalWeightageUsed };
  };

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50/20 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Semester Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Semester
        </label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a semester</option>
          {semesters.map((sem) => (
            <option key={sem.id} value={sem.id}>
              Semester {sem.semesterNumber}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-600">
          Loading predictions...
        </div>
      )}

      {/* Predicted SGPA */}
      {!loading && selectedSemester && predictedSGPA !== null && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-medium mb-2">Predicted SGPA</h3>
          <div className="text-4xl font-bold">{predictedSGPA.toFixed(2)}</div>
          <p className="text-sm mt-2 opacity-90">
            Based on {predictions.length} subject{predictions.length !== 1 ? 's' : ''} with predictions
          </p>
        </div>
      )}

      {/* No Predictions */}
      {!loading && selectedSemester && predictions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-5xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Predictions Yet
          </h3>
          <p className="text-gray-600">
            Link templates to subjects and add scores to see predictions
          </p>
        </div>
      )}

      {/* Subject Predictions */}
      {!loading && predictions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Subject Predictions
          </h3>

          {predictions.map((prediction) => {
            const progress = calculateComponentProgress(prediction);
            const { totalWeighted, totalWeightageUsed } = calculateWeightedScore(prediction);

            return (
              <div
                key={prediction.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                {/* Subject Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {prediction.subject.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Credits: {prediction.subject.credits} • Template: {prediction.template.name}
                    </p>
                  </div>
                  {prediction.predictedGrade && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {prediction.predictedGrade}
                      </div>
                      <div className="text-sm text-gray-600">
                        {prediction.predictedGradePoint} points
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Components Completed</span>
                    <span>{progress.completed}/{progress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Component Breakdown */}
                <div className="space-y-2">
                  {prediction.template.components.map((component) => {
                    const score = prediction.scores.find(s => s.componentId === component.id);
                    const percentage = score 
                      ? (score.scoreObtained / score.maxScore) * 100 
                      : null;

                    return (
                      <div
                        key={component.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {component.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({component.weightage}%)
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {score ? (
                            <>
                              <div className="text-sm font-medium text-gray-900">
                                {score.scoreObtained}/{score.maxScore}
                              </div>
                              <div className="text-xs text-gray-600">
                                {percentage.toFixed(1)}%
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Not entered
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Weighted Score Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Current Weighted Score:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {totalWeighted.toFixed(2)}% 
                      <span className="text-gray-500 font-normal ml-1">
                        ({totalWeightageUsed}% weightage used)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PredictionView;
