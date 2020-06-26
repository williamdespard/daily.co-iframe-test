import React, { useRef, useEffect } from "react";

function Participant(props) {
  const videoEl = useRef({});
  const audioEl = useRef({});

  useEffect(() => {
    if (props.videoTrack) {
      // check if there is any element for current, they are getting removed between pages somehow
      if (!videoEl.current) {
        videoEl.current = {};
      }
      videoEl.current.srcObject = new MediaStream([props.videoTrack]);
    }
  }, [props.videoTrack, props.screenVideoTrack]);

  useEffect(() => {
    if (props.audioTrack) {
      // check if there is any element for current, they are getting removed between pages somehow
      if (!audioEl.current) {
        audioEl.current = {};
      }
      audioEl.current.srcObject = new MediaStream([props.audioTrack]);
    }
  }, [props.audioTrack]);

  function videoComponent() {
    return (
      props.videoTrack && (
        <>
          <video
            className="video h-full absolute top-0 left-50pc translate-x-50pc" // Video class needed for some reason
            autoPlay
            muted
            playsInline
            ref={videoEl}
          />
        </>
      )
    );
  }

  // Render audio
  function audioComponent() {
    return props.audioTrack && <audio autoPlay playsInline ref={audioEl} />;
  }
  return (
    <div>
      {videoComponent()}
      {!props.isLocal && audioComponent()}
    </div>
  );
}

export default Participant;
