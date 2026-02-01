
import { Ingredient } from './types';

// Consolidated Categories (Broader Groups)
export const INITIAL_CATEGORIES = [
  '과일',
  '채소/버섯',
  '고기/계란',
  '해산물/건어물',
  '곡물/면',
  '유제품/두부',
  '햄/가공식품',
  '간식/빵/떡',
  '음료',
  '양념/조미료',
  '편의점',
  '반찬',
  '즉석식품'
];

export const EQUIPMENT_CATEGORIES = [
  '침구/숙박',
  '취사/식음료',
  '위생/세면',
  '가방/패킹',
  '공구/정비',
  '의류/잡화',
  '전자기기/조명'
];

// ... (calculateDefaultTier function remains the same, omitted for brevity but conceptually used for food) ...
const calculateDefaultTier = (name: string, category: string): number => {
    // Keep existing logic for food
    return 3; 
};

// Helper to generate default items
const createItem = (name: string, category: string): Ingredient => ({
  id: `def-${name}-${Math.random().toString(36).substr(2, 9)}`,
  name,
  category,
  tier: calculateDefaultTier(name, category), // Default tier logic
  isCustom: false,
  isActive: true,
  type: 'food'
});

const createEquip = (name: string, category: string, tier: number): Ingredient => ({
  id: `equip-${name}-${Math.random().toString(36).substr(2, 9)}`,
  name,
  category,
  tier,
  isCustom: false,
  isActive: true,
  type: 'equipment'
});

export const DEFAULT_INGREDIENTS: Ingredient[] = [
  // ... (Existing food ingredients kept exactly as is) ...
  // ==========================================
  // 1. 과일 (Fruits)
  // ==========================================
  createItem('사과', '과일'), createItem('배', '과일'), createItem('수박', '과일'),
  createItem('참외', '과일'), createItem('포도', '과일'), createItem('샤인머스캣', '과일'),
  createItem('딸기', '과일'), createItem('바나나', '과일'), createItem('귤', '과일'),
  createItem('오렌지', '과일'), createItem('자몽', '과일'), createItem('레몬', '과일'),
  createItem('파인애플', '과일'), createItem('키위', '과일'), createItem('토마토', '과일'),
  createItem('방울토마토', '과일'), createItem('대저토마토', '과일'), createItem('스테비아토마토', '과일'),
  createItem('복숭아(백도)', '과일'), createItem('복숭아(황도)', '과일'), createItem('천도복숭아', '과일'),
  createItem('자두', '과일'), createItem('체리', '과일'), createItem('메론', '과일'),
  createItem('망고', '과일'), createItem('애플망고', '과일'), createItem('아보카도', '과일'),
  createItem('블루베리', '과일'), createItem('산딸기', '과일'), createItem('오디', '과일'),
  createItem('복분자', '과일'), createItem('석류', '과일'), createItem('감(단감)', '과일'),
  createItem('홍시', '과일'), createItem('곶감', '과일'), createItem('한라봉', '과일'),
  createItem('천혜향', '과일'), createItem('레드향', '과일'), createItem('황금향', '과일'),
  createItem('유자', '과일'), createItem('매실', '과일'), createItem('살구', '과일'),
  createItem('무화과', '과일'), createItem('청포도', '과일'), createItem('거봉', '과일'),
  createItem('캠벨포도', '과일'), createItem('머루', '과일'), createItem('라임', '과일'),
  createItem('망고스틴', '과일'), createItem('두리안', '과일'), createItem('용과', '과일'),
  createItem('리치', '과일'), createItem('람부탄', '과일'), createItem('패션후르츠', '과일'),
  createItem('코코넛', '과일'), createItem('파파야', '과일'), createItem('크랜베리', '과일'),

  // ==========================================
  // 2. 채소/버섯 (Vegetables/Mushrooms)
  // ==========================================
  createItem('배추', '채소/버섯'), createItem('알배기배추', '채소/버섯'), createItem('얼갈이배추', '채소/버섯'),
  createItem('봄동', '채소/버섯'), createItem('양배추', '채소/버섯'), createItem('적양배추', '채소/버섯'),
  createItem('상추', '채소/버섯'), createItem('꽃상추', '채소/버섯'), createItem('로메인', '채소/버섯'),
  createItem('깻잎', '채소/버섯'), createItem('시금치', '채소/버섯'), createItem('섬초', '채소/버섯'),
  createItem('청경채', '채소/버섯'), createItem('비타민', '채소/버섯'), createItem('케일', '채소/버섯'),
  createItem('치커리', '채소/버섯'), createItem('미나리', '채소/버섯'), createItem('돌미나리', '채소/버섯'),
  createItem('부추', '채소/버섯'), createItem('영양부추', '채소/버섯'), createItem('대파', '채소/버섯'),
  createItem('쪽파', '채소/버섯'), createItem('실파', '채소/버섯'), createItem('아스파라거스', '채소/버섯'),
  createItem('샐러리', '채소/버섯'), createItem('고수', '채소/버섯'), createItem('바질', '채소/버섯'),
  createItem('애플민트', '채소/버섯'), createItem('로즈마리', '채소/버섯'), createItem('타임', '채소/버섯'),
  createItem('딜', '채소/버섯'), createItem('루꼴라', '채소/버섯'), createItem('콩나물', '채소/버섯'),
  createItem('숙주나물', '채소/버섯'), createItem('갓', '채소/버섯'), createItem('쑥갓', '채소/버섯'),
  createItem('아욱', '채소/버섯'), createItem('근대', '채소/버섯'), createItem('시래기', '채소/버섯'),
  createItem('우거지', '채소/버섯'), createItem('머위대', '채소/버섯'), createItem('고구마순', '채소/버섯'),
  createItem('고사리', '채소/버섯'), createItem('취나물', '채소/버섯'), createItem('참나물', '채소/버섯'),
  createItem('방풍나물', '채소/버섯'), createItem('곤드레나물', '채소/버섯'), createItem('명이나물', '채소/버섯'),
  createItem('비름나물', '채소/버섯'), createItem('세발나물', '채소/버섯'), createItem('유채나물', '채소/버섯'),
  createItem('쑥', '채소/버섯'), createItem('냉이', '채소/버섯'), createItem('달래', '채소/버섯'),
  createItem('씀바귀', '채소/버섯'), createItem('두릅', '채소/버섯'), createItem('죽순', '채소/버섯'),
  createItem('무', '채소/버섯'), createItem('총각무', '채소/버섯'), createItem('열무', '채소/버섯'),
  createItem('당근', '채소/버섯'), createItem('미니당근', '채소/버섯'), createItem('감자', '채소/버섯'),
  createItem('돼지감자', '채소/버섯'), createItem('고구마', '채소/버섯'), createItem('호박고구마', '채소/버섯'),
  createItem('밤고구마', '채소/버섯'), createItem('우엉', '채소/버섯'), createItem('연근', '채소/버섯'),
  createItem('도라지', '채소/버섯'), createItem('더덕', '채소/버섯'), createItem('비트', '채소/버섯'),
  createItem('콜라비', '채소/버섯'), createItem('마', '채소/버섯'), createItem('토란', '채소/버섯'),
  createItem('생강', '채소/버섯'), createItem('양파', '채소/버섯'), createItem('적양파', '채소/버섯'),
  createItem('마늘', '채소/버섯'), createItem('다진마늘', '채소/버섯'), createItem('인삼', '채소/버섯'),
  createItem('수삼', '채소/버섯'), createItem('초석잠', '채소/버섯'), createItem('야콘', '채소/버섯'),
  createItem('애호박', '채소/버섯'), createItem('쥬키니호박', '채소/버섯'), createItem('단호박', '채소/버섯'),
  createItem('늙은호박', '채소/버섯'), createItem('오이', '채소/버섯'), createItem('가시오이', '채소/버섯'),
  createItem('다다기오이', '채소/버섯'), createItem('가지', '채소/버섯'), createItem('피망', '채소/버섯'),
  createItem('파프리카(빨강)', '채소/버섯'), createItem('파프리카(노랑)', '채소/버섯'), createItem('옥수수', '채소/버섯'),
  createItem('초당옥수수', '채소/버섯'), createItem('찰옥수수', '채소/버섯'), createItem('브로콜리', '채소/버섯'),
  createItem('콜리플라워', '채소/버섯'), createItem('청양고추', '채소/버섯'), createItem('홍고추', '채소/버섯'),
  createItem('풋고추', '채소/버섯'), createItem('오이고추', '채소/버섯'), createItem('꽈리고추', '채소/버섯'),
  createItem('여주', '채소/버섯'), createItem('오크라', '채소/버섯'), createItem('완두콩', '채소/버섯'),
  createItem('강낭콩', '채소/버섯'), createItem('작두콩', '채소/버섯'), createItem('렌틸콩', '채소/버섯'),
  createItem('병아리콩', '채소/버섯'), createItem('검은콩', '채소/버섯'), createItem('서리태', '채소/버섯'),
  createItem('녹두', '채소/버섯'), createItem('팥', '채소/버섯'),
  createItem('표고버섯', '채소/버섯'), createItem('건표고버섯', '채소/버섯'), createItem('느타리버섯', '채소/버섯'),
  createItem('팽이버섯', '채소/버섯'), createItem('새송이버섯', '채소/버섯'), createItem('양송이버섯', '채소/버섯'),
  createItem('목이버섯', '채소/버섯'), createItem('만가닥버섯', '채소/버섯'), createItem('노루궁뎅이버섯', '채소/버섯'),
  createItem('상황버섯', '채소/버섯'), createItem('영지버섯', '채소/버섯'), createItem('송이버섯', '채소/버섯'),
  createItem('능이버섯', '채소/버섯'), createItem('트러플(송로버섯)', '채소/버섯'),

  // ==========================================
  // 3. 고기/계란 (Meat/Eggs)
  // ==========================================
  createItem('소 등심', '고기/계란'), createItem('소 안심', '고기/계란'), createItem('채끝살', '고기/계란'),
  createItem('차돌박이', '고기/계란'), createItem('우삼겹', '고기/계란'), createItem('소 양지(국거리)', '고기/계란'),
  createItem('소 사태', '고기/계란'), createItem('소 불고기감', '고기/계란'), createItem('소 갈비', '고기/계란'),
  createItem('LA갈비', '고기/계란'), createItem('다진 소고기', '고기/계란'), createItem('육회', '고기/계란'),
  createItem('육사시미', '고기/계란'), createItem('소 꼬리', '고기/계란'), createItem('소 우족', '고기/계란'),
  createItem('소 사골', '고기/계란'), createItem('소 스지', '고기/계란'), createItem('곱창(소)', '고기/계란'),
  createItem('대창', '고기/계란'), createItem('막창(소)', '고기/계란'), createItem('양(소위)', '고기/계란'),
  createItem('천엽', '고기/계란'), createItem('소 간', '고기/계란'),
  createItem('삼겹살', '고기/계란'), createItem('오겹살', '고기/계란'), createItem('대패삼겹살', '고기/계란'),
  createItem('목살', '고기/계란'), createItem('항정살', '고기/계란'), createItem('가브리살', '고기/계란'),
  createItem('갈매기살', '고기/계란'), createItem('돼지 갈비', '고기/계란'), createItem('돼지 등갈비', '고기/계란'),
  createItem('돼지 앞다리살', '고기/계란'), createItem('돼지 뒷다리살', '고기/계란'), createItem('돼지 등심(돈까스)', '고기/계란'),
  createItem('돼지 안심(장조림)', '고기/계란'), createItem('다진 돼지고기', '고기/계란'), createItem('족발', '고기/계란'),
  createItem('미니족', '고기/계란'), createItem('돼지 껍데기', '고기/계란'), createItem('곱창(돼지)', '고기/계란'),
  createItem('막창(돼지)', '고기/계란'), createItem('순대', '고기/계란'), createItem('편육', '고기/계란'),
  createItem('생닭(통)', '고기/계란'), createItem('토종닭', '고기/계란'), createItem('닭볶음탕용 닭', '고기/계란'),
  createItem('닭다리(북채)', '고기/계란'), createItem('닭가슴살', '고기/계란'), createItem('닭날개(윙)', '고기/계란'),
  createItem('닭봉', '고기/계란'), createItem('닭안심', '고기/계란'), createItem('닭정육(넓적다리)', '고기/계란'),
  createItem('닭발', '고기/계란'), createItem('무뼈닭발', '고기/계란'), createItem('닭근위(똥집)', '고기/계란'),
  createItem('오리(통)', '고기/계란'), createItem('오리 훈제', '고기/계란'), createItem('오리 주물럭', '고기/계란'),
  createItem('오리 로스', '고기/계란'), createItem('양고기(숄더랙)', '고기/계란'), createItem('양꼬치', '고기/계란'),
  createItem('계란', '고기/계란'), createItem('왕란', '고기/계란'), createItem('유정란', '고기/계란'),
  createItem('메추리알', '고기/계란'), createItem('훈제란', '고기/계란'), createItem('구운란', '고기/계란'),
  createItem('오리알', '고기/계란'),

  // ==========================================
  // 4. 해산물/건어물 (Seafood/Dried)
  // ==========================================
  createItem('고등어', '해산물/건어물'), createItem('자반고등어', '해산물/건어물'), createItem('갈치', '해산물/건어물'),
  createItem('조기', '해산물/건어물'), createItem('굴비', '해산물/건어물'), createItem('삼치', '해산물/건어물'),
  createItem('꽁치', '해산물/건어물'), createItem('과메기', '해산물/건어물'), createItem('광어', '해산물/건어물'),
  createItem('우럭', '해산물/건어물'), createItem('연어', '해산물/건어물'), createItem('훈제연어', '해산물/건어물'),
  createItem('참치(횟감)', '해산물/건어물'), createItem('장어', '해산물/건어물'), createItem('곰장어', '해산물/건어물'),
  createItem('동태', '해산물/건어물'), createItem('코다리', '해산물/건어물'), createItem('명태', '해산물/건어물'),
  createItem('북어', '해산물/건어물'), createItem('황태', '해산물/건어물'), createItem('노가리', '해산물/건어물'),
  createItem('먹태', '해산물/건어물'), createItem('아귀', '해산물/건어물'), createItem('대구', '해산물/건어물'),
  createItem('도미', '해산물/건어물'), createItem('민어', '해산물/건어물'), createItem('농어', '해산물/건어물'),
  createItem('방어', '해산물/건어물'), createItem('숭어', '해산물/건어물'), createItem('가자미', '해산물/건어물'),
  createItem('임연수', '해산물/건어물'), createItem('서대', '해산물/건어물'), createItem('병어', '해산물/건어물'),
  createItem('전어', '해산물/건어물'), createItem('빙어', '해산물/건어물'), createItem('도루묵', '해산물/건어물'),
  createItem('홍어', '해산물/건어물'), createItem('오징어', '해산물/건어물'), createItem('반건조오징어', '해산물/건어물'),
  createItem('마른오징어', '해산물/건어물'), createItem('갑오징어', '해산물/건어물'), createItem('문어', '해산물/건어물'),
  createItem('자숙문어', '해산물/건어물'), createItem('낙지', '해산물/건어물'), createItem('산낙지', '해산물/건어물'),
  createItem('쭈꾸미', '해산물/건어물'), createItem('새우', '해산물/건어물'), createItem('칵테일새우', '해산물/건어물'),
  createItem('대하', '해산물/건어물'), createItem('타이거새우', '해산물/건어물'), createItem('꽃게', '해산물/건어물'),
  createItem('대게', '해산물/건어물'), createItem('킹크랩', '해산물/건어물'), createItem('랍스터', '해산물/건어물'),
  createItem('가재', '해산물/건어물'), createItem('딱새우', '해산물/건어물'), createItem('전복', '해산물/건어물'),
  createItem('굴', '해산물/건어물'), createItem('석화', '해산물/건어물'), createItem('홍합', '해산물/건어물'),
  createItem('바지락', '해산물/건어물'), createItem('모시조개', '해산물/건어물'), createItem('동죽', '해산물/건어물'),
  createItem('백합', '해산물/건어물'), createItem('가리비', '해산물/건어물'), createItem('키조개', '해산물/건어물'),
  createItem('관자', '해산물/건어물'), createItem('꼬막', '해산물/건어물'), createItem('피꼬막', '해산물/건어물'),
  createItem('소라', '해산물/건어물'), createItem('골뱅이', '해산물/건어물'), createItem('우렁이', '해산물/건어물'),
  createItem('멍게', '해산물/건어물'), createItem('해삼', '해산물/건어물'), createItem('개불', '해산물/건어물'),
  createItem('성게알(우니)', '해산물/건어물'), createItem('미역', '해산물/건어물'), createItem('건미역', '해산물/건어물'),
  createItem('물미역', '해산물/건어물'), createItem('다시마', '해산물/건어물'), createItem('김', '해산물/건어물'),
  createItem('조미김', '해산물/건어물'), createItem('김밥김', '해산물/건어물'), createItem('파래', '해산물/건어물'),
  createItem('매생이', '해산물/건어물'), createItem('톳', '해산물/건어물'), createItem('꼬시래기', '해산물/건어물'),
  createItem('멸치(국물용)', '해산물/건어물'), createItem('멸치(볶음용)', '해산물/건어물'), createItem('건새우', '해산물/건어물'),
  createItem('진미채', '해산물/건어물'), createItem('쥐포', '해산물/건어물'), createItem('뱅어포', '해산물/건어물'),
  createItem('아귀채', '해산물/건어물'),

  // ==========================================
  // 5. 곡물/면 (Grains/Noodles)
  // ==========================================
  createItem('쌀(백미)', '곡물/면'), createItem('현미', '곡물/면'), createItem('찹쌀', '곡물/면'),
  createItem('흑미', '곡물/면'), createItem('보리', '곡물/면'), createItem('귀리(오트밀)', '곡물/면'),
  createItem('율무', '곡물/면'), createItem('수수', '곡물/면'), createItem('기장', '곡물/면'),
  createItem('퀴노아', '곡물/면'), createItem('누룽지', '곡물/면'), createItem('즉석밥', '곡물/면'),
  createItem('밀가루(중력분)', '곡물/면'), createItem('밀가루(박력분)', '곡물/면'), createItem('밀가루(강력분)', '곡물/면'),
  createItem('통밀가루', '곡물/면'), createItem('부침가루', '곡물/면'), createItem('튀김가루', '곡물/면'),
  createItem('빵가루', '곡물/면'), createItem('전분(녹말)', '곡물/면'), createItem('찹쌀가루', '곡물/면'),
  createItem('들깨가루', '곡물/면'), createItem('콩가루', '곡물/면'), createItem('도토리가루', '곡물/면'),
  createItem('소면', '곡물/면'), createItem('중면', '곡물/면'), createItem('칼국수면', '곡물/면'),
  createItem('우동면', '곡물/면'), createItem('생면', '곡물/면'), createItem('당면', '곡물/면'),
  createItem('납작당면', '곡물/면'), createItem('쫄면', '곡물/면'), createItem('냉면사리', '곡물/면'),
  createItem('메밀면', '곡물/면'), createItem('파스타면(스파게티)', '곡물/면'), createItem('파스타면(펜네)', '곡물/면'),
  createItem('파스타면(푸실리)', '곡물/면'), createItem('쌀국수면', '곡물/면'), createItem('분모자', '곡물/면'),
  createItem('옥수수면', '곡물/면'), createItem('라면(신라면)', '곡물/면'), createItem('라면(진라면)', '곡물/면'),
  createItem('라면(너구리)', '곡물/면'), createItem('라면(안성탕면)', '곡물/면'), createItem('라면(삼양라면)', '곡물/면'),
  createItem('짜파게티', '곡물/면'), createItem('비빔면', '곡물/면'), createItem('불닭볶음면', '곡물/면'),
  createItem('컵라면(육개장)', '곡물/면'), createItem('컵라면(신라면)', '곡물/면'), createItem('컵라면(튀김우동)', '곡물/면'),
  createItem('컵라면(참깨라면)', '곡물/면'), createItem('사리곰탕면', '곡물/면'), createItem('시리얼', '곡물/면'),
  createItem('그래놀라', '곡물/면'),

  // ==========================================
  // 6. 유제품/두부 (Dairy/Tofu)
  // ==========================================
  createItem('두부(부침용)', '유제품/두부'), createItem('두부(찌개용)', '유제품/두부'), createItem('순두부', '유제품/두부'),
  createItem('연두부', '유제품/두부'), createItem('두부면', '유제품/두부'), createItem('건두부(포두부)', '유제품/두부'),
  createItem('푸주', '유제품/두부'), createItem('유부', '유제품/두부'), createItem('비지', '유제품/두부'),
  createItem('도토리묵', '유제품/두부'), createItem('청포묵', '유제품/두부'), createItem('메밀묵', '유제품/두부'),
  createItem('우뭇가사리', '유제품/두부'), createItem('곤약', '유제품/두부'), createItem('실곤약', '유제품/두부'),
  createItem('콩물', '유제품/두부'), createItem('우유', '유제품/두부'), createItem('저지방우유', '유제품/두부'),
  createItem('멸균우유', '유제품/두부'), createItem('초코우유', '유제품/두부'), createItem('딸기우유', '유제품/두부'),
  createItem('바나나우유', '유제품/두부'), createItem('두유', '유제품/두부'), createItem('아몬드브리즈', '유제품/두부'),
  createItem('귀리우유(오트밀크)', '유제품/두부'), createItem('요거트(플레인)', '유제품/두부'), createItem('그릭요거트', '유제품/두부'),
  createItem('마시는요거트', '유제품/두부'), createItem('체다치즈', '유제품/두부'), createItem('모짜렐라치즈', '유제품/두부'),
  createItem('스트링치즈', '유제품/두부'), createItem('크림치즈', '유제품/두부'), createItem('리코타치즈', '유제품/두부'),
  createItem('부라타치즈', '유제품/두부'), createItem('파마산치즈가루', '유제품/두부'), createItem('버터', '유제품/두부'),
  createItem('무염버터', '유제품/두부'), createItem('마가린', '유제품/두부'), createItem('생크림', '유제품/두부'),
  createItem('휘핑크림', '유제품/두부'), createItem('연유', '유제품/두부'),

  // ==========================================
  // 7. 햄/가공식품 (Processed)
  // ==========================================
  createItem('스팸', '햄/가공식품'), createItem('런천미트', '햄/가공식품'), createItem('리챔', '햄/가공식품'),
  createItem('슬라이스 햄', '햄/가공식품'), createItem('김밥용 햄', '햄/가공식품'), createItem('베이컨', '햄/가공식품'),
  createItem('비엔나 소시지', '햄/가공식품'), createItem('프랑크 소시지', '햄/가공식품'), createItem('부대찌개용 소시지', '햄/가공식품'),
  createItem('살라미', '햄/가공식품'), createItem('페퍼로니', '햄/가공식품'), createItem('맛살', '햄/가공식품'),
  createItem('크래미', '햄/가공식품'), createItem('사각어묵', '햄/가공식품'), createItem('봉어묵', '햄/가공식품'),
  createItem('종합어묵', '햄/가공식품'), createItem('어묵바', '햄/가공식품'), createItem('고기만두', '햄/가공식품'),
  createItem('김치만두', '햄/가공식품'), createItem('새우만두', '햄/가공식품'), createItem('갈비만두', '햄/가공식품'),
  createItem('물만두', '햄/가공식품'), createItem('군만두', '햄/가공식품'), createItem('왕만두', '햄/가공식품'),
  createItem('냉동 피자', '햄/가공식품'), createItem('냉동 돈까스', '햄/가공식품'), createItem('치즈돈까스', '햄/가공식품'),
  createItem('치킨너겟', '햄/가공식품'), createItem('용가리치킨', '햄/가공식품'), createItem('팝콘치킨', '햄/가공식품'),
  createItem('동그랑땡', '햄/가공식품'), createItem('떡갈비', '햄/가공식품'), createItem('미트볼', '햄/가공식품'),
  createItem('함박스테이크', '햄/가공식품'), createItem('핫도그', '햄/가공식품'), createItem('김말이', '햄/가공식품'),
  createItem('야채튀김', '햄/가공식품'), createItem('오징어튀김', '햄/가공식품'), createItem('새우튀김', '햄/가공식품'),
  createItem('감자튀김', '햄/가공식품'), createItem('해시브라운', '햄/가공식품'), createItem('참치캔', '햄/가공식품'),
  createItem('야채참치', '햄/가공식품'), createItem('고추참치', '햄/가공식품'), createItem('골뱅이캔', '햄/가공식품'),
  createItem('옥수수캔(스위트콘)', '햄/가공식품'), createItem('꽁치캔', '햄/가공식품'), createItem('고등어캔', '햄/가공식품'),
  createItem('깻잎통조림', '햄/가공식품'), createItem('장조림통조림', '햄/가공식품'), createItem('황도캔', '햄/가공식품'),
  createItem('파인애플캔', '햄/가공식품'), createItem('번데기캔', '햄/가공식품'),

  // ==========================================
  // 8. 간식/빵/떡 (Snacks/Bread/RiceCake)
  // ==========================================
  createItem('식빵', '간식/빵/떡'), createItem('우유식빵', '간식/빵/떡'), createItem('모닝빵', '간식/빵/떡'),
  createItem('바게트', '간식/빵/떡'), createItem('베이글', '간식/빵/떡'), createItem('크루아상', '간식/빵/떡'),
  createItem('단팥빵', '간식/빵/떡'), createItem('소보로빵', '간식/빵/떡'), createItem('크림빵', '간식/빵/떡'),
  createItem('카스테라', '간식/빵/떡'), createItem('샌드위치', '간식/빵/떡'), createItem('햄버거', '간식/빵/떡'),
  createItem('케이크', '간식/빵/떡'), createItem('치즈케이크', '간식/빵/떡'), createItem('티라미수', '간식/빵/떡'),
  createItem('마카롱', '간식/빵/떡'), createItem('도넛', '간식/빵/떡'), createItem('와플', '간식/빵/떡'),
  createItem('호떡', '간식/빵/떡'), createItem('붕어빵', '간식/빵/떡'), createItem('찐빵/호빵', '간식/빵/떡'),
  createItem('떡볶이떡(밀떡)', '간식/빵/떡'), createItem('떡볶이떡(쌀떡)', '간식/빵/떡'), createItem('조랭이떡', '간식/빵/떡'),
  createItem('떡국떡', '간식/빵/떡'), createItem('가래떡', '간식/빵/떡'), createItem('인절미', '간식/빵/떡'),
  createItem('송편', '간식/빵/떡'), createItem('절편', '간식/빵/떡'), createItem('백설기', '간식/빵/떡'),
  createItem('시루떡', '간식/빵/떡'), createItem('찹쌀떡', '간식/빵/떡'), createItem('꿀떡', '간식/빵/떡'),
  createItem('바람떡', '간식/빵/떡'), createItem('약식', '간식/빵/떡'), createItem('경단', '간식/빵/떡'),
  createItem('새우깡', '간식/빵/떡'), createItem('감자칩(포카칩)', '간식/빵/떡'), createItem('프링글스', '간식/빵/떡'),
  createItem('콘칩', '간식/빵/떡'), createItem('꼬깔콘', '간식/빵/떡'), createItem('맛동산', '간식/빵/떡'),
  createItem('홈런볼', '간식/빵/떡'), createItem('초코파이', '간식/빵/떡'), createItem('오예스', '간식/빵/떡'),
  createItem('몽쉘', '간식/빵/떡'), createItem('쿠크다스', '간식/빵/떡'), createItem('버터링', '간식/빵/떡'),
  createItem('다이제', '간식/빵/떡'), createItem('에이스', '간식/빵/떡'), createItem('초콜릿', '간식/빵/떡'),
  createItem('빼빼로', '간식/빵/떡'), createItem('젤리(마이구미)', '간식/빵/떡'), createItem('하리보', '간식/빵/떡'),
  createItem('사탕', '간식/빵/떡'), createItem('마시멜로', '간식/빵/떡'), createItem('팝콘', '간식/빵/떡'),
  createItem('나초', '간식/빵/떡'), createItem('건빵', '간식/빵/떡'), createItem('오징어땅콩', '간식/빵/떡'),
  createItem('아이스크림(바)', '간식/빵/떡'), createItem('메로나', '간식/빵/떡'), createItem('돼지바', '간식/빵/떡'),
  createItem('스크류바', '간식/빵/떡'), createItem('아이스크림(콘)', '간식/빵/떡'), createItem('월드콘', '간식/빵/떡'),
  createItem('아이스크림(컵)', '간식/빵/떡'), createItem('투게더', '간식/빵/떡'), createItem('하겐다즈', '간식/빵/떡'),
  createItem('설레임', '간식/빵/떡'), createItem('폴라포', '간식/빵/떡'), createItem('팥빙수', '간식/빵/떡'),

  // ==========================================
  // 9. 음료 (Drinks)
  // ==========================================
  createItem('생수', '음료'), createItem('탄산수', '음료'), createItem('콜라', '음료'), createItem('제로콜라', '음료'),
  createItem('사이다', '음료'), createItem('제로사이다', '음료'), createItem('환타', '음료'), createItem('오렌지주스', '음료'),
  createItem('포도주스', '음료'), createItem('토마토주스', '음료'), createItem('알로에주스', '음료'), createItem('사과주스', '음료'),
  createItem('아메리카노', '음료'), createItem('믹스커피', '음료'), createItem('라떼', '음료'), createItem('캔커피', '음료'),
  createItem('박카스', '음료'), createItem('비타500', '음료'), createItem('핫식스', '음료'), createItem('레드불', '음료'),
  createItem('이온음료(포카리)', '음료'), createItem('파워에이드', '음료'), createItem('보리차', '음료'), createItem('옥수수수염차', '음료'),
  createItem('녹차', '음료'), createItem('홍차', '음료'), createItem('유자차', '음료'), createItem('식혜', '음료'),
  createItem('수정과', '음료'), createItem('매실청/음료', '음료'), createItem('요구르트', '음료'), 
  createItem('소주', '음료'), createItem('맥주', '음료'), createItem('막걸리', '음료'), 
  createItem('와인', '음료'), createItem('위스키', '음료'), createItem('청하', '음료'),
  createItem('백세주', '음료'), createItem('매화수', '음료'), createItem('산사춘', '음료'),
  createItem('복분자주', '음료'), createItem('화요', '음료'), createItem('일품진로', '음료'),
  createItem('안동소주', '음료'), createItem('한라산소주', '음료'), createItem('이강주', '음료'),
  createItem('문배주', '음료'), createItem('한산소곡주', '음료'), createItem('동동주', '음료'),
  createItem('과일소주', '음료'), createItem('연태고량주', '음료'), createItem('이과두주', '음료'),
  createItem('공부가주', '음료'), createItem('칭따오', '음료'), createItem('사케(정종)', '음료'),
  createItem('하이볼', '음료'), createItem('보드카', '음료'), createItem('데킬라', '음료'),
  createItem('진(Gin)', '음료'), createItem('럼(Rum)', '음료'), createItem('브랜디(꼬냑)', '음료'),
  createItem('샴페인', '음료'),

  // ==========================================
  // 10. 양념/조미료 (Sauces/Condiments)
  // ==========================================
  createItem('고추장', '양념/조미료'), createItem('초고추장', '양념/조미료'), createItem('된장', '양념/조미료'),
  createItem('쌈장', '양념/조미료'), createItem('춘장', '양념/조미료'), createItem('청국장', '양념/조미료'),
  createItem('진간장', '양념/조미료'), createItem('국간장', '양념/조미료'), createItem('양조간장', '양념/조미료'),
  createItem('맛간장', '양념/조미료'), createItem('쯔유', '양념/조미료'), createItem('케첩', '양념/조미료'),
  createItem('마요네즈', '양념/조미료'), createItem('머스타드', '양념/조미료'), createItem('홀그레인머스타드', '양념/조미료'),
  createItem('토마토소스', '양념/조미료'), createItem('크림소스', '양념/조미료'), createItem('로제소스', '양념/조미료'),
  createItem('굴소스', '양념/조미료'), createItem('불닭소스', '양념/조미료'), createItem('데리야끼소스', '양념/조미료'),
  createItem('돈까스소스', '양념/조미료'), createItem('스테이크소스', '양념/조미료'), createItem('칠리소스', '양념/조미료'),
  createItem('스리라차소스', '양념/조미료'), createItem('피쉬소스', '양념/조미료'), createItem('딸기잼', '양념/조미료'),
  createItem('사과잼', '양념/조미료'), createItem('땅콩버터', '양념/조미료'), createItem('누텔라', '양념/조미료'),
  createItem('소금', '양념/조미료'), createItem('맛소금', '양념/조미료'), createItem('천일염', '양념/조미료'),
  createItem('허브솔트', '양념/조미료'), createItem('설탕', '양념/조미료'), createItem('흑설탕', '양념/조미료'),
  createItem('올리고당', '양념/조미료'), createItem('물엿', '양념/조미료'), createItem('꿀', '양념/조미료'),
  createItem('매실청', '양념/조미료'), createItem('고춧가루', '양념/조미료'), createItem('식초', '양념/조미료'),
  createItem('사과식초', '양념/조미료'), createItem('발사믹식초', '양념/조미료'), createItem('후추', '양념/조미료'),
  createItem('통후추', '양념/조미료'), createItem('참기름', '양념/조미료'), createItem('들기름', '양념/조미료'),
  createItem('고추기름', '양념/조미료'), createItem('식용유(콩기름)', '양념/조미료'), createItem('올리브유', '양념/조미료'),
  createItem('카놀라유', '양념/조미료'), createItem('포도씨유', '양념/조미료'), createItem('해바라기유', '양념/조미료'),
  createItem('버터', '양념/조미료'), createItem('다시다', '양념/조미료'), createItem('미원', '양념/조미료'),
  createItem('치킨스톡', '양념/조미료'), createItem('연두', '양념/조미료'), createItem('새우젓', '양념/조미료'),
  createItem('와사비', '양념/조미료'), createItem('겨자', '양념/조미료'), createItem('강황가루(카레)', '양념/조미료'),
  createItem('짜장가루', '양념/조미료'),

  // ==========================================
  // 11. 편의점 (Convenience Store)
  // ==========================================
  createItem('삼각김밥(전주비빔)', '편의점'), createItem('삼각김밥(참치마요)', '편의점'),
  createItem('삼각김밥(스팸)', '편의점'), createItem('김밥(편의점)', '편의점'),
  createItem('도시락(편의점)', '편의점'), createItem('치킨도시락', '편의점'),
  createItem('불고기도시락', '편의점'), createItem('제육볶음도시락', '편의점'),
  createItem('샌드위치(인가)', '편의점'), createItem('햄치즈샌드위치', '편의점'),
  createItem('햄버거(편의점)', '편의점'), createItem('치킨버거', '편의점'),
  createItem('핫바/소시지바', '편의점'), createItem('치즈핫바', '편의점'),
  createItem('닭다리(훈제)', '편의점'), createItem('족발(미니팩)', '편의점'),
  createItem('편육(미니팩)', '편의점'), createItem('순대(미니팩)', '편의점'),
  createItem('어묵탕(컵)', '편의점'), createItem('컵떡볶이', '편의점'),
  createItem('로제떡볶이(컵)', '편의점'), createItem('마라떡볶이', '편의점'),
  createItem('감동란/반숙란', '편의점'), createItem('구운계란(2구)', '편의점'),
  createItem('스트링치즈', '편의점'), createItem('치즈스틱', '편의점'),
  createItem('소세지야채볶음', '편의점'), createItem('맥스봉/천하장사', '편의점'),
  createItem('육포', '편의점'), createItem('꾸이맨', '편의점'),
  createItem('맛밤', '편의점'), createItem('고구마말랭이', '편의점'),
  createItem('얼음컵', '편의점'), createItem('파우치커피', '편의점'),
  createItem('뚱바(바나나우유)', '편의점'), createItem('허쉬초코우유', '편의점'),
  createItem('불닭소스', '편의점'), createItem('마요네즈(튜브)', '편의점'),

  // ==========================================
  // 12. 반찬 (Side Dishes)
  // ==========================================
  createItem('배추김치', '반찬'), createItem('총각김치', '반찬'), createItem('깍두기', '반찬'),
  createItem('파김치', '반찬'), createItem('열무김치', '반찬'), createItem('갓김치', '반찬'),
  createItem('백김치', '반찬'), createItem('동치미', '반찬'), createItem('오이소박이', '반찬'),
  createItem('나박김치', '반찬'), createItem('겉절이', '반찬'), createItem('부추김치', '반찬'),
  createItem('깻잎김치', '반찬'), createItem('볶음김치', '반찬'),
  createItem('멸치볶음(잔멸치)', '반찬'), createItem('멸치볶음(고추장)', '반찬'),
  createItem('진미채볶음', '반찬'), createItem('오징어실채볶음', '반찬'),
  createItem('건새우볶음', '반찬'), createItem('명엽채볶음', '반찬'),
  createItem('콩자반(콩장)', '반찬'), createItem('연근조림', '반찬'), createItem('우엉조림', '반찬'),
  createItem('감자조림', '반찬'), createItem('두부조림', '반찬'), createItem('알감자조림', '반찬'),
  createItem('메추리알장조림', '반찬'), createItem('쇠고기장조림', '반찬'), createItem('돼지고기장조림', '반찬'),
  createItem('계란말이', '반찬'), createItem('계란찜', '반찬'), createItem('소세지야채볶음', '반찬'),
  createItem('어묵볶음', '반찬'), createItem('미역줄기볶음', '반찬'), createItem('감자채볶음', '반찬'),
  createItem('시금치나물', '반찬'), createItem('콩나물무침', '반찬'), createItem('숙주나물', '반찬'),
  createItem('무생채', '반찬'), createItem('고사리나물', '반찬'), createItem('도라지무침', '반찬'),
  createItem('취나물무침', '반찬'), createItem('가지무침', '반찬'), createItem('애호박볶음', '반찬'),
  createItem('잡채', '반찬'), createItem('도토리묵무침', '반찬'), createItem('청포묵무침', '반찬'),
  createItem('양념게장', '반찬'), createItem('간장게장', '반찬'), createItem('새우장', '반찬'),
  createItem('오징어젓갈', '반찬'), createItem('낙지젓갈', '반찬'), createItem('명란젓갈', '반찬'),
  createItem('창란젓갈', '반찬'), createItem('갈치속젓', '반찬'), createItem('꼴뚜기젓', '반찬'),
  createItem('단무지', '반찬'), createItem('피클', '반찬'), createItem('마늘장아찌', '반찬'),
  createItem('고추장아찌', '반찬'), createItem('양파장아찌', '반찬'), createItem('깻잎장아찌', '반찬'),
  createItem('무말랭이무침', '반찬'), createItem('파래무침', '반찬'),

  // ==========================================
  // 13. 즉석식품 (Instant Foods/Retort)
  // ==========================================
  createItem('3분카레', '즉석식품'), createItem('3분짜장', '즉석식품'), createItem('3분미트볼', '즉석식품'),
  createItem('즉석밥(햇반)', '즉석식품'), createItem('현미즉석밥', '즉석식품'), createItem('흑미즉석밥', '즉석식품'),
  createItem('컵밥(치킨마요)', '즉석식품'), createItem('컵밥(제육덮밥)', '즉석식품'),
  createItem('컵밥(미역국밥)', '즉석식품'), createItem('컵밥(황태국밥)', '즉석식품'),
  createItem('즉석죽(전복죽)', '즉석식품'), createItem('즉석죽(소고기죽)', '즉석식품'),
  createItem('즉석죽(단호박죽)', '즉석식품'), createItem('누룽지(컵)', '즉석식품'),
  createItem('즉석국(미역국)', '즉석식품'), createItem('즉석국(육개장)', '즉석식품'),
  createItem('즉석국(사골곰탕)', '즉석식품'), createItem('즉석국(된장국)', '즉석식품'),
  createItem('즉석국(북어국)', '즉석식품'), createItem('갈비탕(파우치)', '즉석식품'),
  createItem('삼계탕(파우치)', '즉석식품'), createItem('추어탕(파우치)', '즉석식품'),
  createItem('순대국(파우치)', '즉석식품'), createItem('김치찌개(파우치)', '즉석식품'),
  createItem('냉동볶음밥(새우)', '즉석식품'), createItem('냉동볶음밥(김치)', '즉석식품'),
  createItem('냉동볶음밥(낙지)', '즉석식품'), createItem('냉동주먹밥', '즉석식품'),
  createItem('냉동피자', '즉석식품'), createItem('냉동핫도그', '즉석식품'),
  createItem('냉동만두', '즉석식품'), createItem('브리또(냉동)', '즉석식품'),
  createItem('치킨너겟(냉동)', '즉석식품'), createItem('함박스테이크(냉동)', '즉석식품'),
  createItem('떡갈비(냉동)', '즉석식품'), createItem('동그랑땡(냉동)', '즉석식품'),
  createItem('밀키트(부대찌개)', '즉석식품'), createItem('밀키트(밀푀유나베)', '즉석식품'),
  createItem('밀키트(파스타)', '즉석식품'), createItem('밀키트(떡볶이)', '즉석식품'),
  createItem('스프(분말)', '즉석식품'), createItem('스프(액상)', '즉석식품'),
  createItem('전투식량', '즉석식품'), createItem('건빵(봉지)', '즉석식품'),
];

export const DEFAULT_EQUIPMENT: Ingredient[] = [
  // 침구/숙박 (Sleeping Gear)
  createEquip('침낭 (동계용)', '침구/숙박', 5),
  createEquip('침낭 (3계절용)', '침구/숙박', 4),
  createEquip('침낭 (하계용)', '침구/숙박', 3),
  createEquip('침낭 라이너', '침구/숙박', 2),
  createEquip('에어매트 (R4.0이상)', '침구/숙박', 5),
  createEquip('자충매트', '침구/숙박', 3),
  createEquip('발포매트 (지라이트솔)', '침구/숙박', 2),
  createEquip('에어 베개', '침구/숙박', 3),
  createEquip('그라운드 시트 (풋프린트)', '침구/숙박', 2),
  createEquip('은박 담요 (비상용)', '침구/숙박', 1),

  // 취사/식음료 (Cooking/Food)
  createEquip('리액터 스토브', '취사/식음료', 5),
  createEquip('경량 버너', '취사/식음료', 3),
  createEquip('이소가스 (230g)', '취사/식음료', 2),
  createEquip('이소가스 (110g)', '취사/식음료', 1),
  createEquip('티타늄 코펠 세트', '취사/식음료', 5),
  createEquip('알루미늄 코펠', '취사/식음료', 3),
  createEquip('시에라컵 (티타늄)', '취사/식음료', 4),
  createEquip('시에라컵 (스테인리스)', '취사/식음료', 2),
  createEquip('티타늄 머그컵', '취사/식음료', 4),
  createEquip('수저 세트 (티타늄)', '취사/식음료', 4),
  createEquip('나무 젓가락', '취사/식음료', 1),
  createEquip('폴딩 국자', '취사/식음료', 2),
  createEquip('미니 가위/칼', '취사/식음료', 3),
  createEquip('오피넬 나이프', '취사/식음료', 4),
  createEquip('양념통 세트', '취사/식음료', 2),
  createEquip('날진 물통 (1L)', '취사/식음료', 3),
  createEquip('소프트 쿨러백', '취사/식음료', 3),
  createEquip('보온병', '취사/식음료', 3),
  createEquip('커피 드리퍼', '취사/식음료', 3),

  // 위생/세면 (Hygiene/Toiletries)
  createEquip('칫솔/치약 세트', '위생/세면', 2),
  createEquip('종이비누', '위생/세면', 1),
  createEquip('올인원 워시 (소분)', '위생/세면', 2),
  createEquip('스포츠 타월 (건식)', '위생/세면', 3),
  createEquip('휴지 (롤)', '위생/세면', 1),
  createEquip('물티슈 (대형)', '위생/세면', 1),
  createEquip('클렌징 티슈', '위생/세면', 2),
  createEquip('립밤', '위생/세면', 1),
  createEquip('선크림', '위생/세면', 2),
  createEquip('모기 기피제', '위생/세면', 2),
  createEquip('버물리', '위생/세면', 1),
  createEquip('구급상자 (밴드/연고)', '위생/세면', 3),
  createEquip('손세정제', '위생/세면', 1),

  // 가방/패킹 (Bags/Packing)
  createEquip('대형 새들백 (15L)', '가방/패킹', 5),
  createEquip('프레임백', '가방/패킹', 4),
  createEquip('핸들바백', '가방/패킹', 4),
  createEquip('탑튜브백', '가방/패킹', 3),
  createEquip('스템백 (푸드파우치)', '가방/패킹', 2),
  createEquip('패니어 (방수)', '가방/패킹', 5),
  createEquip('압축색 (S)', '가방/패킹', 2),
  createEquip('압축색 (M)', '가방/패킹', 2),
  createEquip('드라이백', '가방/패킹', 3),
  createEquip('카고 케이지', '가방/패킹', 3),
  createEquip('스트랩 (짐 끈)', '가방/패킹', 1),

  // 공구/정비 (Tools/Maintenance)
  createEquip('휴대용 멀티툴', '공구/정비', 4),
  createEquip('미니 펌프', '공구/정비', 3),
  createEquip('CO2 인젝터/카트리지', '공구/정비', 3),
  createEquip('타이어 레버', '공구/정비', 2),
  createEquip('펑크 패치 키트', '공구/정비', 2),
  createEquip('예비 튜브', '공구/정비', 3),
  createEquip('체인 오일 (건식)', '공구/정비', 2),
  createEquip('케이블 타이', '공구/정비', 1),
  createEquip('절연 테이프', '공구/정비', 1),
  createEquip('장갑 (작업용 목장갑)', '공구/정비', 1),

  // 의류/잡화 (Clothing/Etc)
  createEquip('경량 패딩', '의류/잡화', 5),
  createEquip('바람막이 자켓', '의류/잡화', 4),
  createEquip('우의 (판초)', '의류/잡화', 3),
  createEquip('슬리퍼 (크록스)', '의류/잡화', 3),
  createEquip('등산 양말', '의류/잡화', 2),
  createEquip('버프 (넥워머)', '의류/잡화', 2),
  createEquip('팔토시', '의류/잡화', 2),
  createEquip('선글라스', '의류/잡화', 4),
  createEquip('핫팩', '의류/잡화', 1),
  createEquip('비니 (모자)', '의류/잡화', 2),

  // 전자기기/조명 (Electronics/Light)
  createEquip('헤드랜턴', '전자기기/조명', 4),
  createEquip('미니 랜턴 (골제로)', '전자기기/조명', 5),
  createEquip('크레모아 랜턴', '전자기기/조명', 5),
  createEquip('자전거 전조등', '전자기기/조명', 4),
  createEquip('자전거 후미등', '전자기기/조명', 3),
  createEquip('충전 케이블 (C타입)', '전자기기/조명', 1),
  createEquip('충전 케이블 (라이트닝)', '전자기기/조명', 1),
  createEquip('블루투스 스피커', '전자기기/조명', 3),
  
  // 캠핑가구 (Furniture)
  createEquip('경량 체어 (헬리녹스)', '가방/패킹', 5),
  createEquip('미니 테이블', '가방/패킹', 4),
  createEquip('방석매트', '가방/패킹', 2),
];

// Semantic Color Mapping for Categories
const CATEGORY_STYLES: Record<string, string> = {
  // Food Categories
  '과일': 'bg-rose-100 text-rose-800 border-rose-200 ring-rose-100',
  '채소/버섯': 'bg-emerald-100 text-emerald-800 border-emerald-200 ring-emerald-100',
  '고기/계란': 'bg-red-100 text-red-800 border-red-200 ring-red-100',
  '해산물/건어물': 'bg-cyan-100 text-cyan-800 border-cyan-200 ring-cyan-100',
  '곡물/면': 'bg-amber-100 text-amber-800 border-amber-200 ring-amber-100',
  '유제품/두부': 'bg-stone-100 text-stone-800 border-stone-200 ring-stone-100',
  '햄/가공식품': 'bg-orange-100 text-orange-800 border-orange-200 ring-orange-100',
  '간식/빵/떡': 'bg-pink-100 text-pink-800 border-pink-200 ring-pink-100',
  '음료': 'bg-blue-100 text-blue-800 border-blue-200 ring-blue-100',
  '양념/조미료': 'bg-yellow-100 text-yellow-800 border-yellow-200 ring-yellow-100',
  '편의점': 'bg-indigo-100 text-indigo-800 border-indigo-200 ring-indigo-100',
  '반찬': 'bg-lime-100 text-lime-800 border-lime-200 ring-lime-100',
  '즉석식품': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 ring-fuchsia-100',
  
  // Equipment Categories (Updated for Bike Camping)
  '침구/숙박': 'bg-indigo-100 text-indigo-800 border-indigo-200 ring-indigo-100',
  '취사/식음료': 'bg-orange-100 text-orange-800 border-orange-200 ring-orange-100',
  '위생/세면': 'bg-teal-100 text-teal-800 border-teal-200 ring-teal-100',
  '가방/패킹': 'bg-slate-200 text-slate-800 border-slate-300 ring-slate-200',
  '공구/정비': 'bg-zinc-200 text-zinc-800 border-zinc-300 ring-zinc-200',
  '의류/잡화': 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-50',
  '전자기기/조명': 'bg-yellow-100 text-yellow-800 border-yellow-200 ring-yellow-100',

  '기타': 'bg-gray-100 text-gray-800 border-gray-200 ring-gray-100',
};

// Fallback colors for custom categories or misses
const FALLBACK_STYLES = [
  'bg-teal-100 text-teal-800 border-teal-200 ring-teal-100',
  'bg-violet-100 text-violet-800 border-violet-200 ring-violet-100',
  'bg-sky-100 text-sky-800 border-sky-200 ring-sky-100',
  'bg-emerald-100 text-emerald-800 border-emerald-200 ring-emerald-100',
];

export const getCategoryColor = (category: string): string => {
  // Check exact match
  if (CATEGORY_STYLES[category]) {
    return CATEGORY_STYLES[category];
  }
  
  // Hash for consistent fallback
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_STYLES.length;
  return FALLBACK_STYLES[index];
};
