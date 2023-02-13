/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import './StreamComponent.css';

import CountUp from 'react-countup';
import MicOff from '@material-ui/icons/MicOff';
import VideocamOff from '@material-ui/icons/VideocamOff';
import VolumeUp from '@material-ui/icons/VolumeUp';
import VolumeOff from '@material-ui/icons/VolumeOff';
import IconButton from '@material-ui/core/IconButton';
import Lottie from 'lottie-react';
import OvVideoComponent from './OvVideo';
import donationLottie from '../../../lotties/115250-hand-and-coin-donation-request.json';

export default class StreamComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { nickname: this.props.user.getNickname(), sessionId: this.props.sessionId };
  }

  componentDidMount() {
    // 일정 시간 지나면 도네이션 애니메이션 제거
    if (this.props.checkLottie) {
      setTimeout(() => {
        this.setState({ checkLottie: false });
      }, 3000);
    }
  }

  render() {
    console.log('Stream!!!!!!!!!!!!!!!!!!!!!!!!!!!!', this.state);
    // console.log(this.props.allAmount);
    return (
      <div className="OT_widget-container">
        <div className="info-box">
          <div className="nickname">
            <span>{this.state.sessionId}의 봉사 라이브 </span>

            {/* <span>현재 {this.props.userCount}명이 시청중입니다.</span> */}
          </div>
          <div className="count-box">
            <p className="left">LIVE</p>
            <p className="right">{this.props.userCount}</p>
          </div>

          <div className="allDonationAmount-box">
            <p className="allDonationAmount">
              총 후원금액 : <CountUp start={0} end={Number(this.props.allAmount)} separator="," duration={1} />원
            </p>
          </div>
        </div>

        {this.props.checkLottie && (
          <div className="donationAnimation-box">
            <p>{this.props.money}를 후원했습니다!!!!!</p>
            <Lottie animationData={donationLottie} />
          </div>
        )}

        {this.props.user !== undefined && this.props.user.getStreamManager() !== undefined ? (
          <div className="streamComponent">
            <OvVideoComponent user={this.props.user} mutedSound={this.state.mutedSound} />
            <div id="statusIcons">
              {!this.props.user.isVideoActive() ? (
                <div id="camIcon">
                  <VideocamOff id="statusCam" />
                </div>
              ) : null}

              {!this.props.user.isAudioActive() ? (
                <div id="micIcon">
                  <MicOff id="statusMic" />
                </div>
              ) : null}
            </div>
            <div>
              {!this.props.user.isLocal() && (
                <IconButton id="volumeButton" onClick={this.toggleSound}>
                  {this.state.mutedSound ? <VolumeOff color="secondary" /> : <VolumeUp />}
                </IconButton>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
