/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import styles from './DetailArcodian.module.scss';
import { ResponseInterface } from '../../containers/Funding/FundingDetailContainer';

export function DetailArcodian(board: ResponseInterface) {
  const [levelOne, setLevelOne] = useState(false);
  const [levelTwo, setLevelTwo] = useState(false);
  const [levelThree, setLevelThree] = useState(false);
  const gauage = useRef<HTMLDivElement>(null);
  const levelOneRef = useRef<HTMLDivElement>(null);
  const levelTwoRef = useRef<HTMLDivElement>(null);
  const levelThreeRef = useRef<HTMLDivElement>(null);

  function toggleChange(n: number) {
    switch (n) {
      case 1: {
        setLevelOne(!levelOne);
        if (levelOne && gauage.current && levelOneRef.current && levelTwoRef.current && levelThreeRef.current) {
          gauage.current.style.width = '35%';
          levelOneRef.current.style.display = 'flex';
          levelTwoRef.current.style.display = 'none';
          levelThreeRef.current.style.display = 'none';
        }
        return;
      }
      case 2: {
        setLevelTwo(!levelTwo);
        if (levelTwo && gauage.current && levelOneRef.current && levelTwoRef.current && levelThreeRef.current) {
          gauage.current.style.width = '70%';
          levelOneRef.current.style.display = 'none';
          levelTwoRef.current.style.display = 'flex';
          levelThreeRef.current.style.display = 'none';
        }
        return;
      }
      case 3: {
        setLevelThree(!levelThree);
        if (levelThree && gauage.current && levelOneRef.current && levelTwoRef.current && levelThreeRef.current) {
          gauage.current.style.width = '100%';
          levelOneRef.current.style.display = 'none';
          levelTwoRef.current.style.display = 'none';
          levelThreeRef.current.style.display = 'flex';
        }
        return;
      }
    }
  }
  // ????????? ?????? ??????
  const levelOneData = () => (
    <p style={{ whiteSpace: 'pre-line' }}>
      {`1?????? ??????: ${board.targetMoneyListLevelOne.amount}???
      ?????? ??????: ${board.targetMoneyListLevelOne?.descriptions?.map((data) => data.description)}
      `}
    </p>
  );
  const levelTwoData = () => (
    <p style={{ whiteSpace: 'pre-line' }}>
      {`2?????? ??????: ${board.targetMoneyListLevelTwo.amount}???
      ?????? ??????: ${board.targetMoneyListLevelTwo?.descriptions?.map((data) => data.description)}
      `}
    </p>
  );
  const levelThreeData = () => (
    <p style={{ whiteSpace: 'pre-line' }}>
      {`3?????? ??????: ${board.targetMoneyListLevelThree.amount}???
      ?????? ??????: ${board.targetMoneyListLevelThree?.descriptions?.map((data) => data.description)}
      `}
    </p>
  );

  return (
    <div className={styles.fundingPlanner}>
      <p className={styles.planTitle}>?????? ????????? ?????? ?????? ?????? ??????</p>
      <p className={styles.planSubTitle}> ??? ????????? ????????? ????????? ?????????!</p>
      <div className={styles.planTag}>
        <BeenhereIcon className={styles.iconTag} sx={{ visibility: 'hidden' }} />
        <Tooltip title={levelOneData()} placement="top" onClick={() => toggleChange(1)}>
          <BeenhereIcon className={styles.iconTag} />
        </Tooltip>
        <Tooltip title={levelTwoData()} placement="top" onClick={() => toggleChange(2)}>
          <BeenhereIcon className={styles.iconTag} />
        </Tooltip>
        <Tooltip title={levelThreeData()} placement="top" onClick={() => toggleChange(3)}>
          <BeenhereIcon className={styles.iconTag} />
        </Tooltip>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.status}
          style={{
            width: '0%',
          }}
          ref={gauage}
        />
      </div>
      <div className={styles.levelContainer}>
        <div style={{ display: 'none' }} ref={levelOneRef}>
          <div style={{ display: 'block' }}>
            <h3>???? ?????????????????? ?????? ????</h3>
            <h5>{board.targetMoneyListLevelOne.amount}??? ?????? ???</h5>
            <div style={{ display: 'block' }}>
              {board.targetMoneyListLevelOne.descriptions?.map((des, i) => (
                <p key={i}>{des.description}</p>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'none' }} ref={levelTwoRef}>
          <div style={{ display: 'block' }}>
            <h3>???? ?????????????????? ?????? ????</h3>
            <h5>{board.targetMoneyListLevelTwo.amount}??? ?????? ???</h5>
            <div style={{ display: 'block' }}>
              {board.targetMoneyListLevelTwo.descriptions?.map((des, i) => (
                <p key={i}>{des.description}</p>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'none' }} ref={levelThreeRef}>
          <div style={{ display: 'block' }}>
            <h3>???? ?????????????????? ?????? ????</h3>
            <h5>{board.targetMoneyListLevelThree.amount}??? ?????? ???,</h5>
            <div style={{ display: 'block' }}>
              {board.targetMoneyListLevelThree.descriptions?.map((des, i) => (
                <p key={i}>{des.description}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailArcodian;
