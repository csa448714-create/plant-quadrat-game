import React, { useState } from 'react';
import { PlantSpeciesId, SpeciesCommunityStat, TeamSize } from '../types/ecology';
import { PLANT_SPECIES_LIST, PLANT_SPECIES } from '../utils/communityGenerator';
import { findDominantSpecies } from '../utils/quadratMath';
import { BotanicalIcon } from './PlantIllustration';
import html2canvas from 'html2canvas';
import {
  Award,
  BarChart3,
  Lightbulb,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Users,
  Sparkles,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Copy,
  Printer,
  Download,
  Check,
  Loader2,
  ExternalLink,
  Settings,
  Link as LinkIcon,
  X,
} from 'lucide-react';

interface FinalReportStepProps {
  groupId?: string;
  studentName?: string;
  stats: Record<PlantSpeciesId, SpeciesCommunityStat>;
  assignedQuadratId: number;
  teamSize?: TeamSize;
  onRestart: () => void;
}

export const FinalReportStep: React.FC<FinalReportStepProps> = ({
  groupId = '1모둠',
  studentName = '',
  stats,
  assignedQuadratId,
  teamSize = 5,
  onRestart,
}) => {
  const [activeMetricTab, setActiveMetricTab] = useState<'iv' | 'density' | 'frequency' | 'cover'>(
    'iv'
  );
  const [openInquiryIdx, setOpenInquiryIdx] = useState<number | null>(0);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [padletUrl, setPadletUrl] = useState<string>(() => {
    return localStorage.getItem('class_padlet_url') || 'https://padlet.com';
  });
  const [showPadletModal, setShowPadletModal] = useState<boolean>(false);
  const [inputPadletUrl, setInputPadletUrl] = useState<string>(padletUrl);
  const [studentNotes, setStudentNotes] = useState<Record<number, string>>({
    0: '',
    1: '',
    2: '',
    3: '',
  });

  const showToast = (msg: string) => {
    setExportToast(msg);
    setTimeout(() => {
      setExportToast(null);
    }, 4500);
  };

  const handleSavePadletUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let trimmed = inputPadletUrl.trim();
    if (!trimmed) {
      trimmed = 'https://padlet.com';
    } else if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
    setPadletUrl(trimmed);
    setInputPadletUrl(trimmed);
    localStorage.setItem('class_padlet_url', trimmed);
    setShowPadletModal(false);
    showToast('📌 패들렛 보드 주소가 성공적으로 저장되었습니다!');
  };

  const toggleRevealAnswer = (id: number) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const dominantSpecies = findDominantSpecies(stats);

  const groupQuestions = [
    {
      id: 0,
      question: `1. 개체수가 가장 많은 종과 실제 우점종(${PLANT_SPECIES[dominantSpecies].koreanName})이 다른 이유는 무엇일까요?`,
      answer:
        `강아지풀은 개체수가 많아 상대밀도에서는 상위권이었으나, 잎이 가늘어 지표면을 덮는 피도가 낮았습니다. 반면 ${PLANT_SPECIES[dominantSpecies].koreanName}은(는) 개체수도 충분할 뿐만 아니라 둥근 잎으로 바닥을 덮는 피도와 모든 방형구에 출현하는 빈도(100%)가 매우 높아, 세 지표를 모두 합산한 중요치(IV: ${stats[dominantSpecies].importanceValue.toFixed(1)})에서 1위를 차지하여 우점종이 되었습니다.`,
    },
    {
      id: 1,
      question: `2. 방형구 1개만 조사했을 때와 ${teamSize}개를 종합했을 때 어떤 차이가 있을까요?`,
      answer:
        `방형구 1개만 조사하면 우연히 그 자리에 많이 자라던 종만 높게 측정되어 군집 전체의 특성을 심각하게 왜곡할 수 있습니다. 무작위로 선정된 ${teamSize}개의 방형구를 골고루 합산하여 조사함으로써 우연에 의한 표본 오차(Sampling error)를 획기적으로 줄이고 전체 풀밭의 신뢰할 수 있는 평균치를 얻을 수 있습니다.`,
    },
    {
      id: 2,
      question: '3. 피도(지상부 투영 면적)가 중요치와 군집 외관에 미치는 생태적 의미는 무엇일까요?',
      answer:
        '식물 군집에서 햇빛을 흡수하고 군집의 물리적 외관(경관)을 지배하는 데는 개체의 머릿수보다 식물체가 지표면을 덮는 면적(피도)이 결정적인 역할을 합니다. 중요치에 피도가 포함되는 이유도 군집 내 실질적 점유 면적을 반영하기 위함입니다.',
    },
    {
      id: 3,
      question: `4. ${teamSize}인 1모둠으로 각자 방형구를 분담하여 조사했을 때의 과학 탐구적 장점은 무엇일까요?`,
      answer:
        `혼자서 ${teamSize}개의 방형구를 모두 조사하려면 시간이 오래 걸리고 집중력이 흐려질 수 있습니다. 모둠원 ${teamSize}명이 1개씩 분담하여 정밀하게 조사한 뒤 자료를 종합하면, 조사 시간을 획기적으로 단축하면서도 높은 정확도와 협동적 과학 탐구 능력을 기를 수 있습니다.`,
    },
  ];

  // Export to Microsoft Word (.doc)
  const handleExportWord = () => {
    const dateStr = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const tableRows = PLANT_SPECIES_LIST.map(spec => {
      const s = stats[spec.id];
      const isDom = spec.id === dominantSpecies;
      return `
        <tr style="text-align: center; ${isDom ? 'background-color: #fef08a; font-weight: bold;' : ''}">
          <td style="padding: 8px; border: 1px solid #999;">${spec.koreanName} (${spec.scientificName}) ${isDom ? '★우점종' : ''}</td>
          <td style="padding: 8px; border: 1px solid #999;">${s.totalCount}</td>
          <td style="padding: 8px; border: 1px solid #999;">${s.quadratOccurrences}</td>
          <td style="padding: 8px; border: 1px solid #999;">${(s.cover * teamSize).toFixed(1)}%</td>
          <td style="padding: 8px; border: 1px solid #999;">${s.density.toFixed(1)}</td>
          <td style="padding: 8px; border: 1px solid #999;">${s.frequency.toFixed(1)}%</td>
          <td style="padding: 8px; border: 1px solid #999;">${s.cover.toFixed(1)}%</td>
          <td style="padding: 8px; border: 1px solid #999;">${s.relativeDensity.toFixed(1)}%</td>
          <td style="padding: 8px; border: 1px solid #999;">${s.relativeFrequency.toFixed(1)}%</td>
          <td style="padding: 8px; border: 1px solid #999;">${s.relativeCover.toFixed(1)}%</td>
          <td style="padding: 8px; border: 1px solid #999; color: #b45309;">${s.importanceValue.toFixed(1)}</td>
        </tr>
      `;
    }).join('');

    const inquiryItems = groupQuestions.map((q, idx) => {
      const studentAnswer = (studentNotes[q.id] || '').trim() || '(모둠 토의 완료 / 내용 미입력)';
      return `
        <div style="margin-bottom: 20px; padding: 14px; background-color: #f9f9f9; border-left: 5px solid #15803d; border: 1px solid #e5e7eb;">
          <h4 style="margin: 0 0 10px 0; color: #1c1917; font-size: 14px; font-weight: bold;">Q${idx + 1}. ${q.question}</h4>
          <div style="margin-bottom: 10px; padding: 10px; background-color: #ffffff; border: 1px solid #cbd5e1;">
            <strong style="color: #047857; font-size: 13px;">[우리 모둠의 생각 작성 내용]</strong>
            <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.6; color: #1e293b;">${studentAnswer.replace(/\n/g, '<br/>')}</p>
          </div>
          <div style="padding: 10px; background-color: #f0fdf4; border: 1px solid #86efac;">
            <strong style="color: #15803d; font-size: 12px;">[생명과학 교과서 모범 해설]</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; line-height: 1.5; color: #374151;">${q.answer}</p>
          </div>
        </div>
      `;
    }).join('');

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${groupId} 풀밭 생태 조사 보고서</title>
        <style>
          body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; line-height: 1.6; color: #222; margin: 30px; }
          h1 { color: #14532d; font-size: 22px; border-bottom: 2px solid #15803d; padding-bottom: 8px; }
          h2 { color: #166534; font-size: 16px; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th { background-color: #242b18; color: #ffffff; padding: 8px; border: 1px solid #666; }
        </style>
      </head>
      <body>
        <h1>🌿 [풀밭의 우점종을 찾아라] 생명과학 모둠 탐구활동 보고서</h1>
        
        <table style="width: 100%; margin-bottom: 20px; font-size: 13px; border: 1px solid #bbb;">
          <tr style="background-color: #f3f4f6;">
            <td style="padding: 8px 12px; font-weight: bold; width: 18%;">모둠명</td>
            <td style="padding: 8px 12px; width: 32%;">${groupId}</td>
            <td style="padding: 8px 12px; font-weight: bold; width: 18%;">작성자 / 담당</td>
            <td style="padding: 8px 12px; width: 32%;">${studentName || '모둠원'} (담당 방형구: #${assignedQuadratId}번)</td>
          </tr>
          <tr style="background-color: #ffffff;">
            <td style="padding: 8px 12px; font-weight: bold;">조사 대상</td>
            <td style="padding: 8px 12px;">풀밭 식물 군집 (토끼풀, 민들레, 제비꽃, 강아지풀)</td>
            <td style="padding: 8px 12px; font-weight: bold;">조사 규모</td>
            <td style="padding: 8px 12px;">총 ${teamSize}개 방형구 (${teamSize}m² 협동 관측)</td>
          </tr>
          <tr style="background-color: #f3f4f6;">
            <td style="padding: 8px 12px; font-weight: bold;">작성 일시</td>
            <td style="padding: 8px 12px;">${dateStr}</td>
            <td style="padding: 8px 12px; font-weight: bold;">최종 우점종</td>
            <td style="padding: 8px 12px; font-weight: bold; color: #b45309;">${PLANT_SPECIES[dominantSpecies].koreanName} (중요치: ${stats[dominantSpecies].importanceValue.toFixed(1)})</td>
          </tr>
        </table>

        <h2>1. 식물 군집 분석표 (종합 조사 및 계산 결과)</h2>
        <table>
          <thead>
            <tr>
              <th>식물종</th>
              <th>총개체수</th>
              <th>출현방형구</th>
              <th>피도합</th>
              <th>밀도(개체/m²)</th>
              <th>빈도(%)</th>
              <th>피도(%)</th>
              <th>상대밀도(%)</th>
              <th>상대빈도(%)</th>
              <th>상대피도(%)</th>
              <th>중요치(IV)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <h2>2. 협동 탐구 토론 내용 및 모둠 작성 내용</h2>
        <p style="font-size: 12px; color: #666; margin-bottom: 12px;">
          ※ 모둠원들과 토의한 생각과 교과서 모범 해설을 대조하여 정리한 탐구 기록입니다.
        </p>
        ${inquiryItems}

        <div style="margin-top: 30px; padding: 12px; background-color: #fcfaf5; border: 1px dashed #999; font-size: 11px; color: #666; text-align: center;">
          고등학교 생명과학 협동 방형구법 시뮬레이션 · [풀밭의 우점종을 찾아라!] 탐구 보고서
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${groupId}_생명과학_탐구토론_보고서.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📄 워드 문서(.doc)가 저장되었습니다! 구글 클래스룸에 과제로 첨부하세요.');
  };

  // Export to Image (.png) via html2canvas
  const handleExportImage = async () => {
    const el = document.getElementById('report-export-area');
    if (!el) return;
    setIsExportingImage(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#eef0e5',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `${groupId}_풀밭_생태탐구토론_보고서.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('🖼️ 보고서 이미지(.png)가 저장되었습니다! 구글 클래스룸에 과제로 첨부하세요.');
    } catch (err) {
      console.error('Image export failed:', err);
      alert('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsExportingImage(false);
    }
  };

  // Copy plain formatted discussion text to clipboard (Inquiry discussion notes only, no quadrat calculation data)
  const handleCopyReportText = (forPadlet: boolean = false) => {
    let text = `[🌿 ${groupId} 협동 탐구 토론 내용]\n`;
    text += `• 작성 학생: ${studentName || '모둠원'} (담당 방형구: #${assignedQuadratId}번)\n`;
    text += `• 풀밭 우점종: ${PLANT_SPECIES[dominantSpecies].koreanName}\n`;
    text += `=========================================\n\n`;

    groupQuestions.forEach((q, idx) => {
      const studentAns =
        (studentNotes[q.id] || '').trim() || '(모둠 구두 토의 완료 / 작성 내용 없음)';
      text += `Q${idx + 1}. ${q.question}\n`;
      text += `▶ 우리 모둠의 생각:\n${studentAns}\n\n`;
    });

    navigator.clipboard.writeText(text.trim());
    if (forPadlet) {
      showToast('📌 패들렛으로 이동합니다! 모둠 토론 내용만 자동 복사되었습니다 (방형구 계산 내용 제외)');
    } else {
      showToast('📋 모둠 토론 내용만 복사되었습니다! (방형구 계산 내용 제외)');
    }
  };

  // Trigger browser print preview
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 select-none">
      {/* Classroom / Padlet Export Toolbar */}
      <div className="bg-[#fcfaf5] p-5 border-4 border-stone-900 shadow-[6px_6px_0px_#1c1917] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-800" />
            <h3 className="text-base font-bold text-stone-900 pixel-font">
              [모둠 보고서 내보내기] 구글 클래스룸 · 패들렛 과제 제출용 변환
            </h3>
          </div>
          <span className="text-xs text-stone-500 pixel-font">
            워드(.doc), 이미지(.png), 토론 내용 복사 및 패들렛 바로가기로 간편하게 업로드하세요!
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportWord}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#1e40af] hover:bg-[#1d4ed8] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <FileText className="w-4 h-4" />
            <span>📄 워드 문서(.doc)로 저장</span>
          </button>

          <button
            type="button"
            disabled={isExportingImage}
            onClick={handleExportImage}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#065f46] hover:bg-[#047857] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000] disabled:opacity-50"
          >
            {isExportingImage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            <span>🖼️ 보고서 이미지(.png)로 저장</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopyReportText(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-stone-900 bg-[#fef08a] hover:bg-[#fde047] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
            title="방형구 계산값 없이 협동 탐구 토론 작성 내용만 복사합니다"
          >
            <Copy className="w-4 h-4" />
            <span>📋 토론 내용 복사</span>
          </button>

          {/* Padlet Quick Launch Button & Config */}
          <div className="flex items-center gap-1">
            <a
              href={padletUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleCopyReportText(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#ea580c] hover:bg-[#c2410c] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
              title="클릭 시 모둠 토론 내용만 자동 복사되며 패들렛 새 탭이 열립니다"
            >
              <ExternalLink className="w-4 h-4" />
              <span>📌 패들렛 바로가기 ↗</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setInputPadletUrl(padletUrl);
                setShowPadletModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-2.5 text-xs font-bold text-stone-800 bg-[#e7e5e4] hover:bg-[#d6d3d1] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
              title="우리 반 패들렛 링크(URL) 변경"
            >
              <Settings className="w-4 h-4 text-stone-700" />
              <span className="hidden sm:inline">설정</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-stone-800 bg-white hover:bg-stone-100 border-2 border-stone-800 pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ 인쇄 / PDF 저장</span>
          </button>
        </div>
      </div>

      {/* Main Report Container (Target for html2canvas export) */}
      <div id="report-export-area" className="space-y-6">
        {/* Top Banner (Retro RPG Quest Completion) */}
        <div className="bg-[#242b18] text-white p-6 border-4 border-stone-900 shadow-[6px_6px_0px_#1c1917] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#3f4f24] pb-3">
            <div className="flex items-center gap-2.5">
              <Users className="w-6 h-6 text-[#bef264]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#facc15] pixel-font">
                ★ [{groupId} · {teamSize}인 모둠 협동 탐구] 풀밭 식물 군집 종합 분석 리포트 ★
              </h2>
            </div>
            <span className="text-xs font-bold text-[#052e16] bg-[#86efac] border border-black px-2.5 py-1 pixel-font">
              내 담당: #{assignedQuadratId}번 {studentName ? `(${studentName})` : ''}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#d9f99d] leading-relaxed pixel-font">
            모둠원 {teamSize}명이 무작위로 선정된 {teamSize}개 방형구 조사를 마친 후 종합한 최종 결과입니다.
            이 풀밭 군집의 생태학적 특성과 중요치 산출 결과를 검토해 보세요.
          </p>

          {/* Dominant Species Golden RPG Card */}
          <div className="bg-[#fefce8] border-3 border-amber-600 p-4 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-950">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-[#facc15] border-2 border-black flex items-center justify-center text-stone-950 shadow-[2px_2px_0px_#000]">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-800 pixel-font block">
                  ★ 풀밭 군집의 최종 우점종(Dominant Species)
                </span>
                <h3 className="text-lg font-bold text-stone-900 pixel-font flex items-center gap-2">
                  <span>{PLANT_SPECIES[dominantSpecies].koreanName}</span>
                  <span className="text-xs text-stone-500 font-serif italic">
                    ({PLANT_SPECIES[dominantSpecies].scientificName})
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#fef9c3] p-2 border-2 border-amber-500 pixel-font text-xs">
              <span className="text-stone-700">최종 중요치:</span>
              <span className="text-base font-extrabold text-[#b45309] font-mono">
                {stats[dominantSpecies].importanceValue.toFixed(1)}
              </span>
              <span className="text-[10px] text-stone-500">/ 300</span>
            </div>
          </div>
        </div>

      {/* Interactive Comparative Bar Graph */}
      <div className="bg-[#fcfaf5] p-5 border-4 border-stone-900 shadow-[5px_5px_0px_#1c1917] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-800" />
            <h3 className="text-base font-bold text-stone-900 pixel-font">
              식물 4종의 생태 지표 비교 차트
            </h3>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#1a1e12] p-1 border-2 border-black">
            {[
              { key: 'iv', label: '중요치 (IV)' },
              { key: 'density', label: '밀도 (개체/m²)' },
              { key: 'frequency', label: '빈도 (%)' },
              { key: 'cover', label: '피도 (%)' },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveMetricTab(tab.key as any)}
                className={`px-2.5 py-1 text-xs font-bold pixel-font cursor-pointer border ${
                  activeMetricTab === tab.key
                    ? 'bg-[#facc15] text-black border-black shadow-[1px_1px_0px_#000]'
                    : 'text-[#d9f99d] border-transparent hover:bg-[#2e3b1c]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="space-y-3 pt-2">
          {PLANT_SPECIES_LIST.map(spec => {
            const stat = stats[spec.id];
            let rawVal = 0;
            let displayVal = '';
            let maxRef = 100;

            if (activeMetricTab === 'iv') {
              rawVal = stat.importanceValue;
              displayVal = `${stat.importanceValue.toFixed(1)} (상대밀도 ${stat.relativeDensity.toFixed(1)}% + 상대빈도 ${stat.relativeFrequency.toFixed(1)}% + 상대피도 ${stat.relativeCover.toFixed(1)}%)`;
              maxRef = 150; // max reasonable IV scale
            } else if (activeMetricTab === 'density') {
              rawVal = stat.density;
              displayVal = `${stat.density.toFixed(1)} 개체/m² (총 ${stat.totalCount}개체)`;
              maxRef = 5;
            } else if (activeMetricTab === 'frequency') {
              rawVal = stat.frequency;
              displayVal = `${stat.frequency.toFixed(1)}% (${stat.quadratOccurrences}개 방형구 출현)`;
              maxRef = 100;
            } else if (activeMetricTab === 'cover') {
              rawVal = stat.cover;
              displayVal = `${stat.cover.toFixed(1)}% (지표면 피복율)`;
              maxRef = 15;
            }

            const barPct = Math.min(100, Math.max(5, (rawVal / maxRef) * 100));
            const isDom = spec.id === dominantSpecies;

            return (
              <div key={spec.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs pixel-font">
                  <div className="flex items-center gap-2">
                    <BotanicalIcon species={spec.id} size={24} />
                    <span className="font-bold text-stone-900">
                      {spec.koreanName}
                      {isDom && <span className="ml-1.5 text-amber-700 font-extrabold">[우점종]</span>}
                    </span>
                  </div>
                  <span className="font-mono text-stone-600 text-[11px]">{displayVal}</span>
                </div>

                <div className="w-full h-5 bg-[#e7e5e4] border-2 border-stone-800 overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isDom ? 'bg-[#ca8a04]' : 'bg-[#15803d]'
                    }`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Group Inquiry Discussion Accordion Questions */}
      <div className="bg-[#fcfaf5] p-5 border-4 border-stone-900 shadow-[5px_5px_0px_#1c1917] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-stone-800 pb-2">
          <div className="flex items-center gap-2 text-stone-900 font-bold">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold pixel-font">
              [협동 탐구 토론] 모둠원과 함께 나누는 4가지 생태 질문
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 pixel-font">
              토론 완료 후 패들렛에 공유하세요
            </span>
          </div>
        </div>

        {/* Padlet Guidance Banner */}
        <div className="bg-[#fff7ed] border-2 border-orange-400 p-3 text-xs text-orange-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pixel-font">
          <div className="flex items-center gap-2">
            <span className="text-base">📌</span>
            <span>
              <strong>패들렛(Padlet) 업로드 안내:</strong> 모둠 토론을 작성한 후 <strong>[📌 패들렛 바로가기]</strong>를 누르면 <strong>협동 탐구 토론 작성 내용만</strong> 자동 복사되어 패들렛에 <code>Ctrl+V</code>로 바로 게시할 수 있습니다. (방형구 계산 내용은 제외됩니다)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setInputPadletUrl(padletUrl);
              setShowPadletModal(true);
            }}
            className="text-[11px] underline text-orange-800 hover:text-black font-bold shrink-0 cursor-pointer text-left sm:text-right"
          >
            [연결 보드: {padletUrl.replace(/^https?:\/\//, '').slice(0, 24)}...]
          </button>
        </div>

        <div className="space-y-3">
          {groupQuestions.map(q => {
            const isOpen = openInquiryIdx === q.id;

            return (
              <div
                key={q.id}
                className="border-2 border-stone-800 bg-white shadow-[2px_2px_0px_#1c1917] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenInquiryIdx(isOpen ? null : q.id)}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-stone-50 cursor-pointer bg-stone-100/70"
                >
                  <span className="text-xs sm:text-sm font-bold text-stone-900 pixel-font">
                    {q.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-stone-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-600 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white border-t-2 border-stone-800 space-y-3 pixel-font animate-in fade-in">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        우리 모둠의 생각 작성하기:
                      </label>
                      <textarea
                        rows={2}
                        value={studentNotes[q.id] || ''}
                        onChange={e =>
                          setStudentNotes(prev => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="모둠원들과 토의한 내용을 간략히 적어보세요..."
                        className="w-full p-2 border-2 border-stone-700 text-xs bg-[#fafaf9] focus:outline-emerald-600"
                      />
                    </div>

                    {/* Model Answer Reveal Toggle */}
                    <div className="pt-1">
                      {!revealedAnswers[q.id] ? (
                        <button
                          type="button"
                          onClick={() => toggleRevealAnswer(q.id)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-950 bg-[#dcfce7] hover:bg-[#bbf7d0] border-2 border-stone-800 pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-700" />
                          <span>📖 생명과학 교과서 모범 해설 확인하기 (클릭)</span>
                        </button>
                      ) : (
                        <div className="bg-[#f0fdf4] border-2 border-emerald-700 p-3.5 text-xs text-emerald-950 space-y-2 animate-in fade-in">
                          <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                            <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>생명과학 교과서 모범 해설:</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => toggleRevealAnswer(q.id)}
                              className="text-[11px] text-emerald-800 hover:text-black font-bold pixel-font flex items-center gap-1 cursor-pointer"
                            >
                              <EyeOff className="w-3 h-3" />
                              <span>해설 접기 ✕</span>
                            </button>
                          </div>
                          <p className="leading-relaxed text-stone-800">{q.answer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>

      {/* Bottom Action & Export Bar */}
      <div className="bg-[#fcfaf5] p-5 border-4 border-stone-900 shadow-[6px_6px_0px_#1c1917] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#1e40af] hover:bg-[#1d4ed8] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>워드(.doc) 다운로드</span>
          </button>

          <button
            type="button"
            disabled={isExportingImage}
            onClick={handleExportImage}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#065f46] hover:bg-[#047857] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000] disabled:opacity-50"
          >
            {isExportingImage ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5" />
            )}
            <span>이미지(.png) 저장</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopyReportText(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-900 bg-[#fef08a] hover:bg-[#fde047] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
            title="방형구 계산값 없이 협동 탐구 토론 작성 내용만 복사합니다"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>토론 내용 복사</span>
          </button>

          <a
            href={padletUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleCopyReportText(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#ea580c] hover:bg-[#c2410c] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
            title="클릭 시 모둠 토론 내용만 자동 복사되며 패들렛 새 탭이 열립니다"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>📌 패들렛 바로가기 ↗</span>
          </a>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs border-2 border-black pixel-btn cursor-pointer pixel-font shadow-[2px_2px_0px_#000]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>새 모둠 조사 시작하기</span>
        </button>
      </div>

      {/* Padlet URL Setting Modal */}
      {showPadletModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#fcfaf5] border-4 border-stone-900 shadow-[8px_8px_0px_#000] max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📌</span>
                <h3 className="font-bold text-stone-900 pixel-font text-sm sm:text-base">
                  우리 반 패들렛(Padlet) 링크 설정
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPadletModal(false)}
                className="p-1 text-stone-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed pixel-font">
              선생님께서 안내해주신 우리 반의 <strong>패들렛 보드 URL</strong>을 입력해주세요.
              설정해 두시면 [패들렛 바로가기] 클릭 시 해당 게시판으로 곧바로 연결됩니다.
            </p>

            <form onSubmit={handleSavePadletUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 pixel-font">
                  패들렛 주소(URL):
                </label>
                <div className="flex items-center border-2 border-stone-800 bg-white">
                  <span className="px-2.5 py-1.5 text-stone-400 bg-stone-100 border-r border-stone-300">
                    <LinkIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={inputPadletUrl}
                    onChange={e => setInputPadletUrl(e.target.value)}
                    placeholder="https://padlet.com/..."
                    className="w-full px-2.5 py-1.5 text-xs text-stone-900 font-mono outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputPadletUrl('https://padlet.com')}
                  className="text-[11px] text-stone-600 hover:text-stone-900 underline pixel-font cursor-pointer"
                >
                  기본값으로 되돌리기 (padlet.com)
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-300">
                <button
                  type="button"
                  onClick={() => setShowPadletModal(false)}
                  className="px-3.5 py-2 text-xs font-bold text-stone-700 bg-stone-200 hover:bg-stone-300 border-2 border-stone-800 pixel-btn pixel-font cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#ea580c] hover:bg-[#c2410c] border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Export Toast Notification */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#14532d] text-white px-4 py-3 border-3 border-black shadow-[5px_5px_0px_#000] flex items-center gap-2.5 text-xs font-bold pixel-font animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-[#bef264] stroke-[3]" />
          <span>{exportToast}</span>
        </div>
      )}
    </div>
  );
};
