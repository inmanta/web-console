import React from "react";
import styled from "styled-components";
import { Timestamp } from "./Timestamp";

interface FrameProps {
  started?: Timestamp;
  completed?: Timestamp;
  success?: boolean | null;
}

export const Frame: React.FC<FrameProps> = ({
  started,
  completed,
  success,
}) => {
  const Definitions = () => (
    <defs>
      <path id="diffLine" d="M0,1 L200,1" />
      <path
        id="checkBullet"
        fill="#7ED321"
        d="M15,30 C6.71572875,30 0,23.2842712 0,15 C0,6.71572875 6.71572875,0 15,0 C23.2842712,0 30,6.71572875 30,15 C30,23.2842712 23.2842712,30 15,30 Z M6.26359303,15.6680213 L12.1135987,22.2054005 C12.4650561,22.5981933 13.0349043,22.5981933 13.3863969,22.2054398 L23.736407,10.639268 C24.0878643,10.2464752 24.0878643,9.60967004 23.736407,9.21691655 L22.463644,7.79456512 C22.1121866,7.40181163 21.5423033,7.40181163 21.1908459,7.79456512 L12.7499978,17.2271705 L8.80915411,12.8233184 C8.45769674,12.4305256 7.88781337,12.4305256 7.53635599,12.8233184 L6.26359303,14.2456698 C5.91213566,14.6384626 5.91213566,15.2752678 6.26359303,15.6680213 Z"
      />
      <g id="loadingBullet" fill="#D8D8D8">
        <path d="M15,30 C6.71572875,30 0,23.2842712 0,15 C0,6.71572875 6.71572875,0 15,0 C23.2842712,0 30,6.71572875 30,15 C30,23.2842712 23.2842712,30 15,30 Z M15,27.1428571 C21.7063148,27.1428571 27.1428571,21.7063148 27.1428571,15 C27.1428571,8.29368518 21.7063148,2.85714286 15,2.85714286 C8.29368518,2.85714286 2.85714286,8.29368518 2.85714286,15 C2.85714286,21.7063148 8.29368518,27.1428571 15,27.1428571 Z" />
        <StyledCircle cx="15" cy="15" r="7.5" />
      </g>
      <path
        id="failedBullet"
        fill="#c9190b"
        d="M 15 30 C 6.7157 30 0 23.2843 0 15 C 0 6.7157 6.7157 0 15 0 C 23.2843 0 30 6.7157 30 15 C 30 23.2843 23.2843 30 15 30 z M 12.7 5 l 0 12 c 0 0.546 0.42 1.014 0.84 1.014 h 3 c 0.48 0 0.84 -0.468 0.84 -1.014 l 0 -12 c 0 -0.624 -0.36 -1.17 -0.84 -1.17 h -3 c -0.48 0 -0.9 0.546 -0.84 1.17 M 15 26 c 1.386 0 2.541 -1.1088 2.541 -2.4948 s -1.155 -2.4948 -2.541 -2.5052 s -2.541 1.1088 -2.541 2.4948 s 1.155 2.4948 2.541 2.4948 z"
      ></path>
    </defs>
  );

  const Requested = () => <use xlinkHref="#checkBullet" />;

  const RequestedDiff = () => (
    <g stroke="#D2D2D2" strokeWidth="2" transform="translate(33 14)">
      <use xlinkHref="#diffLine" />
    </g>
  );

  const Started = () => (
    <g transform="translate(236)">
      {started ? (
        <use xlinkHref="#checkBullet" />
      ) : (
        <use xlinkHref="#loadingBullet" />
      )}
    </g>
  );

  const StartedDiff = () => (
    <g stroke="#D2D2D2" strokeWidth="2" transform="translate(269 14)">
      <use xlinkHref="#diffLine" />
    </g>
  );

  const Completed = () => (
    <g transform="translate(472)">
      {completed && !success && (
        <use xlinkHref="#failedBullet" aria-label="failedBullet" />
      )}
      {completed && success && (
        <use xlinkHref="#checkBullet" aria-label="checkBullet" />
      )}
      {!completed && started && (
        <use xlinkHref="#loadingBullet" aria-label="loadingBullet" />
      )}
      {!completed && !started && (
        <circle cx="15" cy="15" r="15" fill="#D2D2D2" />
      )}
    </g>
  );
  return (
    <FrameContainer>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="502"
        height="30"
        display="block"
      >
        <Definitions />
        <g fill="none" fillRule="evenodd">
          <Requested />
          <RequestedDiff />
          <Started />
          <StartedDiff />
          <Completed />
        </g>
      </svg>
    </FrameContainer>
  );
};

const FrameContainer = styled.div`
  padding: 50px 50px 60px 50px;
  width: auto;
`;

const StyledCircle = styled.circle`
  animation-duration: 1s;
  animation-name: pulse;
  animation-iteration-count: infinite;
  transform-origin: 50% 50%;
  transform-box: fill-box;

  @keyframes pulse {
    0% {
      transform: scale(0.7, 0.7);
    }

    50% {
      transform: scale(1, 1);
    }

    100% {
      transform: scale(0.7, 0.7);
    }
  }
`;
