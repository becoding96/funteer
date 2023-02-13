import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Box, CircularProgress, Fab, Tab, Tabs } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@material-ui/styles';
import TextField from '@mui/material/TextField';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import FundSummary from '../../components/Cards/FundSummary';
import styles from './FundingDetailContainer.module.scss';
import { fundingJoin, requestCommentList, requestFundingDetail, requestFundingReport, requestNextCommentList, requestWish } from '../../api/funding';
import TeamInfo from '../../components/Cards/TeamInfoCard';
import DetailArcodian from '../../components/Cards/DetailArcodian';
import CommentCardSubmit from '../../components/Cards/CommentCardSubmit';
import CommentCard from '../../components/Cards/CommentCard';
import CommentSkeleton from '../../components/Skeleton/CommentSkeleton';
import { useAppSelector } from '../../store/hooks';
import { requestUserProfile } from '../../api/user';
import { requestTeamAccountInfo } from '../../api/team';
import { requestCreateSession } from '../../api/live';

export interface ResponseInterface {
  title: string;
  startDate: string;
  endDate: string;
  postDate: string;
  thumbnail: string;
  category: string;
  content: string;
  targetMoneyListLevelOne: targetType;
  targetMoneyListLevelTwo: targetType;
  targetMoneyListLevelThree: targetType;
  currentFundingAmount: string;
  wishCount: number;
  fundingDescription: string;
  comments: commentType[];
  team: teamType;
  fundingId: string;
  isWished: boolean;
}
export type commentType = {
  commentId: number;
  memberNickName: string;
  content: string;
  memberProfileImg: string;
  regDate: string;
};
export type teamType = {
  id: number;
  email: string;
  name: string;
  phone: string;
  profileImgUrl: string;
  // performFileUrl: string;
  // vmsFileUrl: string;
};
type targetType = {
  amount?: string;
  targetMoneyType?: string;
  descriptions?: descriptionType[];
};
type descriptionType = {
  description?: string;
};

interface reportInterface {
  content?: string;
  regDate?: string;
  reportDetailResponseList: responseListType[];
}
type responseListType = {
  amount?: string;
  description?: string;
};

export function FundingDetailContainer() {
  const navigate = useNavigate();
  const [commentList, setCommentList] = useState([
    {
      commentId: 0,
      memberNickName: '',
      content: '',
      memberProfileImg: '',
      regDate: '',
    },
  ]);
  const userType = useAppSelector((state) => state.userSlice.userType);
  const { fundIdx } = useParams();
  const [board, setBoard] = useState<ResponseInterface>({
    title: '',
    startDate: '',
    endDate: '',
    postDate: '',
    thumbnail: '',
    category: '',
    content: '',
    fundingDescription: '',
    targetMoneyListLevelOne: {},
    targetMoneyListLevelTwo: {},
    targetMoneyListLevelThree: {},
    currentFundingAmount: '',
    wishCount: 0,
    comments: [],
    team: {
      id: 0,
      email: '',
      name: '',
      phone: '',
      profileImgUrl: '',
    },
    fundingId: '',
    isWished: false,
  });
  // 게시물 좋아요
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [wished, setWished] = useState<boolean>(board.isWished);

  const handleLikeClick = async () => {
    if (isLiked === true) {
      try {
        const response = await requestWish(fundIdx);
        console.log('Liked 취소함');
        setIsLiked(false);
        setWished(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const response = await requestWish(fundIdx);
        console.log('Liked!');
        setIsLiked(true);
        setWished(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // 펀딩 상세 게시물 로드
  const fetchData = async () => {
    try {
      const response = await requestFundingDetail(fundIdx);
      console.log('res: ', response);
      console.log('data res: ', response.data);
      setBoard(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // 게시물 로드
  useEffect(() => {
    fetchData();
  }, []);

  // 정렬 체크박스
  const [isChecked, setIsChecked] = useState<boolean>(false);
  function checkHandler(e: React.ChangeEvent<HTMLInputElement> | undefined) {
    setIsChecked(!isChecked);
  }

  // 무한 스크롤
  // 항목 리스트 초기화

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);
  const [totalCommentCnt, setTotalCommentCnt] = useState();
  const [commentCount, setCommentCount] = useState(0);
  const initCommentList = async () => {
    try {
      setIsLoading(true);
      const { data } = await requestCommentList(fundIdx, 'regDate,DESC');
      setCommentList([...data.comments.content]);
      setCommentCount(data.comments.total);
      setCurrentPage(data.comments.number);
      setIsLastPage(data.comments.last);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  const [nextLoading, setNextLoading] = useState<boolean>(false);
  // 한번에 불러올 게시글 수
  const nextCommentList = async () => {
    try {
      setNextLoading(true);
      const { data } = await requestNextCommentList(currentPage, fundIdx, 'regDate,DESC');
      setCommentList([...commentList, ...data.comments.content]);
      setCurrentPage(data.comments.number);
      setIsLastPage(data.comments.last);
      setNextLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const [ref, inView] = useInView();

  // Drawer 핸들러

  const [toggled, setToggled] = useState<boolean>(false);
  function handleDrawer() {
    setToggled(!toggled);
  }

  // 엔터키 input 완성

  function handleKeyUp(event: React.KeyboardEvent<HTMLImageElement>) {
    if (event.key === 'Enter') {
      (document.activeElement as HTMLElement).blur();
    }
  }

  useEffect(() => {
    initCommentList();
  }, []);

  useEffect(() => {
    if (inView && !isLastPage) {
      nextCommentList();
    }
  }, [inView]);

  // 로그인 정보
  const userId = useAppSelector((state) => state.userSlice.userId);
  // 잔액
  const [money, setMoney] = React.useState(0);

  useEffect(() => {
    requestMoneyInfo();
  }, []);

  /** 잔액 조회 */
  const requestMoneyInfo = async () => {
    try {
      if (userId) {
        const response = await requestUserProfile(userId);
        console.log('유저 프로필 정보', response);
        setMoney(response.data.money);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 펀딩 참여
  const [paying, setPaying] = useState('');

  async function fundingHandler() {
    console.log('펀딩 지불 정보: ', fundIdx, '번 게시물에', paying, '원 지불');
    try {
      await fundingJoin(paying, fundIdx);
      alert(`${paying}원으로 펀딩을 완료했습니다!`);
    } catch (error) {
      console.log(error);
    }
  }
  // 탭 변경
  const [value, setValue] = React.useState('one');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  // 보고서 탭
  const [report, setReport] = useState<reportInterface>({
    content: '',
    regDate: '',
    reportDetailResponseList: [
      {
        amount: '',
        description: '',
      },
    ],
  });

  const fetchReportList = async () => {
    try {
      const response = await requestFundingReport(fundIdx);
      console.log('Report res: ', response);
      console.log('Report data res: ', response.data);
      setReport(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchReportList();
  }, []);

  // 단계별 펀딩 정보
  const levelOneData = () => (
    <p style={{ whiteSpace: 'pre-line' }}>
      {`1단계 금액: ${board.targetMoneyListLevelOne.amount}원
      펀딩 설명: ${board.targetMoneyListLevelOne?.descriptions?.map((data) => data.description)}
      `}
    </p>
  );
  const levelTwoData = () => (
    <p style={{ whiteSpace: 'pre-line' }}>
      {`2단계 금액: ${board.targetMoneyListLevelTwo.amount}원
      펀딩 설명: ${board.targetMoneyListLevelTwo?.descriptions?.map((data) => data.description)}
      `}
    </p>
  );
  const levelThreeData = () => (
    <p style={{ whiteSpace: 'pre-line' }}>
      {`3단계 금액: ${board.targetMoneyListLevelThree.amount}원
      펀딩 설명: ${board.targetMoneyListLevelThree?.descriptions?.map((data) => data.description)}
      `}
    </p>
  );
  // 백분율 계산
  function calc(tar: string, cur: string) {
    const newTar = Number(tar?.replaceAll(',', ''));
    const newCur = Number(cur?.replaceAll(',', ''));

    return Math.round((newCur / newTar) * 100);
  }

  // 단체 정보 GET
  const isLogin = useAppSelector((state) => state.userSlice.isLogin);
  const [teamInfo, setTeamInfo] = useState<TeamInfoType>({
    email: '',
    id: 0,
    name: '',
  });
  type TeamInfoType = {
    email: string;
    id: number;
    name: string;
  };
  async function getTeamInfo() {
    const res = await requestTeamAccountInfo();
    setTeamInfo(res.data);
    console.log('팀정보', res);
  }
  useEffect(() => {
    if (isLogin && userType === 'TEAM') {
      getTeamInfo();
    }
  }, [userType]);

  // 라이브 방송
  const [CheckRoom, setCheckRoom] = useState<boolean>(false);

  const createSession = async () => {
    try {
      const response = await requestCreateSession(teamInfo.name, 1);
      localStorage.setItem('liveToken', response.data.token);
      navigate(`../publisherLiveRoom/${teamInfo.name}`);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>{board.title}</h1>
          <p className={styles.bannerSeen}> 조회수 0회</p>
          {userType === 'TEAM' && teamInfo.id === board.team.id && (
            <div className={styles.bannerButtonGroup}>
              <button className={styles.bannerGrpBtn} type="button">
                보고서 제출
              </button>
              <button
                className={styles.bannerGrpBtn}
                type="button"
                onClick={() => {
                  createSession();
                }}
              >
                라이브 시작
              </button>
              <button className={styles.bannerGrpBtn} type="button">
                펀딩 수정하기
              </button>
            </div>
          )}
        </div>
      </div>
      <div className={styles.mainContainer}>
        <div className={styles.mainSum}>
          {' '}
          <FundSummary {...board} />
        </div>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="primary"
            aria-label="secondary tabs example"
            TabIndicatorProps={{
              sx: { backgroundColor: '#E6750A' },
            }}
          >
            <Tab value="one" label="프로젝트 상세 계획" />
            <Tab value="two" label="프로젝트 보고" />
          </Tabs>
        </Box>
        <div className={styles.mainContent}>
          {value === 'one' ? (
            <div>
              <div className={styles.fundingPlanner}>
                <p className={styles.planTitle}>펀딩 금액에 따른 봉사계획</p>
                <p className={styles.planSubTitle}>마우스를 올려 단계별 계획을 확인하세요!</p>
                <div className={styles.planTag}>
                  <BeenhereIcon className={styles.iconTag} sx={{ visibility: 'hidden' }} />
                  <Tooltip title={levelOneData()} placement="top">
                    <BeenhereIcon className={styles.iconTag} />
                  </Tooltip>
                  <Tooltip title={levelTwoData()} placement="top">
                    <BeenhereIcon className={styles.iconTag} />
                  </Tooltip>
                  <Tooltip title={levelThreeData()} placement="top">
                    <BeenhereIcon className={styles.iconTag} />
                  </Tooltip>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.status} style={{ width: `${calc(board.targetMoneyListLevelThree.amount as string, board.currentFundingAmount)}%` }}>
                    <Tooltip title={`현재 모금 금액: ${board.currentFundingAmount}원`} placement="bottom">
                      <p className={styles.statusNum}>{calc(board.targetMoneyListLevelThree.amount as string, board.currentFundingAmount)}%</p>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div dangerouslySetInnerHTML={{ __html: board.content }} className={styles.mainContentInner} />
            </div>
          ) : (
            <div className={styles.mainContentInner}>
              <p>{report.content}</p>
              <p>{report.regDate}</p>
              <div className={styles.reslists}>
                {report.reportDetailResponseList.map((resList, i) => (
                  <div key={resList.description}>
                    <h1>{i + 1}번째 보고서 총액</h1>
                    <p>{resList.amount}원</p>
                    <p>보고서 설명</p>
                    <p>{resList.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <hr style={{ borderTop: '3px solid #bbb', borderRadius: '3px', opacity: '0.5' }} />
        <div className={styles.teamInfoCard} style={{ width: '90%', marginLeft: '6%' }}>
          <TeamInfo {...board.team} />
        </div>
        <DetailArcodian />

        <div className={styles.mainFooterAttatch}>
          <p className={styles.attachTitle}>첨부파일</p>
          <p className={styles.attachItem}>인증서.hwp</p>
          <p className={styles.attachItem}>증명서.pdf</p>
        </div>
        <div className={styles.mainFooterLikeWrapper}>
          <button className={isLiked && wished ? styles.mainFooterLikeButtonDone : styles.mainFooterLikeButtonNone} onClick={handleLikeClick} type="button">
            <FavoriteIcon className={styles.mainFooterLike} />
          </button>
          <div className={styles.Likebox}>
            <div className={styles.mainFooterLikeTest}> 펀딩 찜</div>
            <div className={styles.mainFooterLikeTestSub}> 찜 수 {board.wishCount}</div>
          </div>
        </div>
        <hr style={{ borderTop: '3px solid #bbb', borderRadius: '3px', opacity: '0.5' }} />
        <div className={styles.mainCommentSubmit}>
          <CommentCardSubmit initCommentList={initCommentList} />
        </div>
        <div className={styles.mainComments}>
          {isLoading ? (
            <CommentSkeleton />
          ) : (
            commentList.map((comment) => {
              return (
                <CommentCard
                  commentId={comment.commentId}
                  memberNickName={comment.memberNickName}
                  content={comment.content}
                  memberProfileImg={comment.memberProfileImg}
                  regDate={comment.regDate}
                  key={comment.regDate}
                />
              );
            })
          )}
          {nextLoading ? <CircularProgress color="warning" /> : ''}
        </div>
        {currentPage >= 0 ? <div ref={ref} /> : ''}
      </div>
      <Fab
        aria-label="add"
        sx={{ color: 'white', backgroundColor: 'orange !important', position: 'fixed', bottom: '3%', right: '3%', width: '60px', height: '60px' }}
        onClick={() => handleDrawer()}
        className={styles.fabToggle}
      >
        <LocalAtmIcon />
      </Fab>
      <Box
        sx={{
          position: 'fixed',
          bottom: '10px',
          left: toggled ? '0px' : '-100%',
          width: '90%',
          height: '13%',
          transition: '1s ease-in-out',
          margin: '0 20px',
        }}
        className={styles.payBox}
      >
        <div className={styles.payBar}>
          <p>
            <span>{board.team.name}</span>님의 펀딩에 총 <span>123,456</span>명이 참여했어요
          </p>
          <div>
            <TextField
              label="금액 입력"
              id="custom-css-outlined-input"
              type="number"
              size="small"
              sx={{ margin: '0 20px', backgroundColor: 'white' }}
              // eslint-disable-next-line
              onKeyUp={handleKeyUp}
              color="warning"
              onChange={(e) => setPaying(e.target.value)}
              value={paying}
            />
          </div>

          <p>마일리지로</p>
          <button type="button" className={styles.payBtn} onClick={() => fundingHandler()}>
            펀딩 참여하기
          </button>
          <div className={styles.mileText}>
            <p>현재 잔액: {money}원</p>
            <Link to="/charge" className={styles.milLink}>
              <p className={styles.milea}>마일리지 충전</p>
            </Link>
          </div>
        </div>
      </Box>
    </div>
  );
}
export default FundingDetailContainer;