/* global __dirname */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// B2 Lesson 1 - Academic English
const b2l1 = {
  "id": "b2-u1-l1",
  "unitId": "b2-u1",
  "levelId": "b2",
  "lessonNumber": 1,
  "title": "Academic English",
  "titleKo": "학술 영어",
  "subtitle": "Master academic vocabulary and structures",
  "subtitleKo": "학술 어휘와 구조 마스터하기",
  "theme": "academic",
  "estimatedMinutes": 20,
  "keyPhrasesCount": 15,
  "prerequisites": [],
  "activityTypes": ["vocabulary", "grammar", "listening", "reading", "speaking", "writing"],
  "weekMapping": "week-1",
  "objectives": [
    "Use formal academic language",
    "Understand research paper structures",
    "Present academic findings"
  ],
  "objectivesKo": [
    "격식체 학술 언어 사용하기",
    "연구 논문 구조 이해하기",
    "학술 발견 발표하기"
  ],
  "keyPhrases": [
    {
      "phrase": "This study demonstrates that...",
      "meaning": "이 연구는 ...을 보여줍니다",
      "pronunciation": { "ipa": "/ðɪs ˈstʌdi ˈdemənstreɪts ðæt/", "korean": "디스 스터디 데먼스트레이츠 댓" },
      "context": "연구 결과를 소개할 때 사용",
      "formalLevel": "formal",
      "koreanTip": "demonstrates의 t와 s를 분명히 발음하세요.",
      "commonMistakes": "shows that보다 더 학술적이므로 논문에서는 이 표현을 선호합니다",
      "example": { "A": "What are the main findings of your research?", "B": "This study demonstrates that early intervention significantly improves outcomes." },
      "relatedPhrases": ["This research indicates that...", "The evidence suggests that...", "Our findings reveal that..."]
    },
    {
      "phrase": "The findings suggest...",
      "meaning": "연구 결과에 따르면...",
      "pronunciation": { "ipa": "/ðə ˈfaɪndɪŋz səˈdʒest/", "korean": "더 파인딩즈 서제스트" },
      "context": "연구 결과를 조심스럽게 해석할 때",
      "formalLevel": "formal",
      "koreanTip": "suggest는 제안하다보다 시사하다의 의미로 사용됩니다.",
      "example": { "A": "Can you summarize your conclusions?", "B": "The findings suggest a strong correlation between diet and cognitive function." },
      "relatedPhrases": ["The results indicate...", "The data implies...", "The evidence points to..."]
    },
    {
      "phrase": "As illustrated in Figure 1...",
      "meaning": "그림 1에 나타난 바와 같이...",
      "pronunciation": { "ipa": "/æz ˈɪləstreɪtɪd ɪn ˈfɪɡjər wʌn/", "korean": "애즈 일러스트레이티드 인 피겨 원" },
      "context": "시각 자료를 참조할 때",
      "formalLevel": "formal",
      "koreanTip": "illustrated에서 마지막 d는 가볍게 발음하세요.",
      "example": { "A": "How did the temperature change over time?", "B": "As illustrated in Figure 1, the temperature increased steadily throughout the experiment." },
      "relatedPhrases": ["As shown in Table 2...", "As depicted in the diagram...", "The graph demonstrates..."]
    },
    {
      "phrase": "The hypothesis was supported by...",
      "meaning": "가설은 ...에 의해 뒷받침됨",
      "pronunciation": { "ipa": "/ðə haɪˈpɑːθəsɪs wɒz səˈpɔːtɪd baɪ/", "korean": "더 하이파서시스 워즈 서포티드 바이" },
      "context": "가설 검증 결과를 설명할 때",
      "formalLevel": "formal",
      "koreanTip": "hypothesis의 강세는 두 번째 음절에 있습니다.",
      "commonMistakes": "hypothesis를 복수형 hypotheses와 혼동하지 마세요",
      "example": { "A": "Was your initial prediction correct?", "B": "Yes, the hypothesis was supported by experimental data from three independent trials." },
      "relatedPhrases": ["The theory was validated by...", "Evidence confirms that...", "The results corroborate..."]
    },
    {
      "phrase": "Further research is needed...",
      "meaning": "추가 연구가 필요합니다",
      "pronunciation": { "ipa": "/ˈfɜːðər rɪˈsɜːtʃ ɪz ˈniːdɪd/", "korean": "퍼더 리서치 이즈 니디드" },
      "context": "연구의 한계를 인정하고 후속 연구를 제안할 때",
      "formalLevel": "formal",
      "koreanTip": "further와 farther를 구분하세요. 학술적 맥락에서는 항상 further를 사용합니다.",
      "example": { "A": "Are there any limitations to your study?", "B": "Yes, further research is needed to determine the long-term effects of the treatment." },
      "relatedPhrases": ["Additional studies are required...", "More investigation is warranted...", "Future work should explore..."]
    },
    {
      "phrase": "In conclusion, we can state...",
      "meaning": "결론적으로 말할 수 있는 것은...",
      "pronunciation": { "ipa": "/ɪn kənˈkluːʒən wiː kæn steɪt/", "korean": "인 컨클루전 위 캔 스테이트" },
      "context": "논문이나 발표의 결론 부분",
      "formalLevel": "formal",
      "koreanTip": "conclusion의 s는 zh 소리로 발음됩니다.",
      "example": { "A": "What is your final assessment?", "B": "In conclusion, we can state that the new methodology significantly improves accuracy." },
      "relatedPhrases": ["To summarize...", "In summary...", "To conclude..."]
    },
    {
      "phrase": "It is widely accepted that...",
      "meaning": "...은 널리 받아들여지고 있습니다",
      "pronunciation": { "ipa": "/ɪt ɪz ˈwaɪdli əkˈseptɪd ðæt/", "korean": "잇 이즈 와이들리 억셉티드 댓" },
      "context": "일반적으로 인정되는 사실을 언급할 때",
      "formalLevel": "formal",
      "koreanTip": "widely에서 ly를 명확히 발음하세요.",
      "example": { "A": "Is there scientific consensus on this topic?", "B": "It is widely accepted that climate change affects global weather patterns." },
      "relatedPhrases": ["It is generally acknowledged that...", "There is consensus that...", "Scholars agree that..."]
    },
    {
      "phrase": "The methodology employed...",
      "meaning": "사용된 방법론은...",
      "pronunciation": { "ipa": "/ðə ˌmeθəˈdɒlədʒi ɪmˈplɔɪd/", "korean": "더 메서돌러지 임플로이드" },
      "context": "연구 방법을 설명할 때",
      "formalLevel": "formal",
      "koreanTip": "methodology는 4음절로 발음하며, 강세는 세 번째 음절에 있습니다.",
      "commonMistakes": "method와 methodology는 다릅니다. methodology는 전체적인 연구 접근법을 의미합니다",
      "example": { "A": "How did you conduct this research?", "B": "The methodology employed included both quantitative and qualitative analysis." },
      "relatedPhrases": ["The approach utilized...", "The research design...", "The procedures followed..."]
    },
    {
      "phrase": "According to the literature...",
      "meaning": "문헌에 따르면...",
      "pronunciation": { "ipa": "/əˈkɔːdɪŋ tuː ðə ˈlɪtrətʃər/", "korean": "어코딩 투 더 리터러처" },
      "context": "기존 연구를 인용할 때",
      "formalLevel": "formal",
      "koreanTip": "literature는 학술적 맥락에서 문학이 아닌 학술 문헌을 의미합니다.",
      "example": { "A": "What do previous studies say about this?", "B": "According to the literature, this phenomenon has been documented since the 1990s." },
      "relatedPhrases": ["Previous studies have shown...", "As documented in prior research...", "The existing body of work suggests..."]
    },
    {
      "phrase": "A significant correlation was found...",
      "meaning": "유의미한 상관관계가 발견되었습니다",
      "pronunciation": { "ipa": "/ə sɪɡˈnɪfɪkənt ˌkɒrəˈleɪʃən wɒz faʊnd/", "korean": "어 시그니피컨트 코럴레이션 워즈 파운드" },
      "context": "통계적 결과를 보고할 때",
      "formalLevel": "formal",
      "koreanTip": "significant는 통계학에서 중요한보다 통계적으로 유의미한을 의미합니다.",
      "commonMistakes": "correlation과 causation을 혼동하지 마세요",
      "example": { "A": "Did you find any relationship between the variables?", "B": "A significant correlation was found between exercise frequency and mental health scores." },
      "relatedPhrases": ["The variables were positively correlated...", "A strong relationship exists between...", "Statistical analysis revealed..."]
    },
    {
      "phrase": "The scope of this study...",
      "meaning": "이 연구의 범위는...",
      "pronunciation": { "ipa": "/ðə skəʊp ɒv ðɪs ˈstʌdi/", "korean": "더 스코프 오브 디스 스터디" },
      "context": "연구 범위를 정의할 때",
      "formalLevel": "formal",
      "koreanTip": "scope는 범위뿐만 아니라 연구의 한계를 설정할 때도 사용됩니다.",
      "example": { "A": "What aspects does your research cover?", "B": "The scope of this study is limited to urban populations in developed countries." },
      "relatedPhrases": ["This paper focuses on...", "The boundaries of this research...", "The study is limited to..."]
    },
    {
      "phrase": "The implications of these findings...",
      "meaning": "이 발견들의 함의는...",
      "pronunciation": { "ipa": "/ðə ˌɪmplɪˈkeɪʃənz ɒv ðiːz ˈfaɪndɪŋz/", "korean": "디 임플리케이션즈 오브 디즈 파인딩즈" },
      "context": "연구 결과의 의미를 설명할 때",
      "formalLevel": "formal",
      "koreanTip": "implications은 영향보다 더 넓은 의미로, 결과가 가져올 수 있는 모든 파급효과를 포함합니다.",
      "example": { "A": "Why is this research important?", "B": "The implications of these findings extend to both policy-making and clinical practice." },
      "relatedPhrases": ["The practical applications...", "This has significant consequences for...", "The broader impact..."]
    },
    {
      "phrase": "It can be argued that...",
      "meaning": "...라고 주장할 수 있습니다",
      "pronunciation": { "ipa": "/ɪt kæn biː ˈɑːɡjuːd ðæt/", "korean": "잇 캔 비 아규드 댓" },
      "context": "논점을 제시할 때",
      "formalLevel": "formal",
      "koreanTip": "수동태 구문으로 객관성을 높이는 학술적 표현입니다.",
      "example": { "A": "What is your interpretation of the results?", "B": "It can be argued that the traditional approach is no longer effective." },
      "relatedPhrases": ["One could posit that...", "There is reason to believe...", "It is plausible that..."]
    },
    {
      "phrase": "The data was analyzed using...",
      "meaning": "데이터는 ...을 사용하여 분석되었습니다",
      "pronunciation": { "ipa": "/ðə ˈdeɪtə wɒz ˈænəlaɪzd ˈjuːzɪŋ/", "korean": "더 데이터 워즈 애널라이즈드 유징" },
      "context": "분석 방법을 설명할 때",
      "formalLevel": "formal",
      "koreanTip": "영국식은 data를 복수로 취급하여 data were라고 쓰지만, 미국식은 data was를 허용합니다.",
      "commonMistakes": "analysed (영국식)와 analyzed (미국식) 철자 차이에 주의하세요",
      "example": { "A": "What statistical tools did you use?", "B": "The data was analyzed using SPSS software with a 95% confidence interval." },
      "relatedPhrases": ["Statistical analysis was performed using...", "We employed...for analysis", "The dataset was processed with..."]
    },
    {
      "phrase": "Notwithstanding these limitations...",
      "meaning": "이러한 한계에도 불구하고...",
      "pronunciation": { "ipa": "/ˌnɒtwɪθˈstændɪŋ ðiːz ˌlɪmɪˈteɪʃənz/", "korean": "낫위드스탠딩 디즈 리미테이션즈" },
      "context": "연구 한계를 인정하면서도 가치를 강조할 때",
      "formalLevel": "formal",
      "koreanTip": "despite보다 더 격식체인 표현입니다. 학술 논문에서 자주 사용됩니다.",
      "example": { "A": "Your sample size seems small.", "B": "Notwithstanding these limitations, the study provides valuable insights into the phenomenon." },
      "relatedPhrases": ["Despite these constraints...", "In spite of these shortcomings...", "Even with these caveats..."]
    }
  ]
};

// B2 Lesson 2 - Technical Writing
const b2l2 = {
  "id": "b2-u1-l2",
  "unitId": "b2-u1",
  "levelId": "b2",
  "lessonNumber": 2,
  "title": "Technical Writing",
  "titleKo": "기술 문서",
  "subtitle": "Write clear technical documentation",
  "subtitleKo": "명확한 기술 문서 작성하기",
  "theme": "technical",
  "estimatedMinutes": 20,
  "keyPhrasesCount": 15,
  "prerequisites": ["b2-u1-l1"],
  "activityTypes": ["vocabulary", "grammar", "listening", "reading", "speaking", "writing"],
  "weekMapping": "week-2",
  "objectives": [
    "Write clear technical instructions",
    "Explain complex processes simply",
    "Use technical terminology accurately"
  ],
  "objectivesKo": [
    "명확한 기술 지침 작성하기",
    "복잡한 프로세스 간단히 설명하기",
    "기술 용어 정확히 사용하기"
  ],
  "keyPhrases": [
    {
      "phrase": "The procedure involves...",
      "meaning": "절차는 ...을 포함합니다",
      "pronunciation": { "ipa": "/ðə prəˈsiːdʒər ɪnˈvɒlvz/", "korean": "더 프러시저 인볼브즈" },
      "context": "기술적 절차를 설명할 때",
      "formalLevel": "formal",
      "koreanTip": "procedure의 강세는 두 번째 음절에 있습니다.",
      "example": { "A": "How do we set up the server?", "B": "The procedure involves configuring the network settings and installing the required software." },
      "relatedPhrases": ["The process includes...", "The steps are as follows...", "This entails..."]
    },
    {
      "phrase": "Ensure that the system...",
      "meaning": "시스템이 ...하는지 확인하세요",
      "pronunciation": { "ipa": "/ɪnˈʃʊər ðæt ðə ˈsɪstəm/", "korean": "인슈어 댓 더 시스템" },
      "context": "시스템 확인 사항을 지시할 때",
      "formalLevel": "formal",
      "koreanTip": "ensure와 insure는 다릅니다. ensure는 확실히 하다, insure는 보험에 들다입니다.",
      "commonMistakes": "make sure보다 더 기술적이고 격식 있는 표현입니다",
      "example": { "A": "What should I check before deployment?", "B": "Ensure that the system has sufficient memory and all dependencies are installed." },
      "relatedPhrases": ["Verify that...", "Confirm that...", "Make certain that..."]
    },
    {
      "phrase": "Troubleshooting steps include...",
      "meaning": "문제 해결 단계로는...",
      "pronunciation": { "ipa": "/ˈtrʌblʃuːtɪŋ steps ɪnˈkluːd/", "korean": "트러블슈팅 스텝스 인클루드" },
      "context": "문제 해결 가이드를 작성할 때",
      "formalLevel": "formal",
      "koreanTip": "troubleshooting은 하나의 단어입니다. trouble shooting으로 띄어쓰기하지 마세요.",
      "example": { "A": "The application keeps crashing. What should I do?", "B": "Troubleshooting steps include clearing the cache, restarting the service, and checking the logs." },
      "relatedPhrases": ["To resolve this issue...", "If problems persist...", "Diagnostic steps..."]
    },
    {
      "phrase": "The specifications require...",
      "meaning": "사양에는 ...이 필요합니다",
      "pronunciation": { "ipa": "/ðə ˌspesɪfɪˈkeɪʃənz rɪˈkwaɪər/", "korean": "더 스페시피케이션즈 리콰이어" },
      "context": "기술 사양을 명시할 때",
      "formalLevel": "formal",
      "koreanTip": "specifications는 줄여서 specs라고도 합니다. 공식 문서에서는 전체 단어를 사용하세요.",
      "example": { "A": "What hardware do we need?", "B": "The specifications require at least 16GB RAM and a quad-core processor." },
      "relatedPhrases": ["The requirements state...", "According to the specs...", "The system demands..."]
    },
    {
      "phrase": "For optimal performance...",
      "meaning": "최적의 성능을 위해...",
      "pronunciation": { "ipa": "/fɔːr ˈɒptɪməl pərˈfɔːrməns/", "korean": "포어 옵티멀 퍼포먼스" },
      "context": "성능 최적화 권장 사항을 제시할 때",
      "formalLevel": "formal",
      "koreanTip": "optimal과 optimum은 같은 의미지만 optimal이 더 일반적으로 사용됩니다.",
      "example": { "A": "How can we improve the system speed?", "B": "For optimal performance, we recommend using SSD storage and enabling caching." },
      "relatedPhrases": ["To maximize efficiency...", "For best results...", "To enhance performance..."]
    },
    {
      "phrase": "Refer to the diagram below",
      "meaning": "아래 다이어그램을 참조하세요",
      "pronunciation": { "ipa": "/rɪˈfɜːr tuː ðə ˈdaɪəɡræm bɪˈləʊ/", "korean": "리퍼 투 더 다이어그램 빌로우" },
      "context": "시각 자료를 참조시킬 때",
      "formalLevel": "formal",
      "koreanTip": "refer to는 참조하다의 의미로, see보다 더 격식 있는 표현입니다.",
      "example": { "A": "I do not understand the network topology.", "B": "Refer to the diagram below for a visual representation of the system architecture." },
      "relatedPhrases": ["See Figure 1...", "As shown in the illustration...", "The following chart displays..."]
    },
    {
      "phrase": "The system is designed to...",
      "meaning": "시스템은 ...하도록 설계되었습니다",
      "pronunciation": { "ipa": "/ðə ˈsɪstəm ɪz dɪˈzaɪnd tuː/", "korean": "더 시스템 이즈 디자인드 투" },
      "context": "시스템 설계 의도를 설명할 때",
      "formalLevel": "formal",
      "koreanTip": "designed to는 목적이나 의도를 나타냅니다. made to보다 더 기술적인 표현입니다.",
      "example": { "A": "What is the purpose of this module?", "B": "The system is designed to handle high-volume data processing in real-time." },
      "relatedPhrases": ["The architecture supports...", "The component enables...", "This is built to..."]
    },
    {
      "phrase": "In the event of a failure...",
      "meaning": "장애 발생 시...",
      "pronunciation": { "ipa": "/ɪn ðə ɪˈvent ɒv ə ˈfeɪljər/", "korean": "인 디 이벤트 오브 어 페일러" },
      "context": "비상 상황이나 오류 대응을 설명할 때",
      "formalLevel": "formal",
      "koreanTip": "In the event of는 If보다 더 공식적이고 기술적인 표현입니다.",
      "example": { "A": "What happens if the primary server goes down?", "B": "In the event of a failure, the backup server will automatically take over." },
      "relatedPhrases": ["Should an error occur...", "If the system fails...", "In case of malfunction..."]
    },
    {
      "phrase": "The configuration settings...",
      "meaning": "설정 구성은...",
      "pronunciation": { "ipa": "/ðə ˌkɒnfɪɡəˈreɪʃən ˈsetɪŋz/", "korean": "더 컨피규레이션 세팅즈" },
      "context": "시스템 설정을 설명할 때",
      "formalLevel": "formal",
      "koreanTip": "configuration은 종종 config로 줄여서 사용하지만, 공식 문서에서는 전체 단어를 권장합니다.",
      "example": { "A": "How do I customize the application?", "B": "The configuration settings can be modified in the settings.json file." },
      "relatedPhrases": ["The parameters...", "The setup options...", "The preferences..."]
    },
    {
      "phrase": "Please note that...",
      "meaning": "참고로 ...입니다",
      "pronunciation": { "ipa": "/pliːz nəʊt ðæt/", "korean": "플리즈 노트 댓" },
      "context": "중요한 정보나 주의사항을 강조할 때",
      "formalLevel": "neutral",
      "koreanTip": "기술 문서에서 주의사항이나 예외 사항을 알릴 때 자주 사용됩니다.",
      "example": { "A": "Can I use this on older systems?", "B": "Please note that this feature is only available in version 2.0 and above." },
      "relatedPhrases": ["It should be noted that...", "Be aware that...", "Important:..."]
    },
    {
      "phrase": "The default value is...",
      "meaning": "기본값은 ...입니다",
      "pronunciation": { "ipa": "/ðə dɪˈfɔːlt ˈvæljuː ɪz/", "korean": "더 디폴트 밸류 이즈" },
      "context": "기본 설정값을 명시할 때",
      "formalLevel": "formal",
      "koreanTip": "default의 강세는 두 번째 음절에 있습니다.",
      "example": { "A": "What timeout value should I use?", "B": "The default value is 30 seconds, but you can adjust it based on your needs." },
      "relatedPhrases": ["The preset is...", "By default...", "The initial setting..."]
    },
    {
      "phrase": "This feature enables...",
      "meaning": "이 기능은 ...을 가능하게 합니다",
      "pronunciation": { "ipa": "/ðɪs ˈfiːtʃər ɪˈneɪblz/", "korean": "디스 피처 이네이블즈" },
      "context": "기능의 역할을 설명할 때",
      "formalLevel": "formal",
      "koreanTip": "enable은 가능하게 하다로, allow보다 더 기술적인 표현입니다.",
      "example": { "A": "What does the new update include?", "B": "This feature enables users to schedule automated backups at specified intervals." },
      "relatedPhrases": ["This allows...", "This permits...", "This makes it possible to..."]
    },
    {
      "phrase": "Execute the following command...",
      "meaning": "다음 명령어를 실행하세요...",
      "pronunciation": { "ipa": "/ˈeksɪkjuːt ðə ˈfɒləʊɪŋ kəˈmɑːnd/", "korean": "엑시큐트 더 폴로잉 커맨드" },
      "context": "터미널이나 명령줄 지시를 할 때",
      "formalLevel": "formal",
      "koreanTip": "execute는 run보다 더 기술적이고 정확한 표현입니다.",
      "example": { "A": "How do I start the service?", "B": "Execute the following command in the terminal: sudo systemctl start nginx" },
      "relatedPhrases": ["Run the command...", "Enter the following...", "Type the command..."]
    },
    {
      "phrase": "The system will automatically...",
      "meaning": "시스템이 자동으로 ...합니다",
      "pronunciation": { "ipa": "/ðə ˈsɪstəm wɪl ˌɔːtəˈmætɪkli/", "korean": "더 시스템 윌 오토매티클리" },
      "context": "자동화된 동작을 설명할 때",
      "formalLevel": "formal",
      "koreanTip": "automatically에서 강세는 세 번째 음절 mat에 있습니다.",
      "example": { "A": "Do I need to restart the server manually?", "B": "No, the system will automatically restart after the update is installed." },
      "relatedPhrases": ["The process runs automatically...", "This is handled automatically...", "No manual intervention is required..."]
    },
    {
      "phrase": "Prior to installation...",
      "meaning": "설치 전에...",
      "pronunciation": { "ipa": "/ˈpraɪər tuː ˌɪnstəˈleɪʃən/", "korean": "프라이어 투 인스톨레이션" },
      "context": "사전 요구사항이나 준비 단계를 설명할 때",
      "formalLevel": "formal",
      "koreanTip": "before보다 더 격식 있는 표현입니다. 기술 문서에서 자주 사용됩니다.",
      "example": { "A": "What should I do first?", "B": "Prior to installation, ensure that all existing data is backed up." },
      "relatedPhrases": ["Before beginning...", "As a prerequisite...", "Before proceeding..."]
    }
  ]
};

// C1 Lesson 1 - Idioms & Expressions
const c1l1 = {
  "id": "c1-u1-l1",
  "unitId": "c1-u1",
  "levelId": "c1",
  "lessonNumber": 1,
  "title": "Idioms & Expressions",
  "titleKo": "관용어와 표현",
  "subtitle": "Master native-like expressions",
  "subtitleKo": "원어민스러운 표현 마스터하기",
  "theme": "idioms",
  "estimatedMinutes": 25,
  "keyPhrasesCount": 15,
  "prerequisites": [],
  "activityTypes": ["vocabulary", "grammar", "listening", "reading", "speaking", "writing"],
  "weekMapping": "week-1",
  "objectives": [
    "Recognize common idioms",
    "Use idioms in appropriate contexts",
    "Understand cultural references"
  ],
  "objectivesKo": [
    "일반적인 관용어 인식하기",
    "적절한 문맥에서 관용어 사용하기",
    "문화적 참조 이해하기"
  ],
  "keyPhrases": [
    {
      "phrase": "The ball is in your court",
      "meaning": "당신 차례예요 (결정권이 있어요)",
      "pronunciation": { "ipa": "/ðə bɔːl ɪz ɪn jɔːr kɔːrt/", "korean": "더 볼 이즈 인 유어 코트" },
      "context": "상대방에게 결정권이나 행동의 책임이 넘어갔을 때",
      "formalLevel": "neutral",
      "koreanTip": "테니스에서 유래한 표현입니다. 상대방이 다음 행동을 해야 할 때 사용하세요.",
      "example": { "A": "I have sent the proposal to the client.", "B": "Good. The ball is in their court now. We just have to wait for their response." },
      "relatedPhrases": ["It is up to you now", "Your move", "Over to you"]
    },
    {
      "phrase": "It is not rocket science",
      "meaning": "어렵지 않아요",
      "pronunciation": { "ipa": "/ɪts nɒt ˈrɒkɪt ˈsaɪəns/", "korean": "잇츠 낫 라킷 사이언스" },
      "context": "무언가가 생각보다 쉽다는 것을 강조할 때",
      "formalLevel": "casual",
      "koreanTip": "비격식적인 상황에서 사용하세요. 격식 있는 자리에서는 피하는 것이 좋습니다.",
      "example": { "A": "I am worried about learning to drive.", "B": "Do not worry! It is not rocket science. You will get it in no time." },
      "relatedPhrases": ["It is not brain surgery", "It is straightforward", "It is simple enough"]
    },
    {
      "phrase": "To bite off more than you can chew",
      "meaning": "감당 못할 일을 맡다",
      "pronunciation": { "ipa": "/tuː baɪt ɒf mɔːr ðæn juː kæn tʃuː/", "korean": "투 바이트 오프 모어 댄 유 캔 츄" },
      "context": "능력 이상의 일을 맡았을 때",
      "formalLevel": "neutral",
      "koreanTip": "음식을 너무 많이 입에 넣어서 씹을 수 없는 상황에서 유래했습니다.",
      "commonMistakes": "긍정적인 의미가 아닙니다. 경고나 후회의 맥락에서 사용하세요",
      "example": { "A": "I agreed to manage three projects at once.", "B": "Careful, you might be biting off more than you can chew." },
      "relatedPhrases": ["To overextend yourself", "To take on too much", "To spread yourself too thin"]
    },
    {
      "phrase": "The elephant in the room",
      "meaning": "다들 알지만 언급 안 하는 문제",
      "pronunciation": { "ipa": "/ðə ˈelɪfənt ɪn ðə ruːm/", "korean": "디 엘리펀트 인 더 룸" },
      "context": "명백하지만 아무도 언급하지 않는 중요한 문제가 있을 때",
      "formalLevel": "neutral",
      "koreanTip": "방에 코끼리가 있으면 모두 보이지만 아무도 말하지 않는다는 뜻입니다.",
      "example": { "A": "We discussed everything except the budget cuts.", "B": "Yes, that was the elephant in the room that nobody wanted to address." },
      "relatedPhrases": ["The unspoken issue", "The obvious problem", "What nobody wants to talk about"]
    },
    {
      "phrase": "To be on the same page",
      "meaning": "같은 생각을 가지다",
      "pronunciation": { "ipa": "/tuː biː ɒn ðə seɪm peɪdʒ/", "korean": "투 비 온 더 세임 페이지" },
      "context": "서로 이해하고 동의할 때",
      "formalLevel": "neutral",
      "koreanTip": "비즈니스 미팅에서 자주 사용되는 표현입니다.",
      "example": { "A": "Before we continue, let us make sure we are on the same page about the timeline.", "B": "Agreed. The deadline is next Friday, right?" },
      "relatedPhrases": ["To see eye to eye", "To be in agreement", "To understand each other"]
    },
    {
      "phrase": "That ship has sailed",
      "meaning": "이미 기회가 지나갔어요",
      "pronunciation": { "ipa": "/ðæt ʃɪp hæz seɪld/", "korean": "댓 쉽 해즈 세일드" },
      "context": "더 이상 가능하지 않은 기회를 언급할 때",
      "formalLevel": "casual",
      "koreanTip": "배가 이미 떠났으니 탈 수 없다는 의미입니다.",
      "example": { "A": "Maybe we should reconsider the original plan?", "B": "I am afraid that ship has sailed. We have already committed to the new strategy." },
      "relatedPhrases": ["It is too late now", "The opportunity has passed", "There is no going back"]
    },
    {
      "phrase": "To cut to the chase",
      "meaning": "본론으로 들어가다",
      "pronunciation": { "ipa": "/tuː kʌt tuː ðə tʃeɪs/", "korean": "투 컷 투 더 체이스" },
      "context": "서론 없이 핵심으로 바로 가고 싶을 때",
      "formalLevel": "neutral",
      "koreanTip": "영화에서 추격 장면으로 바로 넘어간다는 뜻에서 유래했습니다.",
      "example": { "A": "I have a lot to tell you about the meeting...", "B": "Can you cut to the chase? I only have 5 minutes." },
      "relatedPhrases": ["To get to the point", "To be direct", "To skip the details"]
    },
    {
      "phrase": "To think outside the box",
      "meaning": "창의적으로 생각하다",
      "pronunciation": { "ipa": "/tuː θɪŋk aʊtˈsaɪd ðə bɒks/", "korean": "투 띵크 아웃사이드 더 박스" },
      "context": "혁신적이거나 비전통적인 해결책을 찾을 때",
      "formalLevel": "neutral",
      "koreanTip": "비즈니스와 창의성 관련 대화에서 자주 사용됩니다.",
      "example": { "A": "We need a fresh approach to this problem.", "B": "Let us think outside the box and brainstorm some unconventional ideas." },
      "relatedPhrases": ["To be creative", "To innovate", "To find alternative solutions"]
    },
    {
      "phrase": "To go the extra mile",
      "meaning": "남다른 노력을 기울이다",
      "pronunciation": { "ipa": "/tuː ɡəʊ ðə ˈekstrə maɪl/", "korean": "투 고 디 엑스트라 마일" },
      "context": "기대 이상으로 노력할 때",
      "formalLevel": "neutral",
      "koreanTip": "성경에서 유래한 표현으로, 요구된 것 이상을 한다는 의미입니다.",
      "example": { "A": "Sarah stayed late to help finish the report.", "B": "She always goes the extra mile for the team." },
      "relatedPhrases": ["To put in extra effort", "To exceed expectations", "To do more than required"]
    },
    {
      "phrase": "To be in hot water",
      "meaning": "곤란한 상황에 처하다",
      "pronunciation": { "ipa": "/tuː biː ɪn hɒt ˈwɔːtər/", "korean": "투 비 인 핫 워터" },
      "context": "문제나 곤란한 상황에 빠졌을 때",
      "formalLevel": "casual",
      "koreanTip": "뜨거운 물에 빠지면 불편하다는 의미에서 유래했습니다.",
      "example": { "A": "Did you hear about John missing the deadline?", "B": "Yes, he is in hot water with the boss now." },
      "relatedPhrases": ["To be in trouble", "To be in a difficult situation", "To face consequences"]
    },
    {
      "phrase": "To hit the ground running",
      "meaning": "바로 전력을 다하다",
      "pronunciation": { "ipa": "/tuː hɪt ðə ɡraʊnd ˈrʌnɪŋ/", "korean": "투 힛 더 그라운드 러닝" },
      "context": "새 일이나 프로젝트를 즉시 시작할 때",
      "formalLevel": "neutral",
      "koreanTip": "군사 용어에서 유래했습니다. 착지하자마자 뛰어간다는 뜻입니다.",
      "example": { "A": "How was your first day at the new job?", "B": "Busy! I had to hit the ground running with a big project." },
      "relatedPhrases": ["To start immediately", "To get going quickly", "To make an immediate impact"]
    },
    {
      "phrase": "To let the cat out of the bag",
      "meaning": "비밀을 누설하다",
      "pronunciation": { "ipa": "/tuː let ðə kæt aʊt ɒv ðə bæɡ/", "korean": "투 렛 더 캣 아웃 오브 더 백" },
      "context": "실수로 비밀을 말했을 때",
      "formalLevel": "casual",
      "koreanTip": "중세 시장에서 돼지 대신 고양이를 속여 팔던 것에서 유래했습니다.",
      "example": { "A": "I accidentally told mom about the surprise party.", "B": "Oh no, you let the cat out of the bag!" },
      "relatedPhrases": ["To spill the beans", "To reveal a secret", "To give the game away"]
    },
    {
      "phrase": "To play devil's advocate",
      "meaning": "일부러 반대 의견을 제시하다",
      "pronunciation": { "ipa": "/tuː pleɪ ˈdevlz ˈædvəkət/", "korean": "투 플레이 데블스 애드버킷" },
      "context": "토론을 활발하게 하기 위해 반대 입장을 취할 때",
      "formalLevel": "formal",
      "koreanTip": "가톨릭 성인 시성 과정에서 유래한 표현입니다.",
      "example": { "A": "Everyone seems to agree with this plan.", "B": "Let me play devil's advocate - what if the market changes?" },
      "relatedPhrases": ["To argue the other side", "To present counterarguments", "To challenge assumptions"]
    },
    {
      "phrase": "To be under the weather",
      "meaning": "몸이 안 좋다",
      "pronunciation": { "ipa": "/tuː biː ˈʌndər ðə ˈweðər/", "korean": "투 비 언더 더 웨더" },
      "context": "약간 아프거나 컨디션이 좋지 않을 때",
      "formalLevel": "casual",
      "koreanTip": "배에서 날씨가 나쁘면 갑판 아래로 내려가 쉰 것에서 유래했습니다.",
      "example": { "A": "You do not look well today.", "B": "I am feeling a bit under the weather. I think I caught a cold." },
      "relatedPhrases": ["To feel unwell", "To be sick", "To not feel one hundred percent"]
    },
    {
      "phrase": "To put all your eggs in one basket",
      "meaning": "모든 것을 한 곳에 걸다",
      "pronunciation": { "ipa": "/tuː pʊt ɔːl jɔːr eɡz ɪn wʌn ˈbɑːskɪt/", "korean": "투 풋 올 유어 에그즈 인 원 바스킷" },
      "context": "위험을 분산하지 않고 한 곳에 집중할 때",
      "formalLevel": "neutral",
      "koreanTip": "달걀을 한 바구니에 담으면 넘어지면 다 깨진다는 뜻입니다.",
      "commonMistakes": "보통 부정적인 조언으로 사용됩니다 (하지 말라는 의미)",
      "example": { "A": "I invested all my savings in one stock.", "B": "That is risky. You should not put all your eggs in one basket." },
      "relatedPhrases": ["To diversify", "To spread the risk", "To not take unnecessary risks"]
    }
  ]
};

// C1 Lesson 2 - Nuanced Language
const c1l2 = {
  "id": "c1-u1-l2",
  "unitId": "c1-u1",
  "levelId": "c1",
  "lessonNumber": 2,
  "title": "Nuanced Language",
  "titleKo": "미묘한 표현",
  "subtitle": "Understand subtle differences in meaning",
  "subtitleKo": "의미의 미묘한 차이 이해하기",
  "theme": "nuance",
  "estimatedMinutes": 25,
  "keyPhrasesCount": 15,
  "prerequisites": ["c1-u1-l1"],
  "activityTypes": ["vocabulary", "grammar", "listening", "reading", "speaking", "writing"],
  "weekMapping": "week-2",
  "objectives": [
    "Distinguish similar expressions",
    "Choose the right word for context",
    "Adjust formality levels"
  ],
  "objectivesKo": [
    "비슷한 표현 구분하기",
    "문맥에 맞는 단어 선택하기",
    "격식 수준 조절하기"
  ],
  "keyPhrases": [
    {
      "phrase": "I would suggest that...",
      "meaning": "(공손) 제안하자면...",
      "pronunciation": { "ipa": "/aɪ wʊd səˈdʒest ðæt/", "korean": "아이 우드 서제스트 댓" },
      "context": "공손하게 의견을 제시할 때",
      "formalLevel": "formal",
      "koreanTip": "would를 사용하면 더 부드럽고 공손한 표현이 됩니다. I suggest that보다 훨씬 정중합니다.",
      "example": { "A": "How should we handle this client issue?", "B": "I would suggest that we schedule a call to discuss their concerns directly." },
      "relatedPhrases": ["Perhaps we could...", "It might be worth considering...", "May I suggest..."]
    },
    {
      "phrase": "With all due respect...",
      "meaning": "실례를 무릅쓰고...",
      "pronunciation": { "ipa": "/wɪð ɔːl djuː rɪˈspekt/", "korean": "위드 올 듀 리스펙트" },
      "context": "반대 의견을 정중하게 표현할 때",
      "formalLevel": "formal",
      "koreanTip": "이 표현 뒤에는 보통 상대방과 다른 의견이 따라옵니다. 격식 있는 자리에서 사용하세요.",
      "commonMistakes": "이 표현을 쓴 후에도 여전히 공손해야 합니다. 공격적인 말을 정당화하는 데 쓰지 마세요",
      "example": { "A": "I think we should expand into new markets immediately.", "B": "With all due respect, I believe we should stabilize our current position first." },
      "relatedPhrases": ["While I understand your point...", "I appreciate your perspective, but...", "Respectfully, I disagree..."]
    },
    {
      "phrase": "It is worth considering that...",
      "meaning": "...을 고려해 볼 가치가 있어요",
      "pronunciation": { "ipa": "/ɪts wɜːθ kənˈsɪdərɪŋ ðæt/", "korean": "잇츠 워스 컨시더링 댓" },
      "context": "새로운 관점이나 요소를 제안할 때",
      "formalLevel": "formal",
      "koreanTip": "직접적으로 의견을 말하는 대신 생각해볼 가치가 있다고 제안하는 부드러운 표현입니다.",
      "example": { "A": "We are focused on cost reduction.", "B": "It is worth considering that quality improvements might also attract more customers." },
      "relatedPhrases": ["We should bear in mind that...", "It is important to note that...", "One factor to consider is..."]
    },
    {
      "phrase": "To put it mildly...",
      "meaning": "완곡하게 말하자면...",
      "pronunciation": { "ipa": "/tuː pʊt ɪt ˈmaɪldli/", "korean": "투 풋 잇 마일들리" },
      "context": "실제보다 부드럽게 표현할 때 (언더스테이트먼트)",
      "formalLevel": "neutral",
      "koreanTip": "실제 상황이 더 심각하다는 것을 암시합니다. 영국식 완곡어법의 전형적인 예입니다.",
      "example": { "A": "How was the presentation?", "B": "To put it mildly, it did not go as planned. It was actually a disaster." },
      "relatedPhrases": ["To say the least...", "If I am being honest...", "Without exaggeration..."]
    },
    {
      "phrase": "I could not agree more",
      "meaning": "전적으로 동의해요",
      "pronunciation": { "ipa": "/aɪ ˈkʊdnt əˈɡriː mɔːr/", "korean": "아이 쿠든트 어그리 모어" },
      "context": "완전히 동의할 때 강조하는 표현",
      "formalLevel": "neutral",
      "koreanTip": "could not은 부정이지만 이 표현은 매우 강한 긍정입니다. 더 이상 동의할 수 없다 = 완전 동의라는 뜻입니다.",
      "example": { "A": "I think communication is key to team success.", "B": "I could not agree more. It is the foundation of everything." },
      "relatedPhrases": ["Absolutely", "You are absolutely right", "I totally agree"]
    },
    {
      "phrase": "That is one way of looking at it",
      "meaning": "그렇게 볼 수도 있죠 (우회적 반대)",
      "pronunciation": { "ipa": "/ðæts wʌn weɪ ɒv ˈlʊkɪŋ æt ɪt/", "korean": "댓츠 원 웨이 오브 루킹 앳 잇" },
      "context": "동의하지 않지만 직접 반대하고 싶지 않을 때",
      "formalLevel": "neutral",
      "koreanTip": "이 표현은 종종 다른 의견이 있다는 것을 암시합니다. 문자 그대로 받아들이지 마세요.",
      "commonMistakes": "이 표현은 보통 완곡한 반대입니다. 진심으로 동의하는 것처럼 들리지 않습니다",
      "example": { "A": "I think we should just fire the underperforming staff.", "B": "That is one way of looking at it. However, training might be more effective." },
      "relatedPhrases": ["I see your point, but...", "Perhaps, although...", "That is certainly a perspective..."]
    },
    {
      "phrase": "I am inclined to think that...",
      "meaning": "...라고 생각하는 편이에요",
      "pronunciation": { "ipa": "/aɪm ɪnˈklaɪnd tuː θɪŋk ðæt/", "korean": "아임 인클라인드 투 띵크 댓" },
      "context": "확신 없이 조심스럽게 의견을 말할 때",
      "formalLevel": "formal",
      "koreanTip": "I think보다 더 조심스럽고 격식 있는 표현입니다. 절대적인 확신보다는 경향을 나타냅니다.",
      "example": { "A": "What do you think about the new proposal?", "B": "I am inclined to think that it needs more research before we commit." },
      "relatedPhrases": ["I tend to believe that...", "My view is that...", "I lean towards thinking that..."]
    },
    {
      "phrase": "If I may be so bold...",
      "meaning": "주제넘은 말일 수 있지만...",
      "pronunciation": { "ipa": "/ɪf aɪ meɪ biː səʊ bəʊld/", "korean": "이프 아이 메이 비 소 볼드" },
      "context": "대담하거나 직설적인 의견을 말하기 전에",
      "formalLevel": "formal",
      "koreanTip": "매우 격식 있는 표현입니다. 상사나 고객에게 강한 의견을 말할 때 사용합니다.",
      "example": { "A": "We have been doing it this way for years.", "B": "If I may be so bold, perhaps it is time for a fresh approach." },
      "relatedPhrases": ["If I may say so...", "If I might venture an opinion...", "Allow me to suggest..."]
    },
    {
      "phrase": "There is something to be said for...",
      "meaning": "...에도 일리가 있어요",
      "pronunciation": { "ipa": "/ðeər ɪz ˈsʌmθɪŋ tuː biː sed fɔːr/", "korean": "데어 이즈 섬띵 투 비 세드 포" },
      "context": "반대 의견의 장점을 인정할 때",
      "formalLevel": "neutral",
      "koreanTip": "자신의 의견과 다르더라도 상대방 관점의 가치를 인정하는 성숙한 표현입니다.",
      "example": { "A": "Remote work is inefficient.", "B": "There is something to be said for the flexibility it offers employees." },
      "relatedPhrases": ["There is merit in...", "One advantage is...", "It has its benefits..."]
    },
    {
      "phrase": "I take your point, but...",
      "meaning": "말씀은 알겠는데...",
      "pronunciation": { "ipa": "/aɪ teɪk jɔːr pɔɪnt bʌt/", "korean": "아이 테이크 유어 포인트 벗" },
      "context": "상대방의 말을 이해했지만 다른 의견이 있을 때",
      "formalLevel": "neutral",
      "koreanTip": "상대방의 논점을 받아들인다는 것을 보여주면서 반론을 제시하는 방법입니다.",
      "example": { "A": "We need to cut costs immediately.", "B": "I take your point, but cutting too fast might hurt morale." },
      "relatedPhrases": ["I understand what you mean, however...", "That is valid, although...", "I hear you, but..."]
    },
    {
      "phrase": "Correct me if I am wrong, but...",
      "meaning": "제가 틀렸다면 정정해 주세요, 하지만...",
      "pronunciation": { "ipa": "/kəˈrekt miː ɪf aɪm rɒŋ bʌt/", "korean": "커렉트 미 이프 아임 롱 벗" },
      "context": "확실하지 않은 정보를 공유하거나 다른 의견을 제시할 때",
      "formalLevel": "formal",
      "koreanTip": "겸손하게 자신의 의견을 제시하면서 상대방이 정정할 기회를 주는 표현입니다.",
      "example": { "A": "The project is ahead of schedule.", "B": "Correct me if I am wrong, but I believe we are actually two weeks behind." },
      "relatedPhrases": ["Unless I am mistaken...", "If my understanding is correct...", "As far as I know..."]
    },
    {
      "phrase": "It is not entirely without merit",
      "meaning": "완전히 가치가 없는 것은 아니에요",
      "pronunciation": { "ipa": "/ɪts nɒt ɪnˈtaɪərli wɪˈðaʊt ˈmerɪt/", "korean": "잇츠 낫 인타이얼리 위다웃 메릿" },
      "context": "완곡하게 긍정적인 평가를 할 때 (이중 부정)",
      "formalLevel": "formal",
      "koreanTip": "이중 부정으로 약한 긍정을 표현합니다. 영국식 표현의 특징입니다.",
      "example": { "A": "What do you think of the budget proposal?", "B": "It is not entirely without merit, though I would suggest some revisions." },
      "relatedPhrases": ["It has some potential", "There are aspects worth considering", "It is not completely off base"]
    },
    {
      "phrase": "For what it is worth...",
      "meaning": "참고로 말씀드리자면...",
      "pronunciation": { "ipa": "/fɔːr wɒt ɪts wɜːθ/", "korean": "포 왓 잇츠 워스" },
      "context": "의견이나 정보의 가치를 겸손하게 제시할 때",
      "formalLevel": "neutral",
      "koreanTip": "자신의 의견이 가치가 있을 수도 없을 수도 있다는 겸손함을 보여줍니다.",
      "example": { "A": "Should I take this job offer?", "B": "For what it is worth, I think it is a great opportunity for growth." },
      "relatedPhrases": ["In my humble opinion...", "If you want my two cents...", "Just my thoughts..."]
    },
    {
      "phrase": "I would not go so far as to say...",
      "meaning": "...라고까지는 말하지 않겠어요",
      "pronunciation": { "ipa": "/aɪ ˈwʊdnt ɡəʊ səʊ fɑːr æz tuː seɪ/", "korean": "아이 우든트 고 소 파 애즈 투 세이" },
      "context": "극단적인 표현을 완화할 때",
      "formalLevel": "formal",
      "koreanTip": "상대방의 과장된 표현에 동의하지 않으면서도 직접 반대하지 않는 방법입니다.",
      "example": { "A": "This project is a complete failure.", "B": "I would not go so far as to say that. It has challenges, but there are salvageable parts." },
      "relatedPhrases": ["That might be overstating it", "Perhaps that is a bit strong", "I would temper that by saying..."]
    },
    {
      "phrase": "All things considered...",
      "meaning": "모든 것을 고려하면...",
      "pronunciation": { "ipa": "/ɔːl θɪŋz kənˈsɪdəd/", "korean": "올 띵즈 컨시더드" },
      "context": "모든 요소를 고려한 결론을 말할 때",
      "formalLevel": "formal",
      "koreanTip": "종합적인 평가나 결론을 내릴 때 사용하는 격식체 표현입니다.",
      "example": { "A": "How would you rate the conference?", "B": "All things considered, it was a success despite some technical issues." },
      "relatedPhrases": ["On balance...", "Taking everything into account...", "Overall..."]
    }
  ]
};

// C2 Lesson 1 - Native Expressions
const c2l1 = {
  "id": "c2-u1-l1",
  "unitId": "c2-u1",
  "levelId": "c2",
  "lessonNumber": 1,
  "title": "Native Expressions",
  "titleKo": "원어민 표현",
  "subtitle": "Master native-level expressions",
  "subtitleKo": "원어민 수준 표현 마스터하기",
  "theme": "native",
  "estimatedMinutes": 30,
  "keyPhrasesCount": 15,
  "prerequisites": [],
  "activityTypes": ["vocabulary", "grammar", "listening", "reading", "speaking", "writing"],
  "weekMapping": "week-1",
  "objectives": [
    "Use contemporary slang",
    "Understand colloquial speech",
    "Navigate regional variations"
  ],
  "objectivesKo": [
    "현대 슬랭 사용하기",
    "구어체 이해하기",
    "지역별 차이 다루기"
  ],
  "keyPhrases": [
    {
      "phrase": "That is a no-brainer",
      "meaning": "그건 당연하죠",
      "pronunciation": { "ipa": "/ðæts ə nəʊˈbreɪnər/", "korean": "댓츠 어 노브레이너" },
      "context": "결정이 너무 쉬워서 생각할 필요가 없을 때",
      "formalLevel": "casual",
      "koreanTip": "뇌를 사용할 필요가 없다는 뜻입니다. 비격식적인 상황에서 사용하세요.",
      "example": { "A": "Should we accept the deal with 30% more profit?", "B": "That is a no-brainer! Of course we should." },
      "relatedPhrases": ["It is obvious", "It goes without saying", "It is a given"]
    },
    {
      "phrase": "I am totally swamped",
      "meaning": "일에 완전 파묻혀 있어요",
      "pronunciation": { "ipa": "/aɪm ˈtəʊtəli swɒmpt/", "korean": "아임 토털리 스웜프트" },
      "context": "매우 바쁜 상태를 강조할 때",
      "formalLevel": "casual",
      "koreanTip": "늪(swamp)에 빠진 것처럼 빠져나올 수 없다는 비유입니다.",
      "example": { "A": "Can you help me with this report?", "B": "Sorry, I am totally swamped with the quarterly review right now." },
      "relatedPhrases": ["I am snowed under", "I am up to my neck", "I am drowning in work"]
    },
    {
      "phrase": "Let us play it by ear",
      "meaning": "상황 봐서 정하죠",
      "pronunciation": { "ipa": "/lets pleɪ ɪt baɪ ɪər/", "korean": "렛츠 플레이 잇 바이 이어" },
      "context": "미리 계획하지 않고 상황에 따라 결정할 때",
      "formalLevel": "casual",
      "koreanTip": "음악에서 악보 없이 귀로 듣고 연주하는 것에서 유래했습니다.",
      "example": { "A": "What time should we meet for dinner?", "B": "Let us play it by ear. I will text you when I finish work." },
      "relatedPhrases": ["We will see how it goes", "Let us improvise", "We will figure it out as we go"]
    },
    {
      "phrase": "You are barking up the wrong tree",
      "meaning": "헛다리 짚고 있어요",
      "pronunciation": { "ipa": "/jʊər ˈbɑːkɪŋ ʌp ðə rɒŋ triː/", "korean": "유어 바킹 업 더 롱 트리" },
      "context": "잘못된 방향으로 노력하거나 잘못된 사람을 의심할 때",
      "formalLevel": "casual",
      "koreanTip": "사냥개가 잘못된 나무를 향해 짖는 것에서 유래했습니다.",
      "example": { "A": "I think marketing is responsible for the low sales.", "B": "You are barking up the wrong tree. It is actually a product issue." },
      "relatedPhrases": ["You have got the wrong idea", "You are on the wrong track", "You are looking in the wrong place"]
    },
    {
      "phrase": "That is a game-changer",
      "meaning": "판도를 바꾸는 거예요",
      "pronunciation": { "ipa": "/ðæts ə ɡeɪm ˈtʃeɪndʒər/", "korean": "댓츠 어 게임 체인저" },
      "context": "상황을 완전히 바꿀 수 있는 것을 설명할 때",
      "formalLevel": "neutral",
      "koreanTip": "비즈니스와 기술 분야에서 자주 사용되는 표현입니다.",
      "example": { "A": "The new AI feature can process data 100 times faster.", "B": "That is a game-changer for our industry." },
      "relatedPhrases": ["It is revolutionary", "It is a breakthrough", "It changes everything"]
    },
    {
      "phrase": "I will take a rain check",
      "meaning": "다음에 하죠",
      "pronunciation": { "ipa": "/aɪl teɪk ə reɪn tʃek/", "korean": "아일 테이크 어 레인 체크" },
      "context": "초대를 정중히 거절하면서 다음에 하자고 할 때",
      "formalLevel": "casual",
      "koreanTip": "비로 취소된 야구 경기의 다음 경기 입장권에서 유래했습니다.",
      "example": { "A": "Want to grab lunch today?", "B": "I will take a rain check. I have a deadline to meet." },
      "relatedPhrases": ["Maybe another time", "Can we reschedule?", "Let us do it another day"]
    },
    {
      "phrase": "Break a leg!",
      "meaning": "행운을 빌어요!",
      "pronunciation": { "ipa": "/breɪk ə leɡ/", "korean": "브레이크 어 레그" },
      "context": "공연이나 발표 전에 행운을 빌 때",
      "formalLevel": "casual",
      "koreanTip": "연극계에서 good luck이 불운을 가져온다고 믿어서 반대로 말하는 것에서 유래했습니다.",
      "commonMistakes": "공연 전에만 사용하세요. 일반적인 행운의 상황에서는 적절하지 않습니다",
      "example": { "A": "I am so nervous about my presentation.", "B": "You will do great. Break a leg!" },
      "relatedPhrases": ["Good luck", "Knock them dead", "You have got this"]
    },
    {
      "phrase": "That hit the nail on the head",
      "meaning": "정곡을 찔렀어요",
      "pronunciation": { "ipa": "/ðæt hɪt ðə neɪl ɒn ðə hed/", "korean": "댓 힛 더 네일 온 더 헤드" },
      "context": "누군가가 정확하게 핵심을 짚었을 때",
      "formalLevel": "neutral",
      "koreanTip": "망치로 못의 머리를 정확히 치는 것에서 유래했습니다.",
      "example": { "A": "I think our problem is lack of communication between teams.", "B": "That hit the nail on the head. That is exactly what we need to fix." },
      "relatedPhrases": ["You are spot on", "Exactly right", "That is precisely it"]
    },
    {
      "phrase": "To get the ball rolling",
      "meaning": "일을 시작하다",
      "pronunciation": { "ipa": "/tuː ɡet ðə bɔːl ˈrəʊlɪŋ/", "korean": "투 겟 더 볼 롤링" },
      "context": "프로젝트나 활동을 시작할 때",
      "formalLevel": "neutral",
      "koreanTip": "공이 굴러가면 계속 움직인다는 의미에서, 일단 시작하면 진행된다는 뜻입니다.",
      "example": { "A": "When should we start the new campaign?", "B": "Let us get the ball rolling next week with a kickoff meeting." },
      "relatedPhrases": ["To kick things off", "To get started", "To initiate"]
    },
    {
      "phrase": "To be on cloud nine",
      "meaning": "매우 행복하다",
      "pronunciation": { "ipa": "/tuː biː ɒn klaʊd naɪn/", "korean": "투 비 온 클라우드 나인" },
      "context": "극도로 행복한 상태를 표현할 때",
      "formalLevel": "casual",
      "koreanTip": "구름 아홉 번째 층, 즉 하늘 높이 있다는 비유적 표현입니다.",
      "example": { "A": "How do you feel about the promotion?", "B": "I am on cloud nine! I have been working towards this for years." },
      "relatedPhrases": ["To be over the moon", "To be thrilled", "To be ecstatic"]
    },
    {
      "phrase": "To be in a pickle",
      "meaning": "곤란한 상황에 있다",
      "pronunciation": { "ipa": "/tuː biː ɪn ə ˈpɪkl/", "korean": "투 비 인 어 피클" },
      "context": "어려운 상황에 처했을 때",
      "formalLevel": "casual",
      "koreanTip": "피클 병에 갇힌 것처럼 빠져나오기 어려운 상황을 의미합니다.",
      "example": { "A": "I double-booked myself for two important meetings.", "B": "You are in a pickle now. Can you reschedule one of them?" },
      "relatedPhrases": ["To be in a bind", "To be in a jam", "To be stuck"]
    },
    {
      "phrase": "To burn the midnight oil",
      "meaning": "밤늦게까지 일하다",
      "pronunciation": { "ipa": "/tuː bɜːn ðə ˈmɪdnaɪt ɔɪl/", "korean": "투 번 더 미드나잇 오일" },
      "context": "야근하거나 밤새 공부할 때",
      "formalLevel": "neutral",
      "koreanTip": "전기가 없던 시절, 밤에 기름 램프를 켜고 일하던 것에서 유래했습니다.",
      "example": { "A": "You look tired.", "B": "I have been burning the midnight oil to finish the project on time." },
      "relatedPhrases": ["To work late", "To pull an all-nighter", "To stay up late working"]
    },
    {
      "phrase": "To be a piece of cake",
      "meaning": "식은 죽 먹기다",
      "pronunciation": { "ipa": "/tuː biː ə piːs əv keɪk/", "korean": "투 비 어 피스 오브 케이크" },
      "context": "무언가가 매우 쉬울 때",
      "formalLevel": "casual",
      "koreanTip": "케이크 한 조각을 먹는 것처럼 쉽다는 뜻입니다.",
      "example": { "A": "Was the exam difficult?", "B": "It was a piece of cake. I finished in half the time." },
      "relatedPhrases": ["It is easy as pie", "It is a walk in the park", "It is a breeze"]
    },
    {
      "phrase": "To cost an arm and a leg",
      "meaning": "엄청 비싸다",
      "pronunciation": { "ipa": "/tuː kɒst ən ɑːm ænd ə leɡ/", "korean": "투 코스트 언 암 앤 어 레그" },
      "context": "무언가가 매우 비쌀 때",
      "formalLevel": "casual",
      "koreanTip": "팔다리를 팔아야 할 만큼 비싸다는 과장된 표현입니다.",
      "example": { "A": "How much was your new car?", "B": "It cost an arm and a leg, but it was worth it." },
      "relatedPhrases": ["To break the bank", "To be pricey", "To be expensive"]
    },
    {
      "phrase": "To be all ears",
      "meaning": "귀 기울여 듣다",
      "pronunciation": { "ipa": "/tuː biː ɔːl ɪəz/", "korean": "투 비 올 이어즈" },
      "context": "주의 깊게 들을 준비가 되었을 때",
      "formalLevel": "casual",
      "koreanTip": "온몸이 귀가 된 것처럼 집중해서 듣는다는 뜻입니다.",
      "example": { "A": "I have some exciting news to share.", "B": "I am all ears! Tell me everything." },
      "relatedPhrases": ["I am listening", "You have my attention", "Go ahead"]
    }
  ]
};

// C2 Lesson 2 - Subtle Humor
const c2l2 = {
  "id": "c2-u1-l2",
  "unitId": "c2-u1",
  "levelId": "c2",
  "lessonNumber": 2,
  "title": "Subtle Humor",
  "titleKo": "미묘한 유머",
  "subtitle": "Understand and use English humor",
  "subtitleKo": "영어 유머 이해하고 사용하기",
  "theme": "humor",
  "estimatedMinutes": 30,
  "keyPhrasesCount": 15,
  "prerequisites": ["c2-u1-l1"],
  "activityTypes": ["vocabulary", "grammar", "listening", "reading", "speaking", "writing"],
  "weekMapping": "week-2",
  "objectives": [
    "Understand wordplay and puns",
    "Recognize sarcasm and irony",
    "Use humor appropriately"
  ],
  "objectivesKo": [
    "말장난과 펀 이해하기",
    "풍자와 아이러니 인식하기",
    "유머를 적절히 사용하기"
  ],
  "keyPhrases": [
    {
      "phrase": "I am just pulling your leg",
      "meaning": "장난이에요",
      "pronunciation": { "ipa": "/aɪm dʒʌst ˈpʊlɪŋ jɔːr leɡ/", "korean": "아임 저스트 풀링 유어 레그" },
      "context": "장난을 치거나 놀린 후에 밝힐 때",
      "formalLevel": "casual",
      "koreanTip": "영국에서 유래한 표현으로, 누군가를 놀리거나 장난칠 때 사용합니다.",
      "example": { "A": "You got promoted to CEO?!", "B": "Ha! I am just pulling your leg. But I did get a raise." },
      "relatedPhrases": ["I am just kidding", "I am joking", "I am teasing you"]
    },
    {
      "phrase": "That is a bit tongue-in-cheek",
      "meaning": "좀 빈정대는 거예요",
      "pronunciation": { "ipa": "/ðæts ə bɪt tʌŋ ɪn tʃiːk/", "korean": "댓츠 어 빗 텅 인 치크" },
      "context": "진지하지 않은, 유머러스한 의도를 설명할 때",
      "formalLevel": "neutral",
      "koreanTip": "웃음을 참느라 혀를 볼에 대는 모습에서 유래했습니다. 진지하지 않은 농담임을 나타냅니다.",
      "example": { "A": "Did you really mean that criticism?", "B": "No, it was a bit tongue-in-cheek. I was trying to be funny." },
      "relatedPhrases": ["It is ironic", "It is said in jest", "It is humorous"]
    },
    {
      "phrase": "No pun intended",
      "meaning": "말장난은 아니에요",
      "pronunciation": { "ipa": "/nəʊ pʌn ɪnˈtendɪd/", "korean": "노 펀 인텐디드" },
      "context": "우연히 말장난이 되었을 때 해명할 때",
      "formalLevel": "neutral",
      "koreanTip": "말장난을 의도하지 않았다고 밝히거나, 반대로 의도적인 말장난을 강조할 때도 사용합니다.",
      "commonMistakes": "이 표현 자체가 말장난을 강조하는 효과가 있어서, 일부러 말장난 후에 쓰기도 합니다",
      "example": { "A": "This project is really taking off - no pun intended since it is an airline app.", "B": "Ha! I see what you did there." },
      "relatedPhrases": ["Pun intended", "Excuse the pun", "Pardon the pun"]
    },
    {
      "phrase": "Reading between the lines",
      "meaning": "행간을 읽다",
      "pronunciation": { "ipa": "/ˈriːdɪŋ bɪˈtwiːn ðə laɪnz/", "korean": "리딩 비트윈 더 라인즈" },
      "context": "숨겨진 의미나 암시를 파악할 때",
      "formalLevel": "neutral",
      "koreanTip": "글자 그대로가 아닌 숨겨진 의미를 이해하는 능력을 말합니다.",
      "example": { "A": "The email said the project is 'on track,' but...", "B": "Reading between the lines, it sounds like they are behind schedule." },
      "relatedPhrases": ["To understand the subtext", "To get the hidden meaning", "To pick up on hints"]
    },
    {
      "phrase": "That went over my head",
      "meaning": "무슨 말인지 모르겠어요",
      "pronunciation": { "ipa": "/ðæt went ˈəʊvər maɪ hed/", "korean": "댓 웬트 오버 마이 헤드" },
      "context": "농담이나 언급을 이해하지 못했을 때",
      "formalLevel": "casual",
      "koreanTip": "머리 위로 지나갔다는 것은 이해하지 못했다는 뜻입니다.",
      "example": { "A": "Did you get the reference to Shakespeare?", "B": "Honestly, that went over my head. I have not read Hamlet." },
      "relatedPhrases": ["I did not get it", "I missed that", "That was lost on me"]
    },
    {
      "phrase": "You are killing me!",
      "meaning": "웃겨 죽겠어요!",
      "pronunciation": { "ipa": "/jʊər ˈkɪlɪŋ miː/", "korean": "유어 킬링 미" },
      "context": "무언가가 매우 웃길 때",
      "formalLevel": "casual",
      "koreanTip": "웃음으로 죽을 것 같다는 과장된 표현입니다. 매우 친한 사이에서 사용합니다.",
      "example": { "A": "And then the cat fell into the cake!", "B": "You are killing me! I cannot stop laughing!" },
      "relatedPhrases": ["That is hilarious", "I am dying of laughter", "Stop, I cannot breathe"]
    },
    {
      "phrase": "Dry humor at its finest",
      "meaning": "무표정 유머의 정수네요",
      "pronunciation": { "ipa": "/draɪ ˈhjuːmər æt ɪts ˈfaɪnɪst/", "korean": "드라이 휴머 앳 잇츠 파이니스트" },
      "context": "표정 변화 없이 전달되는 미묘한 유머를 인정할 때",
      "formalLevel": "neutral",
      "koreanTip": "영국식 유머의 특징입니다. 진지한 표정으로 웃긴 말을 합니다.",
      "example": { "A": "The meeting could have been an email. But here we are, hour three.", "B": "Dry humor at its finest. I appreciate your wit." },
      "relatedPhrases": ["Deadpan humor", "Understated comedy", "Subtle wit"]
    },
    {
      "phrase": "I see what you did there",
      "meaning": "뭘 하려는지 알겠어요",
      "pronunciation": { "ipa": "/aɪ siː wɒt juː dɪd ðeər/", "korean": "아이 시 왓 유 디드 데어" },
      "context": "상대방의 말장난이나 교묘한 유머를 알아챘을 때",
      "formalLevel": "casual",
      "koreanTip": "상대방의 숨겨진 의도나 말장난을 이해했다는 것을 보여주는 표현입니다.",
      "example": { "A": "I could not put the book down. It was about anti-gravity.", "B": "Ha! I see what you did there. Nice pun." },
      "relatedPhrases": ["I get it", "Nice one", "Clever"]
    },
    {
      "phrase": "That is so meta",
      "meaning": "자기 참조적이네요",
      "pronunciation": { "ipa": "/ðæts səʊ ˈmetə/", "korean": "댓츠 소 메타" },
      "context": "무언가가 자기 자신을 참조하거나 반영할 때",
      "formalLevel": "casual",
      "koreanTip": "메타(자기 참조)는 현대 인터넷 문화에서 자주 사용되는 개념입니다.",
      "example": { "A": "A movie about making a movie about making movies.", "B": "That is so meta. Very postmodern." },
      "relatedPhrases": ["Self-referential", "Recursive", "Very self-aware"]
    },
    {
      "phrase": "The irony is not lost on me",
      "meaning": "아이러니한 거 알아요",
      "pronunciation": { "ipa": "/ðə ˈaɪrəni ɪz nɒt lɒst ɒn miː/", "korean": "디 아이러니 이즈 낫 로스트 온 미" },
      "context": "상황의 아이러니를 인식하고 있음을 표현할 때",
      "formalLevel": "neutral",
      "koreanTip": "아이러니한 상황을 본인도 알고 있다는 것을 자조적으로 인정하는 표현입니다.",
      "example": { "A": "A fire station burned down?", "B": "The irony is not lost on me. They called another station for help." },
      "relatedPhrases": ["I appreciate the irony", "How ironic", "The situation is not without irony"]
    },
    {
      "phrase": "To have a good poker face",
      "meaning": "무표정을 잘 유지하다",
      "pronunciation": { "ipa": "/tuː hæv ə ɡʊd ˈpəʊkər feɪs/", "korean": "투 해브 어 굿 포커 페이스" },
      "context": "감정이나 의도를 숨기고 표정을 유지할 때",
      "formalLevel": "neutral",
      "koreanTip": "포커 게임에서 자신의 패를 숨기기 위해 표정을 드러내지 않는 것에서 유래했습니다.",
      "example": { "A": "How did you not laugh during that presentation?", "B": "I have a good poker face. I was dying inside though." },
      "relatedPhrases": ["To keep a straight face", "To not show emotions", "To remain expressionless"]
    },
    {
      "phrase": "That is a backhanded compliment",
      "meaning": "그건 비꼬는 칭찬이에요",
      "pronunciation": { "ipa": "/ðæts ə ˈbækhændɪd ˈkɒmplɪmənt/", "korean": "댓츠 어 백핸디드 컴플리먼트" },
      "context": "칭찬처럼 들리지만 실제로는 비판인 말을 지적할 때",
      "formalLevel": "neutral",
      "koreanTip": "테니스에서 백핸드가 정면이 아닌 것처럼, 직접적이지 않은 부정적 의미의 칭찬입니다.",
      "example": { "A": "You are smart for someone without a degree.", "B": "That is a backhanded compliment if I ever heard one." },
      "relatedPhrases": ["Left-handed compliment", "Insult disguised as praise", "Passive-aggressive compliment"]
    },
    {
      "phrase": "To play it straight",
      "meaning": "진지하게 연기하다",
      "pronunciation": { "ipa": "/tuː pleɪ ɪt streɪt/", "korean": "투 플레이 잇 스트레이트" },
      "context": "코미디 상황에서도 진지하게 행동할 때",
      "formalLevel": "neutral",
      "koreanTip": "코미디의 straight man(진지한 역할)에서 온 표현입니다.",
      "example": { "A": "How does he make those jokes so funny?", "B": "His partner plays it straight, which makes the contrast hilarious." },
      "relatedPhrases": ["To be the straight man", "To not break character", "To remain serious"]
    },
    {
      "phrase": "To have someone in stitches",
      "meaning": "웃겨서 배가 아프게 하다",
      "pronunciation": { "ipa": "/tuː hæv ˈsʌmwʌn ɪn ˈstɪtʃɪz/", "korean": "투 해브 섬원 인 스티치즈" },
      "context": "누군가를 매우 웃기게 했을 때",
      "formalLevel": "casual",
      "koreanTip": "너무 웃어서 옆구리에 바늘로 찌르는 것 같은 통증(stitch)이 생긴다는 뜻입니다.",
      "example": { "A": "How was the comedy show?", "B": "Amazing! The comedian had the whole audience in stitches." },
      "relatedPhrases": ["To make someone laugh hard", "To crack someone up", "To be hysterical"]
    },
    {
      "phrase": "Wink wink, nudge nudge",
      "meaning": "알지? (의미심장하게)",
      "pronunciation": { "ipa": "/wɪŋk wɪŋk nʌdʒ nʌdʒ/", "korean": "윙크 윙크 넛지 넛지" },
      "context": "암시적인 의미가 있음을 나타낼 때",
      "formalLevel": "casual",
      "koreanTip": "영국 코미디 Monty Python에서 유래한 표현으로, 숨겨진 의미가 있음을 나타냅니다.",
      "commonMistakes": "매우 비격식적인 표현입니다. 업무 상황에서는 사용하지 마세요",
      "example": { "A": "I will be working late tonight, wink wink, nudge nudge.", "B": "Ha! I know you are really going on a date." },
      "relatedPhrases": ["If you know what I mean", "Hint hint", "Say no more"]
    }
  ]
};

// Write all files
const files = [
  { path: 'data/lessons/b2/unit-1/lesson-1/meta.json', data: b2l1 },
  { path: 'data/lessons/b2/unit-1/lesson-2/meta.json', data: b2l2 },
  { path: 'data/lessons/c1/unit-1/lesson-1/meta.json', data: c1l1 },
  { path: 'data/lessons/c1/unit-1/lesson-2/meta.json', data: c1l2 },
  { path: 'data/lessons/c2/unit-1/lesson-1/meta.json', data: c2l1 },
  { path: 'data/lessons/c2/unit-1/lesson-2/meta.json', data: c2l2 }
];

files.forEach(({ path: filePath, data }) => {
  const fullPath = path.join(__dirname, '..', filePath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
  console.log(`Written: ${filePath}`);
});

console.log('All files updated successfully!');
