import React, { useState } from 'react';
import { RotateCcw, Users, Layers, ShieldCheck, QrCode, Copy, Check, Printer, X, ExternalLink } from 'lucide-react';
import { TeamSize } from '../types/ecology';

interface HeaderProps {
  groupId: string;
  studentName?: string;
  currentStepTitle: string;
  assignedQuadratId: number;
  teamSize: TeamSize;
  onChangeTeamSize?: (size: TeamSize) => void;
  onResetCommunity: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  groupId,
  studentName,
  currentStepTitle,
  assignedQuadratId,
  teamSize,
  onChangeTeamSize,
  onResetCommunity,
}) => {
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // App URL for student distribution
  const appUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('localhost')
        ? 'https://ais-pre-7bb5ifyn4zlioo7h5x6r3u-166168058440.asia-northeast1.run.app'
        : window.location.origin)
    : 'https://ais-pre-7bb5ifyn4zlioo7h5x6r3u-166168058440.asia-northeast1.run.app';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    appUrl
  )}&size=300x300&margin=10`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintQr = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>풀밭의 우점종을 찾아라 - 학생 접속용 QR코드</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 40px; }
          h1 { color: #15803d; font-size: 24px; margin-bottom: 8px; }
          p { color: #444; font-size: 15px; margin-bottom: 24px; }
          img { border: 4px solid #1c1917; padding: 12px; background: #fff; width: 280px; height: 280px; }
          .url { margin-top: 16px; font-family: monospace; font-size: 14px; color: #1e40af; font-weight: bold; }
          .guide { margin-top: 30px; font-size: 13px; color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>🌿 [풀밭의 우점종을 찾아라] 생명과학 방형구 시뮬레이션</h1>
        <p>스마트폰, 태블릿, 크롬북 카메라로 QR코드를 스캔하면 바로 접속됩니다.</p>
        <img src="${qrImageUrl}" alt="접속 QR코드" />
        <div class="url">${appUrl}</div>
        <div class="guide">
          ※ 별도의 회원가입이나 앱 설치 없이 웹 브라우저에서 바로 실행됩니다.<br/>
          ※ 같은 모둠 학생끼리 같은 모둠 번호(예: 1모둠)를 입력하여 협동 탐구를 진행하세요.
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <header className="border-b-3 border-stone-900 bg-[#252f19] text-[#f7fee7] sticky top-0 z-30 shadow-[0_2px_4px_rgba(0,0,0,0.4)] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Zone 1: Wordmark & Group Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="w-3.5 h-3.5 bg-[#84cc16] border-2 border-black inline-block shadow-[1px_1px_0px_#000]" />
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap pixel-font drop-shadow">
              풀밭의 우점종을 찾아라!
            </h1>

            {/* Group Badge */}
            <div className="flex items-center gap-1.5 bg-[#161d0f] px-2 py-1 border-2 border-[#3f4f24] shadow-[1px_1px_0px_#000]">
              <Users className="w-3.5 h-3.5 text-[#facc15]" />
              <span className="text-[11px] font-bold text-[#facc15] pixel-font">
                {groupId || '1모둠'}
              </span>
            </div>

            {/* Team Size Toggle Pill in Header */}
            <div className="hidden sm:flex items-center gap-1 bg-[#161d0f] p-1 border-2 border-[#3f4f24]">
              <span className="text-[10px] text-[#a3e635] font-bold px-1 pixel-font">규격:</span>
              {onChangeTeamSize ? (
                <div className="flex gap-1 text-[11px] font-bold pixel-font">
                  <button
                    type="button"
                    onClick={() => onChangeTeamSize(4)}
                    className={`px-1.5 py-0.5 border cursor-pointer ${
                      teamSize === 4
                        ? 'bg-[#facc15] text-black border-black font-extrabold shadow-[1px_1px_0px_#000]'
                        : 'text-[#d9f99d] border-transparent hover:bg-[#2d381c]'
                    }`}
                  >
                    4인
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeTeamSize(5)}
                    className={`px-1.5 py-0.5 border cursor-pointer ${
                      teamSize === 5
                        ? 'bg-[#facc15] text-black border-black font-extrabold shadow-[1px_1px_0px_#000]'
                        : 'text-[#d9f99d] border-transparent hover:bg-[#2d381c]'
                    }`}
                  >
                    5인
                  </button>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-[#bef264] bg-[#223311] px-1.5 py-0.5 border border-[#3f4f24] pixel-font">
                  {teamSize}인 모둠 ({teamSize}m²)
                </span>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation / Current phase guide */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-[#d9f99d] truncate pixel-font">
            <span className="text-[#86efac]">
              내 담당 #{assignedQuadratId}번 {studentName ? `(${studentName})` : ''}
            </span>
            <span aria-hidden="true" className="text-[#65a30d]">·</span>
            <span className="text-[#facc15] font-bold truncate">{currentStepTitle}</span>
          </div>

          {/* Zone 3: Actions (QR Code Distribution & Reset) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Student QR Distribution Button */}
            <button
              onClick={() => setShowQrModal(true)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] border-2 border-black pixel-btn whitespace-nowrap cursor-pointer pixel-font shadow-[2px_2px_0px_#000]"
              title="학생 배부용 QR코드 및 접속 링크 열기"
            >
              <QrCode className="w-3.5 h-3.5 text-white" />
              <span>📱 QR 배부</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={onResetCommunity}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-900 bg-[#fde047] hover:bg-[#facc15] border-2 border-black pixel-btn whitespace-nowrap cursor-pointer pixel-font shadow-[2px_2px_0px_#000]"
              title="나의 조사 및 계산 기록을 초기화합니다"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-900" />
              <span className="hidden sm:inline">초기화</span>
            </button>
          </div>
        </div>
      </header>

      {/* QR Code Distribution Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none animate-in fade-in">
          <div className="bg-[#fcfaf5] border-4 border-stone-900 shadow-[8px_8px_0px_#000] w-full max-w-md p-5 sm:p-6 space-y-4 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#0284c7] border-2 border-black flex items-center justify-center text-white">
                  <QrCode className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-stone-900 pixel-font">
                  학생 접속용 QR 코드 & 링크
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 text-stone-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Image Display */}
            <div className="flex flex-col items-center justify-center bg-white border-3 border-stone-800 p-4 shadow-[3px_3px_0px_#1c1917]">
              <img
                src={qrImageUrl}
                alt="학생 접속용 QR 코드"
                className="w-52 h-52 sm:w-60 sm:h-60 border-2 border-stone-300"
              />
              <span className="text-[11px] text-stone-600 pixel-font mt-2.5 text-center">
                교실 빔프로젝터에 띄우거나 학습지에 인쇄하여 배부하세요
              </span>
            </div>

            {/* URL Copy Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-800 pixel-font">
                접속 웹 주소 (URL):
              </label>
              <div className="flex items-center border-2 border-stone-800 bg-white">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="w-full px-2.5 py-1.5 text-xs text-stone-900 font-mono select-all outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-900 bg-[#fde047] hover:bg-[#facc15] border-l-2 border-stone-800 pixel-btn pixel-font cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '복사됨!' : '주소 복사'}</span>
                </button>
              </div>
            </div>

            {/* Classroom Usage Tip */}
            <div className="bg-[#eff6ff] border-2 border-blue-600 p-3 text-xs text-blue-950 pixel-font space-y-1">
              <strong className="text-blue-900 block flex items-center gap-1">
                <span>💡</span>
                <span>선생님 수업 팁</span>
              </strong>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-900 leading-relaxed">
                <li>별도 회원가입 없이 스마트폰/태블릿/크롬북 카메라로 바로 접속됩니다.</li>
                <li>같은 모둠 학생들은 같은 모둠명(예: 1모둠)을 입력하면 실시간으로 연동됩니다.</li>
              </ul>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-stone-300">
              <button
                type="button"
                onClick={handlePrintQr}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-800 bg-white hover:bg-stone-100 border-2 border-stone-800 pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>학습지용 인쇄</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 border-2 border-black pixel-btn pixel-font cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
