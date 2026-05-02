import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { Station, Reading } from '../../types';
import {
  getReadingLabels,
  formatToFourDigits,
  calculateStation,
  K_CONFIGS,
  swapKValues,
} from '../../utils/leveling';
import { exportProjectToExcel } from '../../utils/export';

export const MeasurementPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, updateProject, addStation, projects } = useAppStore();
  
  // Find project if not in currentProject
  const project = currentProject?.id === projectId 
    ? currentProject 
    : projects.find(p => p.id === projectId);
  
  const [stationNo, setStationNo] = useState(1);
  const [backPoint, setBackPoint] = useState('');
  const [frontPoint, setFrontPoint] = useState('');
  const [readings, setReadings] = useState<Reading[]>([]);
  const [k1, setK1] = useState(4.687);
  const [k2, setK2] = useState(4.787);
  const [showKConfig, setShowKConfig] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [calculationResults, setCalculationResults] = useState<Partial<Station>>({});
  
  // Initialize readings based on level
  useEffect(() => {
    if (project) {
      const labels = getReadingLabels(project.level);
      setReadings(labels.map(label => ({ label, value: '' })));
      
      // Check if this is station #1
      const isFirstStation = project.stations.length === 0;
      setShowKConfig(isFirstStation);
      setStationNo(project.stations.length + 1);
      
      // If not first station, get K values from previous station and swap
      if (!isFirstStation && project.stations.length > 0) {
        const lastStation = project.stations[project.stations.length - 1];
        const swapped = swapKValues(lastStation.k1, lastStation.k2);
        setK1(swapped.k1);
        setK2(swapped.k2);
        
        // Auto-fill back point from previous station's front point
        setBackPoint(lastStation.frontPoint);
        setFrontPoint('');
      } else {
        setBackPoint('');
        setFrontPoint('');
      }
    }
  }, [project, projectId]);
  
  // Handle reading input change
  const handleReadingChange = useCallback((index: number, value: string) => {
    // Only allow digits
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = formatToFourDigits(numericValue);
    
    setReadings(prev => prev.map((r, i) => 
      i === index ? { ...r, value: formattedValue } : r
    ));
  }, []);
  
  // Calculate results when readings change
  useEffect(() => {
    if (!project) return;
    
    // Calculate accumulated distance diff from previous stations
    const accumulatedDistanceDiff = project.stations.reduce((sum, s) => sum + s.distanceDiff, 0);
    
    const result = calculateStation(
      readings,
      k1,
      k2,
      accumulatedDistanceDiff,
      project.level
    );
    
    setCalculationResults(result);
    
    // Check for errors and show modal
    if (result.errors.length > 0) {
      setErrors(result.errors);
      setShowErrorModal(true);
    }
  }, [readings, k1, k2, project]);
  
  // Validate all readings are filled
  const validateReadings = (): boolean => {
    const allFilled = readings.every(r => r.value.length === 4);
    if (!allFilled) {
      setErrors(['请完成所有读数输入']);
      setShowErrorModal(true);
      return false;
    }
    if (!backPoint.trim() || !frontPoint.trim()) {
      setErrors(['请输入后视点和前视点']);
      setShowErrorModal(true);
      return false;
    }
    if (calculationResults.errors && calculationResults.errors.length > 0) {
      setErrors(calculationResults.errors);
      setShowErrorModal(true);
      return false;
    }
    return true;
  };
  
  // Save station
  const handleSaveStation = () => {
    if (!project || !validateReadings()) return;
    
    const station: Station = {
      stationNo,
      backPoint: backPoint.trim(),
      frontPoint: frontPoint.trim(),
      readings: [...readings],
      k1,
      k2,
      backSightDistance: calculationResults.backSightDistance || 0,
      frontSightDistance: calculationResults.frontSightDistance || 0,
      distanceDiff: calculationResults.distanceDiff || 0,
      accumulatedDistanceDiff: calculationResults.accumulatedDistanceDiff || 0,
      blackRedDiffBack: calculationResults.blackRedDiffBack || 0,
      blackRedDiffFront: calculationResults.blackRedDiffFront || 0,
      heightDiffBlack: calculationResults.heightDiffBlack || 0,
      heightDiffRed: calculationResults.heightDiffRed || 0,
      heightDiffDiff: calculationResults.heightDiffDiff || 0,
      meanHeightDiff: calculationResults.meanHeightDiff || 0,
      isValid: true,
    };
    
    addStation(station);
    
    // Reset for next station
    const newStationNo = stationNo + 1;
    setStationNo(newStationNo);
    setBackPoint(frontPoint); // Auto-fill back point from current front point
    setFrontPoint('');
    setReadings(prev => prev.map(r => ({ ...r, value: '' })));
    
    // Swap K values for next station
    const swapped = swapKValues(k1, k2);
    setK1(swapped.k1);
    setK2(swapped.k2);
  };
  
  // Export to Excel
  const handleExport = () => {
    if (project) {
      exportProjectToExcel(project);
    }
  };
  
  // Navigate to station history
  const handleViewHistory = () => {
    // Scroll to history section or show in modal
    const historyElement = document.getElementById('station-history');
    historyElement?.scrollIntoView({ behavior: 'smooth' });
  };
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">工程不存在</p>
      </div>
    );
  }
  
  const labels = getReadingLabels(project.level);
  const accumulatedDistanceDiff = project.stations.reduce((sum, s) => sum + s.distanceDiff, 0);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      {/* Area A: Project Info Header */}
      <div className="bg-blue-600 text-white px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 -ml-2 rounded-lg hover:bg-blue-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold">{project.name}</h1>
            <p className="text-sm text-blue-100">
              {project.level === 'third' ? '三等水准' : '四等水准'} · 测站 #{stationNo}
            </p>
          </div>
          <button
            onClick={handleExport}
            className="p-2 rounded-lg hover:bg-blue-700"
            title="导出 Excel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Area B: Observation Points */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={backPoint}
            onChange={(e) => setBackPoint(e.target.value)}
            placeholder="后视点"
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-xl rounded-lg focus:outline-none focus:border-blue-500 text-center"
          />
          <span className="text-2xl font-bold text-gray-400">-</span>
          <input
            type="text"
            value={frontPoint}
            onChange={(e) => setFrontPoint(e.target.value)}
            placeholder="前视点"
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-xl rounded-lg focus:outline-none focus:border-blue-500 text-center"
          />
        </div>
      </div>
      
      {/* Area C: Reading Inputs */}
      <div className="p-4 space-y-3">
        {readings.map((reading, index) => (
          <div key={index} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-base font-medium text-gray-700 w-32">
                {reading.label}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={reading.value}
                onChange={(e) => handleReadingChange(index, e.target.value)}
                placeholder="0000"
                className="flex-1 mx-2 px-4 py-3 border-2 border-gray-300 text-2xl font-mono rounded-lg focus:outline-none focus:border-blue-500 text-center tracking-widest"
                maxLength={4}
              />
              <div className="w-20 text-right text-sm text-gray-500">
                mm
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Area D: K Value Configuration (only for station #1) */}
      {showKConfig && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">K 值配置</h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 border-2 border-blue-500 bg-blue-50 rounded-xl cursor-pointer">
                <input
                  type="radio"
                  name="kConfig"
                  checked={k1 === 4.687 && k2 === 4.787}
                  onChange={() => { setK1(4.687); setK2(4.787); }}
                  className="h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-base font-medium text-gray-900">
                  k1=4.687, k2=4.787
                </span>
              </label>
              <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500">
                <input
                  type="radio"
                  name="kConfig"
                  checked={k1 === 4.787 && k2 === 4.687}
                  onChange={() => { setK1(4.787); setK2(4.687); }}
                  className="h-5 w-5 text-blue-600"
                />
                <span className="ml-3 text-base font-medium text-gray-900">
                  k1=4.787, k2=4.687
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Display K values for subsequent stations */}
      {!showKConfig && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">当前 K 值</h3>
            <p className="text-base text-gray-700">
              k1=<span className="font-bold">{k1.toFixed(3)}</span>, 
              k2=<span className="font-bold">{k2.toFixed(3)}</span>
            </p>
          </div>
        </div>
      )}
      
      {/* Calculation Results Display */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">计算结果</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">后视距:</span>
              <span className="font-medium">{(calculationResults.backSightDistance || 0).toFixed(2)} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">前视距:</span>
              <span className="font-medium">{(calculationResults.frontSightDistance || 0).toFixed(2)} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">视距差:</span>
              <span className={`font-medium ${(Math.abs(calculationResults.distanceDiff || 0) > (project.level === 'third' ? 3 : 5)) ? 'text-red-600' : ''}`}>
                {(calculationResults.distanceDiff || 0).toFixed(2)} m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">累积视距差:</span>
              <span className={`font-medium ${(Math.abs(accumulatedDistanceDiff + (calculationResults.distanceDiff || 0)) > (project.level === 'third' ? 6 : 10)) ? 'text-red-600' : ''}`}>
                {(accumulatedDistanceDiff + (calculationResults.distanceDiff || 0)).toFixed(2)} m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">黑面高差:</span>
              <span className="font-medium">{(calculationResults.heightDiffBlack || 0).toFixed(1)} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">红面高差:</span>
              <span className="font-medium">{(calculationResults.heightDiffRed || 0).toFixed(1)} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">高差之差:</span>
              <span className={`font-medium ${(calculationResults.heightDiffDiff || 0) > (project.level === 'third' ? 3 : 5) ? 'text-red-600' : ''}`}>
                {(calculationResults.heightDiffDiff || 0).toFixed(1)} mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">平均高差:</span>
              <span className="font-medium">{(calculationResults.meanHeightDiff || 0).toFixed(1)} mm</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">超限警告</h3>
            </div>
            <div className="space-y-2 mb-6">
              {errors.map((error, index) => (
                <p key={index} className="text-base text-red-600">{error}</p>
              ))}
            </div>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto">
        <button
          onClick={handleSaveStation}
          className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800"
        >
          保存测站
        </button>
      </div>
      
      {/* Area F: Station History */}
      <div id="station-history" className="px-4 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">测站历史</h2>
        {project.stations.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">暂无已保存的测站</p>
          </div>
        ) : (
          <div className="space-y-2">
            {project.stations.map((station) => (
              <div
                key={station.stationNo}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      测站 #{station.stationNo}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {station.backPoint} - {station.frontPoint}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      高差：{station.heightDiffBlack.toFixed(1)} mm
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      距离：{station.backSightDistance.toFixed(1)}m / {station.frontSightDistance.toFixed(1)}m
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
