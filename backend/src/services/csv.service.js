const { Parser } = require('json2csv');

exports.generateCSV = async (estimate) => {
  const fields = [
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
  ];

  const data = [{
    'Estimate Number': estimate.estimateNumber,
    'Date': new Date(estimate.createdAt).toLocaleDateString(),
    'Status': estimate.status,
    'Project Name': estimate.project.name,
    'Project Type': estimate.project.projectType,
    'Duration (months)': estimate.project.duration,
    'Team Size': estimate.project.teamSize,
    'Complexity Level': estimate.project.complexityLevel,
    'Labor Cost': estimate.costBreakdown.laborCost,
    'Material Cost': estimate.costBreakdown.materialCost,
    'Equipment Cost': estimate.costBreakdown.equipmentCost,
    'Misc Cost': estimate.costBreakdown.miscCost,
    'Total Cost': estimate.costBreakdown.totalCost,
    'Notes': estimate.notes || ''
  }];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(data);
  
  return Buffer.from(csv, 'utf-8');
};