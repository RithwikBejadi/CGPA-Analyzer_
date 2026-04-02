import { useState, useEffect } from 'react';
import { assessmentTemplateService, assessmentScoreService } from '../../services/assessmentService';
import { getAllSemesters } from '../../services/semesterApi';

const ScoreTracker = () => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subjectAssessment, setSubjectAssessment] = useState(null);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSemesters();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchSubjects();
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectAssessment();
    }
  }, [selectedSubject]);

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

  const fetchTemplates = async () => {
    try {
      const response = await assessmentTemplateService.getTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const semester = semesters.find(s => s.id.toString() === selectedSemester);
      if (semester && semester.subjects) {
        setSubjects(semester.subjects);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchSubjectAssessment = async () => {
    try {
      const response = await assessmentScoreService.getScoresBySubject(selectedSubject);
      if (response.success) {
        setSubjectAssessment(response.data);
        // Initialize scores from existing data
        const initialScores = {};
        response.data.scores.forEach(score => {
          initialScores[score.componentId] = {
            scoreObtained: score.scoreObtained,
            maxScore: score.maxScore
          };
        });
        setScores(initialScores);
      }
    } catch (err) {
      // No assessment found yet
      setSubjectAssessment(null);
      setScores({});
    }
  };

  const handleLinkTemplate = async () => {
    if (!selectedSubject || !selectedTemplate) {
      setError('Please select both subject and template');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await assessmentScoreService.createSubjectAssessment({
        subjectId: selectedSubject,
        templateId: selectedTemplate
      });
      if (response.success) {
        setSuccess('Template linked successfully!');
        fetchSubjectAssessment();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link template');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (componentId, field, value) => {
    setScores(prev => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        [field]: value
      }
    }));
  };

  const handleSaveScore = async (componentId) => {
    const score = scores[componentId];
    if (!score || !score.scoreObtained || !score.maxScore) {
      setError('Please enter both score obtained and max score');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await assessmentScoreService.addScore({
        subjectAssessmentId: subjectAssessment.id,
        componentId: componentId,
        scoreObtained: parseFloat(score.scoreObtained),
        maxScore: parseFloat(score.maxScore)
      });
      if (response.success) {
        setSuccess(`Score saved! Predicted: ${response.data.prediction.grade} (${response.data.prediction.percentage.toFixed(2)}%)`);
        fetchSubjectAssessment();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save score');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!subjectAssessment) return 0;
    const totalComponents = subjectAssessment.template.components.length;
    const completedComponents = subjectAssessment.scores.length;
    return (completedComponents / totalComponents) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50/20 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50/20 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Semester
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => {
              setSelectedSemester(e.target.value);
              setSelectedSubject('');
              setSubjectAssessment(null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a semester</option>
            {semesters.map((sem) => (
              <option key={sem.id} value={sem.id}>
                Semester {sem.semesterNumber}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedSemester}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Choose a subject</option>
            {subjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Link Template (if no assessment exists) */}
      {selectedSubject && !subjectAssessment && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Link Assessment Template
          </h3>
          <div className="flex gap-3">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleLinkTemplate}
              disabled={loading || !selectedTemplate}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Link
            </button>
          </div>
        </div>
      )}

      {/* Score Entry */}
      {subjectAssessment && (
        <div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900">
                {subjectAssessment.template.name}
              </h3>
              <span className="text-sm text-gray-600">
                Progress: {calculateProgress().toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {subjectAssessment.template.components.map((component) => {
              const existingScore = subjectAssessment.scores.find(s => s.componentId === component.id);
              const currentScore = scores[component.id] || {};

              return (
                <div
                  key={component.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {component.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Weightage: {component.weightage}% • Max Score: {component.maxScore}
                      </p>
                    </div>
                    {existingScore && (
                      <span className="text-green-600 text-sm">
                        ✓ Saved
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Score Obtained
                      </label>
                      <input
                        type="number"
                        value={currentScore.scoreObtained || ''}
                        onChange={(e) => handleScoreChange(component.id, 'scoreObtained', e.target.value)}
                        placeholder="e.g., 80"
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Out of
                      </label>
                      <input
                        type="number"
                        value={currentScore.maxScore || component.maxScore}
                        onChange={(e) => handleScoreChange(component.id, 'maxScore', e.target.value)}
                        placeholder="e.g., 100"
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => handleSaveScore(component.id)}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Save
                    </button>
                  </div>

                  {existingScore && (
                    <div className="mt-2 text-sm text-gray-600">
                      Current: {existingScore.scoreObtained}/{existingScore.maxScore} 
                      ({((existingScore.scoreObtained / existingScore.maxScore) * 100).toFixed(2)}%)
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Prediction */}
          {subjectAssessment.predictedGrade && (
            <div className="mt-6 bg-blue-50/20 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Current Prediction
              </h4>
              <div className="text-2xl font-bold text-blue-600">
                {subjectAssessment.predictedGrade} ({subjectAssessment.predictedGradePoint} points)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreTracker;
