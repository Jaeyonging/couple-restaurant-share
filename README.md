# 커플 맛집 공유 서비스

커플끼리 맛집을 함께 저장하고 공유하는 웹 서비스입니다.

둘이 발견한 식당을 저장해두고, 별점과 댓글을 남기며, 언제 방문했는지까지 기록할 수 있습니다. 맛집 리스트를 카카오톡으로 주고받거나 메모장에 따로 관리하는 불편함에서 출발했습니다.

---

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [핵심 구현 사항](#핵심-구현-사항)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [API 엔드포인트](#api-엔드포인트)
- [데이터베이스 스키마](#데이터베이스-스키마)

---

## 프로젝트 개요

**개발 인원**: 1명 (풀스택)  
**배포**: https://couple.jaeyonging.com (Apache, PM2)

초대코드로 파트너와 연결하면 맛집 리스트가 자동으로 공유됩니다. 네이버 지도 API로 식당을 검색해 즐겨찾기에 추가하고, 서로 별점과 댓글을 남길 수 있습니다. 여기에 방문 사진, 데이트 일정, 매일 하나씩 주고받는 오늘의 질문 기능이 더해져 있습니다.

---

## 주요 기능

### 인증 및 커플 연결

이메일 가입과 카카오 소셜 로그인을 지원합니다. 로그인 후 6자리 초대코드를 생성해 파트너에게 공유하면 커플로 연결됩니다. 모바일에서는 Web Share API로, 미지원 환경에서는 클립보드 복사로 fallback됩니다.

만난 날짜를 등록하면 홈 화면에서 D+N으로 표시됩니다.

### 맛집 검색

네이버 로컬 검색 API를 연동했습니다. 한 번 검색하면 결과가 DB에 쌓여서, 같은 키워드나 관련 키워드를 다시 검색할 때 점점 더 많은 결과를 볼 수 있습니다. 스크롤을 내리면 이렇게 누적된 결과가 추가로 로딩됩니다.

퀵 검색 칩(주변 맛집, 카페, 한식 등)과 내 위치 GPS 버튼도 있습니다.

### 리뷰 및 방문 기록

즐겨찾기 목록은 카드 그리드로 표시됩니다. 카드를 누르면 바텀시트로 상세 화면이 열리고, 별점과 댓글을 남길 수 있습니다. 방문한 날짜를 기록하거나 방문 사진을 올릴 수 있습니다. 사진은 프론트에서 canvas로 압축(최대 1024px, JPEG 0.82)된 후 저장됩니다.

### 데이트 달력

월별 캘린더에서 일정을 추가하고 관리할 수 있습니다. 일정이 있는 날은 핑크 점, 방문 기록이 있는 날은 초록 점으로 표시됩니다. 파트너가 추가한 일정도 함께 보입니다. 홈 화면에서 가장 가까운 다음 일정을 D-day 카드로 보여줍니다.

### 오늘의 질문

매일 커플에게 질문 하나가 주어집니다. 80개 이상의 질문 풀에서 순환하며, 둘 다 답변해야 다음 날 새 질문으로 넘어갑니다. 한 명이 아직 답변하지 않았다면 같은 질문이 유지됩니다. 내가 먼저 답변하면 파트너 답변이 가려지고, 파트너도 답변하면 서로의 답을 볼 수 있습니다.

### 파트너 활동 알림

파트너가 맛집을 저장하거나 별점을 남기거나 일정을 추가하면 알림이 쌓입니다. 홈 헤더의 벨 아이콘으로 확인하며, 열면 자동으로 읽음 처리됩니다.

---

## 기술 스택

**Backend**  
Node.js + Express 4, MySQL, JWT, 카카오 OAuth, crypto(SHA-256)

**Frontend**  
React 18 + TypeScript, Vite, Zustand, React Query, React Router v6, Tailwind CSS

**External APIs**  
Naver Map SDK, Naver Local Search API, Naver Image Search API

---

## 핵심 구현 사항

### 검색 결과 누적 캐시 (NaverSearchCache)

네이버 API는 한 번에 최대 15건만 반환합니다. 이를 보완하기 위해 검색할 때마다 결과를 `NaverSearchCache` 테이블에 저장합니다.

- page 1: 네이버 API 호출 → 결과 반환 + DB 저장 + 백그라운드 썸네일 업데이트
- page 2+: `WHERE keyword LIKE '%keyword%' AND keyword != 'exact'` 쿼리로 다른 관련 키워드에서 쌓인 결과까지 포함

"강남 맛집"을 검색한 기록이 쌓이면, 누군가 "맛집"을 검색할 때 2페이지부터 그 결과가 함께 나옵니다. 쓰면 쓸수록 결과가 많아지는 구조입니다.

썸네일이 캐시에 저장된 항목은 프론트에서 이미지 API를 재호출하지 않고 바로 표시합니다.

### 오늘의 질문 날짜 처리

초기 구현에서 날짜가 바뀌면 항상 새 `DailyQuestion` 행을 INSERT했는데, 이 경우 기존 답변과의 연결이 끊겨 답변이 초기화되는 버그가 있었습니다. 미완료 질문이 있을 때는 새 행을 만들지 않고 기존 행의 `assigned_date`만 오늘로 UPDATE해서 같은 `question_id`를 유지하도록 수정했습니다.

### 커플 연결 끊기 트랜잭션

커플 해제 시 `FavPlaceComment → FavPlaceStars → FavPlaceVisit → FavPlacePhoto → FavPlace → Couples` 순으로 외래키 역순 삭제합니다. 중간에 오류가 나면 롤백합니다.

### HTTP 메서드 제약

배포 환경의 Apache가 DELETE 메서드를 차단(405 에러)합니다. 삭제/끊기 작업을 모두 POST로 구현했습니다.

### 좌표 변수명 레거시

`useMapStore`의 `longtitude` 필드가 실제로는 위도 값을, `latitude` 필드가 경도 값을 저장합니다. 초기 개발 시 뒤바뀐 채로 굳어진 이슈로, 수정 시 주의가 필요합니다.

---

## 프로젝트 구조

```
src/
├── api/
│   ├── fetch.ts                  # 전체 API 호출 함수
│   ├── fetchHooks.tsx            # SearchFetcher (React Query + Zustand 연결)
│   └── Login/
│       └── fetch.ts              # 로그인 관련 API
│
├── component/
│   ├── Card/
│   │   ├── ProfileCard/          # 홈 프로필 카드 (닉네임 인라인 편집)
│   │   ├── RecommendCard/        # 홈 오늘의 추천 카드
│   │   └── SearchResultCard/     # 지도 검색 결과 카드
│   ├── Container/
│   │   └── ResultsContainer.tsx  # 검색 결과 바텀시트 (인피니트 스크롤)
│   ├── Login/                    # 로그인 버튼, 카카오 OAuth 처리
│   ├── NavBar/                   # 하단 탭 네비게이션
│   ├── Toast/                    # Toast 알림
│   ├── NaverMap.tsx              # 네이버 지도 SDK 연동
│   ├── RenderImg.tsx             # 이미지 로딩 (실패 시 noimg.jpeg)
│   └── SearchInput.tsx           # 검색 입력 (엔터 시 키보드 내림)
│
├── routes/
│   ├── home/Home.tsx             # 홈 (프로필, 질문, 일정, 추천, 활동 알림)
│   ├── map/Map.tsx               # 지도 + 검색
│   ├── review/Review.tsx         # 즐겨찾기 목록 + 상세 바텀시트
│   └── calendar/Calendar.tsx     # 데이트 달력
│
├── store/
│   └── data.ts                   # Zustand 스토어 (로그인, 지도, 검색, 토스트)
│
├── boundary/                     # Error Boundary
├── hooks/
│   └── isLogin.ts                # useIsLogin 커스텀 훅
├── lotties/                      # Lottie 애니메이션 에셋
├── types/
│   └── types.ts                  # 공통 타입, API_URL 상수
└── App.tsx                       # 라우터 설정, NavBar, Toast 마운트
```

---

## 설치 및 실행

### 백엔드

```bash
npm install

# .env 설정
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_database
IMAGE_URL=https://your-domain.com
PASSWORD_SECRET=your_secret
KAKAO_REST_API_KEY=your_kakao_key
KAKAO_REDIRECT_URI=https://your-domain.com/login/auth
NAVER_CLIENT_KEY=your_naver_key
NAVER_CLIENT_SECRET=your_naver_secret
VITE_API_URL=https://your-domain.com

node app.js
```

### 프론트엔드

```bash
cd couple-restaurant-share
npm install
npm run dev        # 개발 서버
npm run build      # 빌드 → ../dist/
```

### NaverSearchCache 테이블 생성

```sql
CREATE TABLE NaverSearchCache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  link VARCHAR(1000),
  category VARCHAR(500),
  description TEXT,
  telephone VARCHAR(100),
  address VARCHAR(500),
  roadAddress VARCHAR(500),
  mapx VARCHAR(50),
  mapy VARCHAR(50),
  thumbnail VARCHAR(1000),
  created_at DATETIME DEFAULT NOW(),
  INDEX idx_keyword (keyword),
  UNIQUE KEY unique_place (keyword(100), title(200), address(200))
);
```

---

## API 엔드포인트

### 인증 `/api/auth`
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/register` | 이메일 회원가입 |
| POST | `/login` | 이메일 로그인 |
| POST | `/kakao` | 카카오 로그인 |
| GET | `/me` | 내 정보 조회 |
| POST | `/profile/image` | 프로필 이미지 업로드 |
| POST | `/profile/nickname` | 닉네임 변경 |
| POST | `/account/delete` | 회원탈퇴 |

### 커플 `/api/couple`
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/create` | 커플 생성 (초대코드 발급) |
| POST | `/join` | 초대코드로 연결 |
| GET | `/info` | 커플 정보 조회 |
| POST | `/meetday` | 만난 날짜 수정 |
| POST | `/disconnect` | 연결 끊기 |

### 네이버 검색 `/api/naver`
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/searchPlace?keyword=&page=` | 장소 검색 (page 1: 네이버 API, page 2+: DB 캐시) |
| GET | `/image?keyword=&address=` | 단건 썸네일 조회 |

### 즐겨찾기 `/api/favplace`
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/add` | 즐겨찾기 추가 |
| GET | `/list` | 목록 조회 |
| POST | `/delete/:id` | 삭제 |
| POST | `/visit/:id` | 방문 날짜 기록 |

### 리뷰 `/api/review`
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/rating` | 별점 작성 |
| GET | `/rating/:id` | 별점 조회 |
| POST | `/comment` | 댓글 작성 |
| GET | `/comment/:id` | 댓글 조회 |

### 일정 `/api/schedule`
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/add` | 일정 추가 |
| GET | `/list` | 목록 조회 |
| POST | `/delete/:id` | 삭제 |

### 오늘의 질문 `/api/question`
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/today` | 오늘 질문 조회 (없으면 생성) |
| POST | `/answer` | 답변 제출 |

---

## 데이터베이스 스키마

| 테이블 | 역할 |
|---|---|
| `Users` | 회원 (이메일/카카오, social_type: 0=이메일, 1=카카오) |
| `Couples` | 커플 관계 (6자리 초대코드, user2_id NULL = 대기 중) |
| `Places` | 장소 정보 |
| `FavPlace` | 커플 즐겨찾기 장소 |
| `FavPlaceComment` | 즐겨찾기 코멘트 |
| `FavPlaceStars` | 별점 (1~5) |
| `FavPlaceVisit` | 방문 날짜 기록 |
| `FavPlacePhoto` | 방문 사진 |
| `Place_Categories` | 장소 카테고리 |
| `Place_Locations` | 장소 좌표 (mapx, mapy) |
| `Place_Thumb` | 장소 썸네일 |
| `CoupleSchedule` | 데이트 일정 |
| `CoupleActivity` | 파트너 활동 알림 |
| `DailyQuestion` | 오늘의 질문 현황 |
| `DailyQuestionAnswer` | 질문 답변 |
| `NaverSearchCache` | 네이버 검색 결과 누적 캐시 (썸네일 포함) |
