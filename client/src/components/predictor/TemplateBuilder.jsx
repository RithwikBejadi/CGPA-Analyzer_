import { useState, useEffect } from 'react';
import { assessmentTemplateService } from '../../services/assessmentService';

const TemplateBuilder = () => {
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [components, setComponents] = useState([
    { name: '', weightage: '', maxScore: '' }
  ]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

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

  const addComponent = () => {
    setComponents([...components, { name: '', weightage: '', maxScore: '' }]);
  };

  const removeComponent = (index) => {
    if (components.length > 1) {
      const newComponents = components.filter((_, i) => i !== index);
      setComponents(newComponents);
    }
  };

  const updateComponent = (index, field, value) => {
    const newComponents = [...components];
    newComponents[index][field] = value;
    setComponents(newComponents);
  };

  const calculateTotalWeightage = () => {
    return components.reduce((sum, comp) => {
      const weightage = parseFloat(comp.weightage) || 0;
      return sum + weightage;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    const totalWeightage = calculateTotalWeightage();
    if (Math.abs(totalWeightage - 100) > 0.01) {
      setError(`Total weightage must equal 100%. Current total: ${totalWeightage.toFixed(2)}%`);
      return;
    }

    // Check if all components are filled
    for (const comp of components) {
      if (!comp.name.trim() || !comp.weightage || !comp.maxScore) {
        setError('Please fill in all component fields');
        return;
      }
    }

    setLoading(true);
    try {
      const templateData = {
        name: templateName,
        description: description || undefined,
        components: components.map(comp => ({
          name: comp.name,
          weightage: parseFloat(comp.weightage),
          maxScore: parseFloat(comp.maxScore)
        }))
      };

      const response = await assessmentTemplateService.createTemplate(templateData);
      if (response.success) {
        setSuccess('Template created successfully!');
        // Reset form
        setTemplateName('');
        setDescription('');
        setComponents([{ name: '', weightage: '', maxScore: '' }]);
        // Refresh templates list
        fetchTemplates();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await assessmentTemplateService.deleteTemplate(id);
      if (response.success) {
        setSuccess('Template deleted successfully');
        fetchTemplates();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete template');
    }
  };

  const totalWeightage = calculateTotalWeightage();
  const isWeightageValid = Math.abs(totalWeightage - 100) < 0.01;

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

      {/* Create Template Form */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Create Assessment Template
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Standard Course Assessment"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template"
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Components */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Assessment Components *
              </label>
              <button
                type="button"
                onClick={addComponent}
                className="text-sm text-blue-600 hover:text-blue-700:text-blue-300"
              >
                + Add Component
              </button>
            </div>

            <div className="space-y-3">
              {components.map((component, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={component.name}
                      onChange={(e) => updateComponent(index, 'name', e.target.value)}
                      placeholder="Component name (e.g., Assignments)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      value={component.weightage}
                      onChange={(e) => updateComponent(index, 'weightage', e.target.value)}
                      placeholder="Weight %"
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      value={component.maxScore}
                      onChange={(e) => updateComponent(index, 'maxScore', e.target.value)}
                      placeholder="Max Score"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  {components.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeComponent(index)}
                      className="text-red-600 hover:text-red-700:text-red-300 p-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Weightage Total */}
            <div className="mt-3 flex justify-end">
              <div className={`text-sm font-medium ${isWeightageValid ? 'text-green-600' : 'text-red-600'}`}>
                Total Weightage: {totalWeightage.toFixed(2)}% {isWeightageValid ? '✓' : '(Must be 100%)'}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isWeightageValid}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Create Template'}
          </button>
        </form>
      </div>

      {/* Existing Templates */}
      {templates.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Templates
          </h2>
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </p>
                    )}
                    <div className="mt-2 space-y-1">
                      {template.components.map((comp) => (
                        <div key={comp.id} className="text-sm text-gray-700">
                          • {comp.name}: {comp.weightage}% (Max: {comp.maxScore})
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-700:text-red-300 text-sm ml-4"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateBuilder;
