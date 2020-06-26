import React, { useState, useEffect } from "react";
import DailyIframe from "@daily-co/daily-js";
import "./App.css";
import Participant from "./Participant";

function App() {
  const [globalParticipantTracks, setGlobalParticipantTracks] = useState({});
  const [localParticipantTracks, setLocalParticipantTracks] = useState({});
  const [globalCallObject, setGlobalCallObject] = useState(null);
  const [localCallObject, setLocalCallObject] = useState(null);
  const [joinedLocal, setJoinedLocal] = useState(false);

  // initialize call objects after render
  useEffect(() => {
    const globalObj = DailyIframe.createFrame({
      iframeStyle: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "0%",
        height: "0%",
      },
    });
    const localObj = DailyIframe.createCallObject();

    setGlobalCallObject(globalObj);
    setLocalCallObject(localObj);
  }, []);

  // join global channel after initialization
  useEffect(() => {
    (async () => {
      if (globalCallObject) {
        await globalCallObject.join({
          url: "https://example-embryo.daily.co/global",
          // videoOff audioOn token (these are generated from https://docs.daily.co/reference#create-meeting-token):
          // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1ZCI6IjEiLCJ2byI6dHJ1ZSwiYW8iOmZhbHNlLCJkIjoiOGMxZWIyYTMtMzYzMy00NTQ2LWI2YjAtYjk3NGFiYmJmNTA3IiwiaWF0IjoxNTkzMTczODI3fQ.GIuHX2ALwAU2bDMCO2BcnN1Y4eeEUxgiZTaAoceVSy0",

          // videoOff audioOff token (This is working)
          // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1ZCI6IjEiLCJ2byI6dHJ1ZSwiYW8iOnRydWUsImQiOiI4YzFlYjJhMy0zNjMzLTQ1NDYtYjZiMC1iOTc0YWJiYmY1MDciLCJpYXQiOjE1OTMxNzM3MjF9.aYRGQfEVLJzbn46HNglusDqIxwjEhcX3JNu4PB9TZT8"
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1ZCI6IjEiLCJ2byI6dHJ1ZSwiYW8iOmZhbHNlLCJkIjoiOGMxZWIyYTMtMzYzMy00NTQ2LWI2YjAtYjk3NGFiYmJmNTA3IiwiaWF0IjoxNTkzMTczODI3fQ.GIuHX2ALwAU2bDMCO2BcnN1Y4eeEUxgiZTaAoceVSy0",
        });
      }
    })();
    return () => {
      if (globalCallObject) {
        globalCallObject.leave();
      }
    };
  }, [globalCallObject]);

  // store media objects for global
  useEffect(() => {
    if (!globalCallObject) return;
    const cleanUpEvents = handleParticipantEvents(
      globalCallObject,
      setGlobalParticipantTracks
    );
    return () => {
      cleanUpEvents();
    };
  }, [globalCallObject]);

  // store media objects for local
  useEffect(() => {
    if (!localCallObject) return;
    const cleanUpEvents = handleParticipantEvents(
      localCallObject,
      setLocalParticipantTracks
    );
    return () => {
      cleanUpEvents();
    };
  }, [localCallObject]);

  // function to handle participant updates
  function handleParticipantEvents(callObject, setParticipants, note) {
    const participantEvents = [
      "participant-joined",
      "participant-updated",
      "participant-left",
    ];
    function handleNewParticipantState(event) {
      setParticipants({ ...callObject.participants() });
    }

    // set function for events
    for (const event of participantEvents) {
      callObject.on(event, handleNewParticipantState);
    }

    // return a function to unregister the events
    return () => {
      for (const event of participantEvents) {
        callObject.off(event, handleNewParticipantState);
      }
    };
  }
  // function to join to the local room
  async function handleLocalClick() {
    if (joinedLocal) {
      await localCallObject.leave();
      await globalCallObject.join();
      setJoinedLocal(false);
    }
    // leave the global
    else {
      globalCallObject.leave();
      if (localCallObject) {
        await localCallObject.join({
          url: "https://example-embryo.daily.co/local",
        });
      }
      setJoinedLocal(true);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        Global channel is by default, you can open/close local channel, When
        local is closed you will hear audio from global
        <button onClick={handleLocalClick}>
          Click to {joinedLocal ? "leave" : "join"} local
        </button>
      </header>
      {Object.entries(localParticipantTracks).map(([key, localParticipant]) => {
        console.log("This is local", localParticipant);
        return (
          <Participant
            key={localParticipant.user_id}
            videoTrack={localParticipant.videoTrack}
            audioTrack={localParticipant.audioTrack}
            isLocal={localParticipant.local}
          />
        );
      })}
      <iframe id="global-call-iframe"></iframe>
    </div>
  );
}

export default App;
