import * as XLSX from 'xlsx';
import type { Project, Station } from '../types';

// Get reading value by label pattern
const getReadingValue = (readings: Station['readings'], pattern: string): string => {
  const reading = readings.find((r) => r.label.includes(pattern));
  return reading?.value || '';
};

// Export project to Excel
export const exportProjectToExcel = (project: Project): void => {
  // Prepare data rows
  const headers = [
    '测站号',
    '后视点',
    '前视点',
    '后视黑面上丝',
    '后视黑面下丝',
    '后视黑面中丝',
    '后视红面中丝',
    '前视黑面上丝',
    '前视黑面下丝',
    '前视黑面中丝',
    '前视红面中丝',
    '后视距 (m)',
    '前视距 (m)',
    '视距差 (m)',
    '累积视距差 (m)',
    '黑面高差 (mm)',
    '红面高差 (mm)',
    '高差之差 (mm)',
    '平均高差 (mm)',
    '黑红面读数差 - 后视 (mm)',
    '黑红面读数差 - 前视 (mm)',
  ];

  const data = project.stations.map((station) => [
    station.stationNo,
    station.backPoint,
    station.frontPoint,
    getReadingValue(station.readings, '后视黑面 - 上丝'),
    getReadingValue(station.readings, '后视黑面 - 下丝'),
    getReadingValue(station.readings, '后视黑面 - 中丝'),
    getReadingValue(station.readings, '后视红面 - 中丝'),
    getReadingValue(station.readings, '前视黑面 - 上丝'),
    getReadingValue(station.readings, '前视黑面 - 下丝'),
    getReadingValue(station.readings, '前视黑面 - 中丝'),
    getReadingValue(station.readings, '前视红面 - 中丝'),
    station.backSightDistance.toFixed(2),
    station.frontSightDistance.toFixed(2),
    station.distanceDiff.toFixed(2),
    station.accumulatedDistanceDiff.toFixed(2),
    station.heightDiffBlack.toFixed(2),
    station.heightDiffRed.toFixed(2),
    station.heightDiffDiff.toFixed(2),
    station.meanHeightDiff.toFixed(2),
    station.blackRedDiffBack.toFixed(2),
    station.blackRedDiffFront.toFixed(2),
  ]);

  // Add header row
  data.unshift(headers);

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 8 },  // 测站号
    { wch: 10 }, // 后视点
    { wch: 10 }, // 前视点
    { wch: 12 }, // 后视黑面上丝
    { wch: 12 }, // 后视黑面下丝
    { wch: 12 }, // 后视黑面中丝
    { wch: 12 }, // 后视红面中丝
    { wch: 12 }, // 前视黑面上丝
    { wch: 12 }, // 前视黑面下丝
    { wch: 12 }, // 前视黑面中丝
    { wch: 12 }, // 前视红面中丝
    { wch: 10 }, // 后视距
    { wch: 10 }, // 前视距
    { wch: 10 }, // 视距差
    { wch: 12 }, // 累积视距差
    { wch: 10 }, // 黑面高差
    { wch: 10 }, // 红面高差
    { wch: 10 }, // 高差之差
    { wch: 10 }, // 平均高差
    { wch: 14 }, // 黑红面读数差 - 后视
    { wch: 14 }, // 黑红面读数差 - 前视
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  // Sheet name max 31 characters
  const sheetName = project.name.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate file name
  const fileName = `${project.name}_水准测量记录.xlsx`;

  // Download file
  XLSX.writeFile(wb, fileName);
};

// Export multiple projects (future feature)
export const exportMultipleProjects = (projects: Project[]): void => {
  if (projects.length === 1) {
    exportProjectToExcel(projects[0]);
    return;
  }

  const wb = XLSX.utils.book_new();

  projects.forEach((project) => {
    const headers = [
      '测站号',
      '后视点',
      '前视点',
      '后视黑面上丝',
      '后视黑面下丝',
      '后视黑面中丝',
      '后视红面中丝',
      '前视黑面上丝',
      '前视黑面下丝',
      '前视黑面中丝',
      '前视红面中丝',
      '后视距 (m)',
      '前视距 (m)',
      '视距差 (m)',
      '累积视距差 (m)',
      '黑面高差 (mm)',
      '红面高差 (mm)',
      '高差之差 (mm)',
      '平均高差 (mm)',
      '黑红面读数差 - 后视 (mm)',
      '黑红面读数差 - 前视 (mm)',
    ];

    const getReadingValue = (readings: Station['readings'], pattern: string): string => {
      const reading = readings.find((r) => r.label.includes(pattern));
      return reading?.value || '';
    };

    const data = project.stations.map((station) => [
      station.stationNo,
      station.backPoint,
      station.frontPoint,
      getReadingValue(station.readings, '后视黑面 - 上丝'),
      getReadingValue(station.readings, '后视黑面 - 下丝'),
      getReadingValue(station.readings, '后视黑面 - 中丝'),
      getReadingValue(station.readings, '后视红面 - 中丝'),
      getReadingValue(station.readings, '前视黑面 - 上丝'),
      getReadingValue(station.readings, '前视黑面 - 下丝'),
      getReadingValue(station.readings, '前视黑面 - 中丝'),
      getReadingValue(station.readings, '前视红面 - 中丝'),
      station.backSightDistance.toFixed(2),
      station.frontSightDistance.toFixed(2),
      station.distanceDiff.toFixed(2),
      station.accumulatedDistanceDiff.toFixed(2),
      station.heightDiffBlack.toFixed(2),
      station.heightDiffRed.toFixed(2),
      station.heightDiffDiff.toFixed(2),
      station.meanHeightDiff.toFixed(2),
      station.blackRedDiffBack.toFixed(2),
      station.blackRedDiffFront.toFixed(2),
    ]);

    data.unshift(headers);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const sheetName = project.name.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, '水准测量记录合集.xlsx');
};
