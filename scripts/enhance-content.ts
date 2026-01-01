/* eslint-disable no-console, @typescript-eslint/no-unused-vars */
/**
 * 콘텐츠 품질 개선 스크립트
 *
 * 실행: npx ts-node scripts/enhance-content.ts
 *
 * 기능:
 * 1. confusableWords 보완
 * 2. additionalExamples 보완
 * 3. 한국인 특화 오류 패턴 추가
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 한국인이 자주 혼동하는 단어 쌍
const CONFUSABLE_PAIRS: Record<string, { word: string; meaning: string; difference: string }[]> = {
  // 발음 혼동
  sheet: [{ word: 'shit', meaning: '욕설', difference: '시트/쉿의 발음 차이 주의' }],
  beach: [{ word: 'bitch', meaning: '욕설', difference: '비치/빗치의 발음 차이 주의' }],
  desk: [{ word: 'disk', meaning: '디스크', difference: 'desk는 책상, disk는 원반/저장매체' }],
  work: [{ word: 'walk', meaning: '걷다', difference: 'work(/wɜːrk/)는 일, walk(/wɔːk/)는 걷다' }],

  // 의미 혼동
  borrow: [{ word: 'lend', meaning: '빌려주다', difference: 'borrow는 빌리다, lend는 빌려주다' }],
  learn: [{ word: 'teach', meaning: '가르치다', difference: 'learn은 배우다, teach는 가르치다' }],
  say: [{ word: 'tell', meaning: '말하다', difference: 'say는 내용 전달, tell은 누구에게 전달' }],
  see: [
    {
      word: 'watch',
      meaning: '보다(집중)',
      difference: 'see는 자연히 보다, watch는 집중해서 보다',
    },
  ],
  listen: [
    {
      word: 'hear',
      meaning: '듣다(자연히)',
      difference: 'listen은 집중해서 듣다, hear는 자연히 들리다',
    },
  ],

  // 철자 혼동
  affect: [
    {
      word: 'effect',
      meaning: '효과/결과',
      difference: 'affect(동사)는 영향을 주다, effect(명사)는 효과',
    },
  ],
  accept: [
    {
      word: 'except',
      meaning: '~를 제외하고',
      difference: 'accept는 받아들이다, except는 제외하고',
    },
  ],
  lose: [
    { word: 'loose', meaning: '느슨한', difference: 'lose(/luːz/)는 잃다, loose(/luːs/)는 느슨한' },
  ],
  quite: [{ word: 'quiet', meaning: '조용한', difference: 'quite는 꽤, quiet는 조용한' }],
  dessert: [
    { word: 'desert', meaning: '사막', difference: 'dessert(ss)는 디저트, desert(s)는 사막' },
  ],
  principal: [
    { word: 'principle', meaning: '원칙', difference: 'principal은 교장/주요한, principle은 원칙' },
  ],
  stationary: [
    {
      word: 'stationery',
      meaning: '문구류',
      difference: 'stationary는 정지된, stationery는 문구류',
    },
  ],
  their: [{ word: 'there', meaning: '거기', difference: 'their는 그들의, there는 거기에' }],
  its: [{ word: "it's", meaning: 'it is의 축약', difference: "its는 그것의, it's는 it is" }],
  your: [
    { word: "you're", meaning: 'you are의 축약', difference: "your는 너의, you're는 you are" },
  ],
};

// 한국인 특화 발음 팁
const KOREAN_PRONUNCIATION_TIPS: Record<string, string> = {
  // R/L 구분
  right: "R 발음! 혀를 말지 않고 '롸잇'처럼. L과 다릅니다.",
  light: "L 발음! 혀끝을 입천장에 대고 '라잇'처럼.",
  really: "R 발음 주의! '뤼얼리'가 아닌 '뤼-얼리'처럼 혀를 말지 않고.",

  // F/P 구분
  coffee: "F 발음! 윗니로 아랫입술을 살짝 물고 '커피'가 아닌 '커f이'",
  phone: "Ph는 F 발음! '폰'이 아닌 'f온'처럼 발음",

  // TH 발음
  think: "TH 발음! 혀를 이 사이에 넣고 '씽크'가 아닌 'θ잉크'",
  this: "TH 발음! 'ð'처럼 혀를 이 사이에 넣고 진동",

  // V/B 구분
  very: "V 발음! 윗니로 아랫입술을 물고 '베리'가 아닌 'v에리'",
  video: "V 발음 주의! '비디오'가 아닌 'v이디오'",
};

// 콘텐츠 분석 함수
function analyzeContent(dataDir: string): void {
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  let totalWords = 0;
  let withConfusable = 0;
  let withExamples = 0;

  for (const level of levels) {
    const vocabDir = path.join(dataDir, level, 'vocabulary');
    if (!fs.existsSync(vocabDir)) continue;

    const files = fs.readdirSync(vocabDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(vocabDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (content.words) {
        for (const word of content.words) {
          totalWords++;
          if (word.confusableWords && word.confusableWords.length > 0) {
            withConfusable++;
          }
          if (word.additionalExamples && word.additionalExamples.length >= 2) {
            withExamples++;
          }
        }
      }
    }
  }

  console.log('\n📊 콘텐츠 분석 결과:');
  console.log(`총 단어 수: ${totalWords}`);
  console.log(
    `confusableWords 있음: ${withConfusable} (${Math.round((withConfusable / totalWords) * 100)}%)`
  );
  console.log(
    `additionalExamples 충분: ${withExamples} (${Math.round((withExamples / totalWords) * 100)}%)`
  );
}

// 메인 실행
const dataDir = path.join(__dirname, '..', 'data', 'activities');
analyzeContent(dataDir);

console.log('\n📝 개선 작업 목록:');
console.log('1. confusableWords 추가 - CONFUSABLE_PAIRS 참조');
console.log('2. 한국인 발음 팁 추가 - KOREAN_PRONUNCIATION_TIPS 참조');
console.log('3. additionalExamples 보완 필요');
console.log('\n이 스크립트는 분석만 수행합니다.');
console.log('실제 수정은 각 JSON 파일을 직접 편집하세요.');
