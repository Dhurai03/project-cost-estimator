exports.generateCSV = async (estimate) => {
  try {
    if (!estimate) {
      throw new Error('No estimate data provided');
    }

    // Escape CSV fields properly
    const escapeCSV = (field) => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    // Create CSV headers
    const headers = [
      'Estimate Number',
      'Date',
      'Status',
      'Project Name',
      'Project Type',
      'Duration (months)',
      'Team Size',
      'Complexity Level',
      'Labor Cost',
      'Material Cost',
      'Equipment Cost',
      'Misc Cost',
      'Total Cost',
      'Notes'
    ].join(',');

    // Create CSV row with safe access
    const row = [
      escapeCSV(estimate.estimateNumber),
      escapeCSV(estimate.createdAt ? new Date(estimate.createdAt).toLocaleDateString() : ''),
      escapeCSV(estimate.status),
      escapeCSV(estimate.project?.name),
      escapeCSV(estimate.project?.projectType),
      escapeCSV(estimate.project?.duration),
      escapeCSV(estimate.project?.teamSize),
      escapeCSV(estimate.project?.complexityLevel),
      escapeCSV(estimate.costBreakdown?.laborCost),
      escapeCSV(estimate.costBreakdown?.materialCost),
      escapeCSV(estimate.costBreakdown?.equipmentCost),
      escapeCSV(estimate.costBreakdown?.miscCost),
      escapeCSV(estimate.costBreakdown?.totalCost),
      escapeCSV(estimate.notes || '')
    ].join(',');

    const csv = `${headers}\n${row}`;
    
    return Buffer.from(csv, 'utf-8');
  } catch (error) {
    console.error('CSV generation error:', error);
    throw error;
  }
};