import React, { useState, useRef, useEffect, useMemo } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor as ToastEditor } from '@toast-ui/react-editor';
import dayjs, { Dayjs } from 'dayjs';
import LinearProgress from '@mui/material/LinearProgress';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { Accordion, AccordionDetails, AccordionSummary, Button, FormControl, Icon, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import RoomIcon from '@mui/icons-material/Room';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { fontWeight } from '@mui/system';
import { log } from 'console';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './CreateFundingContainer.module.scss';
import { requestCreateFunding, requestRegisterThumbnail, requestUploadImage } from '../../api/funding';
import { FundingInterface, amountLevelType, descriptionType } from '../../types/funding';
import defaultThumbnail from '../../assets/images/funding/createFunding-thumbnail.png';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { closeModal, openModal } from '../../store/slices/modalSlice';
import requiredIcon from '../../assets/images/funding/required.svg';
import uploadIcon from '../../assets/images/funding/upload.svg';
import { diffDayStartToEnd } from '../../utils/day';
import { stringToSeparator, stringToNumber } from '../../utils/convert';
import TabPanel from '../../components/Funding/TabPanel';
import TabContent from '../../components/Funding/TabContent';

const htmlString = `  
<h1>???????????? ??????</h1>
<p>??????????????? ????????? ????????????????</p> 
<p>??? ??????????????? ?????? ?????? ????????? ???????????????????</p> 
<p>??? ??????????????? ???????????? ??? ????????? ??????????????? ?</p>

<h1>???????????? ??????</h1>
<p>???????????? ????????? ????????? ????????? ?????? ???????????? ??????????????? ?????? ???????????? ?????? ?????????.</p>
<ul>
<li>???????????? ???????????? ???????????????.</li>
</ul>
<h1>???????????? ??????</h1>
<p>????????? ????????? ???????????? ??????????????????.</>
<ul>
<li>0??? 0???: ???????????? ??????</li>
<li>0??? 0???: ???????????? ??????</li>
</ul>

`;

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
  [`& .title`]: {
    fontSize: '15px',
    fontWeight: 'bold',
  },
}));

function CreateFundingContainer() {
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const editorRef = useRef<ToastEditor>(null);
  const [fundingData, setFundingData] = useState<FundingInterface>({
    thumbnail: '',
    title: '',
    fundingDescription: '',
    categoryId: 0,
    content: '',
    startDate: '',
    endDate: '',
    hashtags: '#tags',
    targetMoneyLevelOne: {
      amount: '',
      targetMoneyType: 'LEVEL_ONE',
      descriptions: [],
    },
    targetMoneyLevelTwo: {
      amount: '',
      targetMoneyType: 'LEVEL_TWO',
      descriptions: [],
    },
    targetMoneyLevelThree: {
      amount: '',
      targetMoneyType: 'LEVEL_THREE',
      descriptions: [],
    },
  });
  const [thunmbnailPreview, setThumbnailPreview] = useState<string>();
  const [progress, setProgress] = useState<number>(100 / 3);
  const [tabIdx, setTabIdx] = useState<number>(0);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [todoText, setTodoText] = useState<string>('');

  const allFundingDays = useMemo(() => diffDayStartToEnd(fundingData.startDate, fundingData.endDate), [fundingData.startDate, fundingData.endDate]);

  const editorChangeHandler = (e: any) => {
    const text = editorRef.current?.getInstance().getHTML();

    setFundingData({ ...fundingData, content: text });
  };

  const onUploadImage = async (blob: Blob, callback: any) => {
    console.log(blob);

    const url = await requestUploadImage(blob);

    callback(url, 'fundingContents?????????');
  };

  const prevStageHandler = () => {
    if (progress > 100 / 3) {
      setProgress(progress - 100 / 3);
      setTabIdx(tabIdx - (1 % 3));
    }
  };
  const nextStageHandler = () => {
    if (progress < 100) {
      setProgress(progress + 100 / 3);
      setTabIdx(tabIdx + (1 % 3));
    }
  };

  // ????????? S3??????
  const uploadS3Thumbnail = async (file: Blob) => {
    try {
      const { data } = await requestRegisterThumbnail(file);
      setFundingData({ ...fundingData, thumbnail: data });
    } catch (error) {
      console.log(error);
    }
  };

  // ????????? ?????? ?????????
  const onFileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    const file = e.target.files[0];

    uploadS3Thumbnail(file);
    // setFundingData({ ...fundingData, thumbnail: file });
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
  };

  // ?????? ?????? Handler
  const onChangeTextHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // ?????? ????????? ???????????? ????????? ???????????? ??????
    const regex = /[^0-9]/g;
    const separatorValue = stringToSeparator(value.replaceAll(regex, ''));
    switch (name) {
      case 'title':
        if (value.length <= 30) {
          setFundingData({ ...fundingData, title: value });
        }

        break;
      case 'fundingDescription':
        if (value.length < 40) {
          setFundingData({ ...fundingData, fundingDescription: value });
        }
        break;
      case 'LEVEL_ONE':
        setFundingData({ ...fundingData, targetMoneyLevelOne: { ...fundingData.targetMoneyLevelOne, amount: separatorValue } });
        break;
      case 'LEVEL_TWO':
        setFundingData({ ...fundingData, targetMoneyLevelTwo: { ...fundingData.targetMoneyLevelTwo, amount: separatorValue } });
        break;
      case 'LEVEL_THREE':
        setFundingData({ ...fundingData, targetMoneyLevelThree: { ...fundingData.targetMoneyLevelThree, amount: separatorValue } });
        break;
      default:
        break;
    }
  };

  // ???????????? input ??????
  const onChangeTodoHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTodoText(e.target.value);
  };

  const onChangeDateHandler = (value: Dayjs | null, type: string) => {
    const date = value?.format('YYYY-MM-DD');
    setFundingData({ ...fundingData, [type]: date });
  };

  const handleModal = () => {
    navigate(-1);
  };

  const onCreateFunding = async () => {
    console.log(fundingData);
    try {
      const response = await requestCreateFunding(fundingData);
      if (response.status === 200) {
        dispatch(openModal({ isOpen: true, title: '?????? ?????? ??????', content: '?????? ????????? ??????????????????.', handleModal }));
      }
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const onClickUpload = () => {
    if (thumbnailRef.current) thumbnailRef.current.click();
  };

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>, level: string) => {
    if (e.key === 'Enter') addTodos(level);
  };
  const addTodos = (level: string) => {
    let prev;
    const todo = { description: todoText };
    // eslint-disable-next-line default-case
    switch (level) {
      case 'LEVEL_ONE':
        prev = fundingData.targetMoneyLevelOne.descriptions;
        setFundingData({ ...fundingData, targetMoneyLevelOne: { ...fundingData.targetMoneyLevelOne, descriptions: [...prev, todo] } });
        break;
      case 'LEVEL_TWO':
        prev = fundingData.targetMoneyLevelTwo.descriptions;
        setFundingData({ ...fundingData, targetMoneyLevelTwo: { ...fundingData.targetMoneyLevelTwo, descriptions: [...prev, todo] } });
        break;
      case 'LEVEL_THREE':
        prev = fundingData.targetMoneyLevelThree.descriptions;
        setFundingData({ ...fundingData, targetMoneyLevelThree: { ...fundingData.targetMoneyLevelThree, descriptions: [...prev, todo] } });
        break;
      default:
        break;
    }

    setTodoText('');
  };

  const removeTodo = (remove: number, level: string) => {
    let prev;
    let next;
    switch (level) {
      case 'LEVEL_ONE':
        prev = fundingData.targetMoneyLevelOne.descriptions;
        // eslint-disable-next-line no-case-declarations
        next = prev.filter((data, index) => index !== remove);
        setFundingData({ ...fundingData, targetMoneyLevelOne: { ...fundingData.targetMoneyLevelOne, descriptions: [...next] } });
        break;
      case 'LEVEL_TWO':
        prev = fundingData.targetMoneyLevelTwo.descriptions;
        // eslint-disable-next-line no-case-declarations
        next = prev.filter((data, index) => index !== remove);
        setFundingData({ ...fundingData, targetMoneyLevelTwo: { ...fundingData.targetMoneyLevelTwo, descriptions: [...next] } });
        break;
      case 'LEVEL_THREE':
        prev = fundingData.targetMoneyLevelThree.descriptions;
        // eslint-disable-next-line no-case-declarations
        next = prev.filter((data, index) => index !== remove);
        setFundingData({ ...fundingData, targetMoneyLevelThree: { ...fundingData.targetMoneyLevelThree, descriptions: [...next] } });
        break;

      default:
        break;
    }
  };

  const onChangeCategory = (event: SelectChangeEvent) => {
    setFundingData({ ...fundingData, categoryId: Number(event.target.value) });
  };

  useEffect(() => {
    editorRef.current?.getInstance().setHTML(htmlString);
    containerRef.current?.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.contents}>
        <div className={styles['funding-thumbnail-box']}>
          <p className={styles.title}>
            ???????????? ?????? ????????? <img className={styles.required} src={requiredIcon} alt="" />
          </p>
          <p className={styles.subTitle}>??????????????? ??????????????? ????????? ?????? ????????? ??? ?????? ???????????? ???????????????.</p>
          <div className={styles['thumbnail-upload-box']}>
            <img src={thunmbnailPreview || defaultThumbnail} alt="thumbnail" className={styles['thumbnail-image']} />

            <div className={styles['upload-button-box']} onClick={onClickUpload} aria-hidden="true">
              <p className={styles['upload-icon-box']}>
                <img className={styles['upload-icon']} src={uploadIcon} alt="????????? ?????????" /> ????????? ?????????{' '}
              </p>
              <p className={styles.subDescription}>?????? ????????? jpg ?????? png??? ????????? ????????????. </p>
              <p className={styles.subDescription}>
                <span>
                  {' '}
                  ???????????? ???????????? ?????? ???????????????. <br />
                </span>
              </p>
              <input ref={thumbnailRef} type="file" accept="image/*" onChange={onFileHandler} className={styles['thumbnail-upload-input']} required />
            </div>
          </div>
        </div>

        <div className={styles['funding-category-box']}>
          <p className={styles.title}>
            ?????? ???????????? ?????? <img className={styles.required} src={requiredIcon} alt="" />
          </p>

          <div className={styles['category-box']}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">???????????? ??????</InputLabel>
              <Select labelId="demo-simple-select-label" id="demo-simple-select" label="???????????? ??????" onChange={onChangeCategory}>
                <MenuItem defaultValue={0}>??????????????? ??????????????????.</MenuItem>
                <MenuItem value={1}>??????</MenuItem>
                <MenuItem value={2}>??????</MenuItem>
                <MenuItem value={3}>??????</MenuItem>
                <MenuItem value={4}>?????????</MenuItem>
                <MenuItem value={5}>??????</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        <div className={styles['funding-title-box']}>
          <p className={styles.title}>
            ?????? ?????? <img className={styles.required} src={requiredIcon} alt="" />
          </p>
          <input
            type="text"
            value={fundingData.title}
            name="title"
            className={styles['input-text']}
            onChange={onChangeTextHandler}
            placeholder="????????? ??????????????????"
            required
          />
        </div>

        <div className={styles['funding-description-box']}>
          <p className={styles.title}>
            ?????? ?????? ?????? <img className={styles.required} src={requiredIcon} alt="" />
          </p>
          <input
            type="text"
            name="fundingDescription"
            onChange={onChangeTextHandler}
            className={styles['input-text']}
            placeholder="???????????? ????????? ?????? ????????? ????????? ?????????."
            value={fundingData.fundingDescription}
            required
          />
        </div>

        <div className={styles['funding-contents-box']}>
          <p className={styles.title}>
            ?????? ?????? <img className={styles.required} src={requiredIcon} alt="" />
          </p>
          <ToastEditor
            ref={editorRef}
            height="500px"
            useCommandShortcut
            initialEditType="wysiwyg"
            onChange={editorChangeHandler}
            hooks={{ addImageBlobHook: onUploadImage }}
            language="ko-KR"
            hideModeSwitch // ????????? ?????? ?????? ??? ?????????
          />
        </div>

        <div className={styles['funding-date-box']}>
          <p className={styles.title}>
            ?????? ?????? ?????? <img className={styles.required} src={requiredIcon} alt="" />
          </p>

          <div className={styles['date-picker-box']}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                disablePast
                label="?????? ?????? ????????? ??????????????????."
                inputFormat="YYYY-MM-DD"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                  onChangeDateHandler(newValue, 'startDate');
                }}
                renderInput={(params) => <TextField {...params} sx={{ mr: 2, mb: 4, minWidth: 100, width: '49%' }} />}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs} required>
              <DatePicker
                disablePast
                label="?????? ?????? ????????? ??????????????????."
                minDate={startDate}
                inputFormat="YYYY-MM-DD"
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                  onChangeDateHandler(newValue, 'endDate');
                }}
                renderInput={(params) => <TextField {...params} sx={{ minWidth: 100, mb: 3, width: '49%' }} />}
              />
            </LocalizationProvider>
          </div>

          {allFundingDays > 0 ? (
            <p className={styles['funding-days-text']}>??? {allFundingDays}?????? ????????? ???????????????.</p>
          ) : (
            <p className={styles['funding-days-text']}>?????? ????????? ?????? ????????? ??????????????????.</p>
          )}
        </div>

        <div className={styles['funding-amount-box']}>
          <p className={styles.title}>
            ?????? ????????? ?????? ?????? <img className={styles.required} src={requiredIcon} alt="" />
          </p>

          <div className={styles['progress-box']}>
            <div className={styles['stage-text-box']}>
                <Icon fontSize="large">
                  {' '}
                  <RoomIcon fontSize="large" sx={{ color: 'rgba(236, 153, 75, 1)' }} />
                </Icon>

              <HtmlTooltip placement="top" title={<p className="title">?????? ????????????</p>}>
                <Icon fontSize="large">
                  {' '}
                  <RoomIcon fontSize="large" sx={tabIdx >= 0 ? { color: 'rgba(236, 153, 75, 1)' } : { color: 'rgb(109, 109, 109);' }} />
                </Icon>
              </HtmlTooltip>

              <HtmlTooltip placement="top" title={<p className="title">1?????? ???????????? </p>}>
                <Icon fontSize="large">
                  {' '}
                  <RoomIcon fontSize="large" sx={tabIdx >= 1 ? { color: 'rgba(236, 153, 75, 1)' } : { color: 'rgb(109, 109, 109);' }} />
                </Icon>
              </HtmlTooltip>

              <HtmlTooltip placement="top" title={<p className="title">2?????? ???????????? </p>}>
                <Icon fontSize="large">
                  {' '}
                  <RoomIcon fontSize="large" sx={tabIdx >= 2 ? { color: 'rgba(236, 153, 75, 1)' } : { color: 'rgb(109, 109, 109);' }} />
                </Icon>
              </HtmlTooltip>
            </div>
            <LinearProgress sx={{ height: 15, borderRadius: 2 }} variant="determinate" value={progress} color="warning" />

            <TabPanel value={0} index={tabIdx}>
              <TabContent
                minAmount="0"
                data={fundingData.targetMoneyLevelOne}
                onChangeTextHandler={onChangeTextHandler}
                onChangeTodoHandler={onChangeTodoHandler}
                onKeyDownHandler={onKeyDownHandler}
                addTodos={addTodos}
                level="LEVEL_ONE"
                todoText={todoText}
                removeTodo={removeTodo}
              />
            </TabPanel>

            <TabPanel value={1} index={tabIdx}>
              <TabContent
                minAmount={fundingData.targetMoneyLevelOne.amount}
                data={fundingData.targetMoneyLevelTwo}
                onChangeTextHandler={onChangeTextHandler}
                onChangeTodoHandler={onChangeTodoHandler}
                onKeyDownHandler={onKeyDownHandler}
                addTodos={addTodos}
                level="LEVEL_TWO"
                todoText={todoText}
                removeTodo={removeTodo}
              />
            </TabPanel>

            <TabPanel value={2} index={tabIdx}>
              <TabContent
                minAmount={fundingData.targetMoneyLevelTwo.amount}
                data={fundingData.targetMoneyLevelThree}
                onChangeTextHandler={onChangeTextHandler}
                onChangeTodoHandler={onChangeTodoHandler}
                onKeyDownHandler={onKeyDownHandler}
                addTodos={addTodos}
                level="LEVEL_THREE"
                todoText={todoText}
                removeTodo={removeTodo}
              />
            </TabPanel>
            <div className={styles['stage-button-box']}>
              <Button className={styles['stage-button']} type="button" onClick={prevStageHandler} variant="outlined" startIcon={<ArrowBackOutlinedIcon />}>
                ?????? ??????
              </Button>

              <Button className={styles['stage-button']} type="button" onClick={nextStageHandler} endIcon={<ArrowForwardOutlinedIcon />}>
                ?????? ??????
              </Button>
            </div>
            <div className={styles['funding-preview']}>
              <Accordion className={styles.accordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                  <Typography className={styles['accordion-title']}>?????? ????????????</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography className={styles['funding-target-amount']}>?????? ?????? :{fundingData.targetMoneyLevelOne.amount}</Typography>
                  <ul>
                    {fundingData.targetMoneyLevelOne.descriptions.map((list, index) => (
                      <li className={styles['target-todo']}>
                        {index + 1}. {list.description}
                      </li>
                    ))}
                  </ul>
                </AccordionDetails>
              </Accordion>

              <Accordion className={styles.accordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                  <Typography className={styles['accordion-title']}>1?????? ????????????</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography className={styles['funding-target-amount']}>?????? ?????? :{fundingData.targetMoneyLevelTwo.amount}</Typography>
                  <ul>
                    {fundingData.targetMoneyLevelTwo.descriptions.map((list, index) => (
                      <li className={styles['target-todo']}>
                        {index + 1}. {list.description}
                      </li>
                    ))}
                  </ul>
                </AccordionDetails>
              </Accordion>

              <Accordion className={styles.accordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                  <Typography className={styles['accordion-title']}>2?????? ????????????</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography className={styles['funding-target-amount']}>?????? ?????? :{fundingData.targetMoneyLevelThree.amount}</Typography>
                  <ul>
                    {fundingData.targetMoneyLevelThree.descriptions.map((list, index) => (
                      <li className={styles['target-todo']}>
                        {index + 1}. {list.description}
                      </li>
                    ))}
                  </ul>
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
          <Button variant="contained" type="button" className={styles['submit-button']} color="warning" onClick={onCreateFunding}>
            ?????? ????????????
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreateFundingContainer;
