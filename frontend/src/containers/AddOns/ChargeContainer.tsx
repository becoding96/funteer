import React from 'react';
import { Button, MenuItem, Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAppDispatch } from '../../store/hooks';
import styles from './ChargeContainer.module.scss';
import { closeModal, openModal } from '../../store/slices/payModalSlice';

// 더미 테이터 타입
type NoticeType = {
  idx: number;
  text: string;
};

type ChargeHistoryType = {
  idx: number;
  text: string;
  date: string;
};

const dummyNotice: NoticeType[] = [
  {
    idx: 1,
    text: '밝은 자신과 방지하는 칼이다. 있는 꽃이 용감하고 사라지지 얼마나 아름답고 그리하였는가? 위하여서, 있는 간에 방황하여도, 천고에 봄바람이다. 놀이 힘차게 대중을 보는 인간의 갑 무한한 사막이다.',
  },
  {
    idx: 2,
    text: '밝은 자신과 방지하는 칼이다. 있는 꽃이 용감하고 사라지지 얼마나 아름답고 그리하였는가? 위하여서, 있는 간에 방황하여도, 천고에 봄바람이다. 놀이 힘차게 대중을 보는 인간의 갑 무한한 사막이다.',
  },
  {
    idx: 3,
    text: '밝은 자신과 방지하는 칼이다. 있는 꽃이 용감하고 사라지지 얼마나 아름답고 그리하였는가? 위하여서, 있는 간에 방황하여도, 천고에 봄바람이다. 놀이 힘차게 대중을 보는 인간의 갑 무한한 사막이다.',
  },
];

const dummyChargeHistory: ChargeHistoryType[] = [
  {
    idx: 0,
    text: '123,000',
    date: '2023.01.03',
  },
  {
    idx: 1,
    text: '234,000',
    date: '2023.01.12',
  },
  {
    idx: 2,
    text: '23,000',
    date: '2023.01.23',
  },
];

function ChargeContainer() {
  const dispatch = useAppDispatch();

  const [sort, setSort] = React.useState('date');

  const changeSortHandler = (event: SelectChangeEvent) => {
    setSort(event.target.value);
  };

  const onClickChargeHandler = () => {
    dispatch(openModal({ isOpen: true }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.contents}>
        <p className={styles.title}>펀티어 충전</p>
        <div className={styles['charge-box']}>
          <p>잔액</p>
          <div>
            <span>12,400원</span>
            <Button variant="contained" onClick={onClickChargeHandler}>
              충전
            </Button>
          </div>
        </div>
        <div className={styles['notice-box']}>
          <p>고지사항 및 안내문</p>
          <ul>
            {dummyNotice.map((notice) => (
              <li key={notice.idx}>
                {notice.idx}. {notice.text}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles['charge-history-box']}>
          <div className={styles['charge-title-box']}>
            <p>충전 내역 확인</p>
            <Select value={sort} sx={{ height: '2.5rem' }} onChange={changeSortHandler} displayEmpty inputProps={{ 'aria-label': 'Without label' }}>
              <MenuItem value="date">날짜순</MenuItem>
              <MenuItem value="amount">금액순</MenuItem>
            </Select>
          </div>
          <table>
            <thead>
              <tr>
                <th>금액</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              {dummyChargeHistory.map((chargeHistory) => (
                <tr key={chargeHistory.idx}>
                  <td>{chargeHistory.text} 원</td>
                  <td>{chargeHistory.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ChargeContainer;
